"use client";

import { useEffect, useMemo, useState } from "react";

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

type ImportMessage = {
  type: "DMMC_MAIMAI_IMPORT";
  payload: unknown;
};

function readImportFromWindowName(): { payload: ExportPayload | null; status: string; shouldClear: boolean } {
  try {
    const raw = typeof window !== "undefined" && typeof window.name === "string" ? window.name : "";
    const prefix = "DMMC_MAIMAI_IMPORT:";
    if (!raw.startsWith(prefix)) {
      return { payload: null, status: "Waiting for bookmarklet…", shouldClear: false };
    }

    const jsonText = raw.slice(prefix.length);
    const parsed = JSON.parse(jsonText) as unknown;
    const coerced = coercePayload(parsed);
    if (coerced) {
      return { payload: coerced, status: `Received ${coerced.scores.length} scores.`, shouldClear: true };
    }
    return { payload: null, status: "Received data, but schema not recognized.", shouldClear: true };
  } catch {
    return { payload: null, status: "Waiting for bookmarklet…", shouldClear: true };
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

export default function MyScorePage() {
  const [payload, setPayload] = useState<ExportPayload | null>(() => readImportFromWindowName().payload);
  const [status, setStatus] = useState<string>(() => readImportFromWindowName().status);

  useEffect(() => {
    const { shouldClear } = readImportFromWindowName();
    if (shouldClear) {
      try {
        window.name = "";
      } catch {}
    }

    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as unknown;
      if (!data || typeof data !== "object") return;
      const msg = data as Partial<ImportMessage>;
      if (msg.type !== "DMMC_MAIMAI_IMPORT") return;

      const coerced = coercePayload((msg as ImportMessage).payload);
      if (!coerced) {
        setStatus("Received data, but schema not recognized.");
        return;
      }

      setPayload(coerced);
      setStatus(`Received ${coerced.scores.length} scores.`);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

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
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.6)]" />
          MY SCORE
        </div>

        <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
          maimai DX NET import receiver
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Keep this tab open. When you run the bookmarklet on maimaidx-eng.com, it will send your exported scores here.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 ring-1 ring-white/10">
        <div className="text-xs font-bold tracking-widest text-white/60">STATUS</div>
        <div className="mt-2 text-sm font-semibold text-white/85">{status}</div>
      </div>

      {payload && summary ? (
        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 ring-1 ring-white/10">
            <div className="text-xs font-bold tracking-widest text-white/60">META</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/10">
              <div className="text-xs font-semibold text-white/70">Schema</div>
              <div className="mt-1 text-sm font-semibold text-white/90">{payload.schema}</div>
              <div className="mt-3 text-xs font-semibold text-white/70">Origin</div>
              <div className="mt-1 text-sm font-semibold text-white/90">{payload.origin}</div>
              <div className="mt-3 text-xs font-semibold text-white/70">Exported</div>
              <div className="mt-1 text-sm font-semibold text-white/90">
                {new Date(payload.exportedAt).toLocaleString()}
              </div>
            </div>

            {/* <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white/90">Total scores: {summary.total}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70">
                {Array.from(summary.byDiff.entries()).map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 ring-1 ring-white/10">
                    <div className="font-bold tracking-widest text-white/60">{k}</div>
                    <div className="mt-1 text-sm font-semibold text-white/85">{v}</div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 ring-1 ring-white/10">
            <div className="text-xs font-bold tracking-widest text-white/60">Your Score (Highest to Lowest)</div>
            <div className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/20 ring-1 ring-white/10 h-70 overflow-y-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="text-white/70">
                    <th className="px-3 py-3">Song</th>
                    <th className="px-3 py-3">Diff</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Achv</th>
                    <th className="px-3 py-3">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.scores
                    .filter((s) => s.achievement !== null)
                    .sort((a, b) => (b.achievement as number) - (a.achievement as number))
                    .map((s, idx) => (
                      <tr key={idx} className="border-t border-white/10 text-white/85">
                        <td className="max-w-[280px] truncate px-3 py-2" title={s.songName}>
                          {s.songName}
                        </td>
                        <td className="px-3 py-2">{s.levelText}</td>
                        <td className="px-3 py-2">{s.chartType}</td>
                        <td className="px-3 py-2">
                          {typeof s.achievement === "number" ? s.achievement.toFixed(4) + "%" : ""}
                        </td>
                        <td className="px-3 py-2">{s.rank ?? ""}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
