"use client";

import { useMemo, useState } from "react";

type ImportedScore = {
  songName: string;
  genre: string | null;
  chartType: "STD" | "DX" | "UTAGE" | "UNKNOWN";
  difficulty: "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "REMASTER" | "UNKNOWN";
  levelText: string | null;
  internalLevel: number | null;
  achievement: number | null;
  rank: string | null;
  fcap: string | null;
  sync: string | null;
  dxScore: { player: number; max: number; ratio: number; star: number } | null;
};

type ExportPayload = {
  schema: string;
  origin: string;
  exportedAt: number;
  scores: ImportedScore[];
};

function safeParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function coercePayload(value: unknown): ExportPayload | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (typeof obj.schema !== "string") return null;
  if (typeof obj.origin !== "string") return null;
  if (typeof obj.exportedAt !== "number") return null;
  if (!Array.isArray(obj.scores)) return null;

  const scores: ImportedScore[] = obj.scores
    .map((x): ImportedScore | null => {
      if (!x || typeof x !== "object") return null;
      const s = x as Record<string, unknown>;
      const songName = typeof s.songName === "string" ? s.songName : "";
      if (!songName) return null;

      const chartTypeRaw = typeof s.chartType === "string" ? s.chartType : "UNKNOWN";
      const chartType =
        chartTypeRaw === "STD" || chartTypeRaw === "DX" || chartTypeRaw === "UTAGE" ? chartTypeRaw : "UNKNOWN";

      const difficultyRaw = typeof s.difficulty === "string" ? s.difficulty : "UNKNOWN";
      const difficulty =
        difficultyRaw === "BASIC" ||
        difficultyRaw === "ADVANCED" ||
        difficultyRaw === "EXPERT" ||
        difficultyRaw === "MASTER" ||
        difficultyRaw === "REMASTER"
          ? difficultyRaw
          : "UNKNOWN";

      const levelText = typeof s.levelText === "string" ? s.levelText : null;
      const internalLevel = typeof s.internalLevel === "number" ? s.internalLevel : null;
      const achievement = typeof s.achievement === "number" ? s.achievement : null;
      const rank = typeof s.rank === "string" ? s.rank : null;
      const fcap = typeof s.fcap === "string" ? s.fcap : null;
      const sync = typeof s.sync === "string" ? s.sync : null;
      const genre = typeof s.genre === "string" ? s.genre : null;

      let dxScore: ImportedScore["dxScore"] = null;
      if (s.dxScore && typeof s.dxScore === "object") {
        const d = s.dxScore as Record<string, unknown>;
        const player = typeof d.player === "number" ? d.player : NaN;
        const max = typeof d.max === "number" ? d.max : NaN;
        const ratio = typeof d.ratio === "number" ? d.ratio : NaN;
        const star = typeof d.star === "number" ? d.star : NaN;
        if ([player, max, ratio, star].every((n) => Number.isFinite(n))) {
          dxScore = { player, max, ratio, star };
        }
      }

      return {
        songName,
        genre,
        chartType,
        difficulty,
        levelText,
        internalLevel,
        achievement,
        rank,
        fcap,
        sync,
        dxScore,
      };
    })
    .filter((x): x is ImportedScore => x != null);

  return {
    schema: obj.schema,
    origin: obj.origin,
    exportedAt: obj.exportedAt,
    scores,
  };
}

export default function ImportScoresPage() {
  const [raw, setRaw] = useState("");
  const parsed = useMemo(() => safeParseJson(raw), [raw]);

  const payload = useMemo(() => {
    if (!parsed.ok) return null;
    return coercePayload(parsed.value);
  }, [parsed]);

  const summary = useMemo(() => {
    if (!payload) return null;
    const total = payload.scores.length;
    const byDiff = new Map<string, number>();
    for (const s of payload.scores) {
      byDiff.set(s.difficulty, (byDiff.get(s.difficulty) ?? 0) + 1);
    }
    return { total, byDiff };
  }, [payload]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-white/80">
          <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_16px_rgba(57,183,255,0.6)]" />
          SCORE IMPORT
        </div>

        <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
          Import maimai DX NET JSON
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Paste the exported JSON from your bookmarklet here to verify and preview the parsed scores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
          <div className="text-xs font-bold tracking-widest text-white/60">PASTE JSON</div>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
            placeholder={`{\n  "schema": "..."\n}`}
            className="mt-4 h-[420px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/85 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
          />

          {!raw ? (
            <div className="mt-3 text-xs text-white/50">Waiting for JSON…</div>
          ) : parsed.ok ? null : (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200 ring-1 ring-red-500/20">
              Invalid JSON: {parsed.error}
            </div>
          )}

          {raw && parsed.ok && !payload ? (
            <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-100 ring-1 ring-amber-300/20">
              JSON parsed, but schema is not recognized.
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
          <div className="text-xs font-bold tracking-widest text-white/60">PREVIEW</div>

          {payload && summary ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/10">
                <div className="text-xs font-semibold text-white/70">Schema</div>
                <div className="mt-1 text-sm font-semibold text-white/90">{payload.schema}</div>
                <div className="mt-3 text-xs font-semibold text-white/70">Origin</div>
                <div className="mt-1 text-sm font-semibold text-white/90">{payload.origin}</div>
                <div className="mt-3 text-xs font-semibold text-white/70">Exported</div>
                <div className="mt-1 text-sm font-semibold text-white/90">
                  {new Date(payload.exportedAt).toLocaleString()}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/10">
                <div className="text-sm font-semibold text-white/90">Total scores: {summary.total}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                  {Array.from(summary.byDiff.entries()).map(([k, v]) => (
                    <div
                      key={k}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 ring-1 ring-white/10"
                    >
                      <div className="font-bold tracking-widest text-white/60">{k}</div>
                      <div className="mt-1 text-sm font-semibold text-white/85">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/10 h-40 overflow-y-auto">
                <div className="text-xs font-semibold text-white/70">Sample</div>
                <div className="mt-3 overflow-auto">
                  <table className="min-w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="text-white/70">
                        <th className="px-2 py-2">Song</th>
                        <th className="px-2 py-2">Diff</th>
                        <th className="px-2 py-2">Type</th>
                        <th className="px-2 py-2">Achv</th>
                        <th className="px-2 py-2">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payload.scores
                        .filter((s) => s.achievement !== null)
                        .sort((a, b) => b.achievement! - a.achievement!)
                        .map((s, idx) => (
                          <tr key={idx} className="border-t border-white/10 text-white/85">
                            <td className="max-w-[240px] truncate px-2 py-2" title={s.songName}>
                              {s.songName}
                            </td>
                            <td className="px-2 py-2">{s.levelText}</td>
                            <td className="px-2 py-2">{s.chartType}</td>
                            <td className="px-2 py-2">
                              {typeof s.achievement === "number" ? s.achievement.toFixed(4) + "%" : ""}
                            </td>
                            <td className="px-2 py-2">{s.rank ?? ""}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/60">Paste your exported JSON to see a preview.</div>
          )}
        </div>
      </div>
    </div>
  );
}
