"use client";

import { useMemo, useState } from "react";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

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
    <PageWrapper>
      <PageCard color="blue">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#39b7ff]/30 bg-[#39b7ff]/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#2f2461]/70">
            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_16px_rgba(57,183,255,0.6)]" />
            SCORE IMPORT
          </div>
        </div>

        <SectionHeader color="blue">Import maimai DX NET JSON</SectionHeader>

        <p className="mb-8 text-center text-sm font-medium leading-6 text-[#2f2461]/70 max-w-3xl mx-auto">
          Paste the exported JSON from your bookmarklet here to verify and preview the parsed scores.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">PASTE JSON</div>
            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              placeholder={`{\n  "schema": "..."\n}`}
              className="mt-4 h-[420px] w-full resize-none rounded-2xl border border-[#2f2461]/20 bg-[#17061f] p-4 font-mono text-xs text-white/80 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
            />

            {!raw ? (
              <div className="mt-3 text-xs text-[#2f2461]/45">Waiting for JSON…</div>
            ) : parsed.ok ? null : (
              <div className="mt-3 rounded-xl border border-red-400/30 bg-red-50 p-3 text-xs text-red-600 ring-1 ring-red-400/20">
                Invalid JSON: {parsed.error}
              </div>
            )}

            {raw && parsed.ok && !payload ? (
              <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-50 p-3 text-xs text-amber-700 ring-1 ring-amber-300/20">
                JSON parsed, but schema is not recognized.
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">PREVIEW</div>

            {payload && summary ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/80 p-4 space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-[#2f2461]/55">Schema</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#2f2461]">{payload.schema}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2f2461]/55">Origin</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#2f2461]">{payload.origin}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#2f2461]/55">Exported</div>
                    <div className="mt-0.5 text-sm font-semibold text-[#2f2461]">
                      {new Date(payload.exportedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/80 p-4">
                  <div className="text-sm font-semibold text-[#2f2461]">Total scores: {summary.total}</div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {Array.from(summary.byDiff.entries()).map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl border border-[#2f2461]/10 bg-[#2f2461]/5 px-3 py-2"
                      >
                        <div className="font-bold tracking-widest text-[#2f2461]/55">{k}</div>
                        <div className="mt-1 text-sm font-semibold text-[#2f2461]">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-40 overflow-y-auto rounded-2xl border border-[#2f2461]/10 bg-white/80 p-4">
                  <div className="text-xs font-semibold text-[#2f2461]/55">Sample</div>
                  <div className="mt-3 overflow-auto">
                    <table className="min-w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="text-[#2f2461]/55">
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
                            <tr key={idx} className="border-t border-[#2f2461]/8 text-[#2f2461]/75">
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
              <div className="mt-4 text-sm text-[#2f2461]/50">Paste your exported JSON to see a preview.</div>
            )}
          </div>
        </div>
      </PageCard>
    </PageWrapper>
  );
}
