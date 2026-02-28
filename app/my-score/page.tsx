"use client";

import { useEffect, useMemo, useState } from "react";
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
    <PageWrapper>
      <PageCard color="green">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2cb869]/30 bg-[#2cb869]/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#2f2461]/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.6)]" />
            MY SCORE
          </div>
        </div>

        <SectionHeader color="green">maimai DX NET Import Receiver</SectionHeader>

        <p className="mb-6 text-center text-sm font-medium leading-6 text-[#2f2461]/70 max-w-3xl mx-auto">
          Keep this tab open. When you run the bookmarklet on maimaidx-eng.com, it will send your exported scores here.
        </p>

        <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4 text-center">
          <div className="text-xs font-bold tracking-widest text-[#2f2461]/45 mb-1">STATUS</div>
          <div className="text-sm font-semibold text-[#2f2461]/80">{status}</div>
        </div>
      </PageCard>

      {payload && summary ? (
        <>
          <PageCard color="blue">
            <SectionHeader color="blue">Import Meta</SectionHeader>
            <div className="mx-auto max-w-sm rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4 space-y-3">
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
          </PageCard>

          <PageCard color="pink" className="mb-12">
            <SectionHeader color="pink">Your Scores (Highest to Lowest)</SectionHeader>
            <div className="overflow-auto rounded-2xl border border-[#2f2461]/10 bg-white/60 ring-1 ring-[#2f2461]/5 h-70 overflow-y-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="text-[#2f2461]/55 border-b border-[#2f2461]/10">
                    <th className="px-3 py-3 font-bold tracking-widest">SONG</th>
                    <th className="px-3 py-3 font-bold tracking-widest">DIFF</th>
                    <th className="px-3 py-3 font-bold tracking-widest">TYPE</th>
                    <th className="px-3 py-3 font-bold tracking-widest">ACHV</th>
                    <th className="px-3 py-3 font-bold tracking-widest">RANK</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.scores
                    .filter((s) => s.achievement !== null)
                    .sort((a, b) => (b.achievement as number) - (a.achievement as number))
                    .map((s, idx) => (
                      <tr key={idx} className="border-t border-[#2f2461]/8 text-[#2f2461]/80">
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
          </PageCard>
        </>
      ) : null}
    </PageWrapper>
  );
}
