"use client";

import { useEffect, useMemo, useState } from "react";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

type ChartType = "STD" | "DX" | "UTAGE" | "UNKNOWN";
type Difficulty = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "REMASTER" | "UNKNOWN";
type RatingSource = "displayed" | "estimated" | "unknown";

type ImportedScore = {
  songName: string;
  genre: string | null;
  chartType: ChartType;
  difficulty: Difficulty;
  levelText: string | null;
  internalLevel: number | null;
  achievement: number | null;
  rank: string | null;
  fcap: string | null;
  sync: string | null;
  dxScore: { player: number; max: number; ratio: number; star: number } | null;
};

type ImportedRating = {
  songName: string;
  genre: string | null;
  chartType: ChartType;
  difficulty: Difficulty;
  levelText: string | null;
  internalLevel: number | null;
  achievement: number | null;
  rank: string | null;
  rating: number | null;
  ratingSource: RatingSource;
  songIdx: string | null;
};

type ExportPayload = {
  schema: string;
  origin: string;
  exportedAt: number;
  score: ImportedScore[];
  rating: ImportedRating[];
};

type ImportMessage = {
  type: "DMMC_MAIMAI_IMPORT";
  payload: unknown;
};

const WINDOW_NAME_PREFIX = "DMMC_MAIMAI_IMPORT:";
const LOCAL_STORAGE_KEY = "dmmc.my-score.payload";

function isNewSongLabel(label: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return (
    l.includes("new") ||
    l.includes("new songs") ||
    l.includes("prism") ||
    l.includes("circle") ||
    l.includes("新")
  );
}

function isOldSongLabel(label: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return l.includes("old") || l.includes("old songs") || l.includes("旧");
}

function toChartType(value: unknown): ChartType {
  if (value === "STD" || value === "DX" || value === "UTAGE") return value;
  return "UNKNOWN";
}

function toDifficulty(value: unknown): Difficulty {
  if (value === "BASIC" || value === "ADVANCED" || value === "EXPERT" || value === "MASTER" || value === "REMASTER") {
    return value;
  }
  return "UNKNOWN";
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function coerceScore(value: unknown): ImportedScore | null {
  if (!value || typeof value !== "object") return null;
  const s = value as Record<string, unknown>;
  const songName = typeof s.songName === "string" ? s.songName : "";
  if (!songName) return null;

  let dxScore: ImportedScore["dxScore"] = null;
  if (s.dxScore && typeof s.dxScore === "object") {
    const d = s.dxScore as Record<string, unknown>;
    const player = toNullableNumber(d.player);
    const max = toNullableNumber(d.max);
    const ratio = toNullableNumber(d.ratio);
    const star = toNullableNumber(d.star);
    if (player != null && max != null && ratio != null && star != null) {
      dxScore = { player, max, ratio, star };
    }
  }

  return {
    songName,
    genre: toNullableString(s.genre),
    chartType: toChartType(s.chartType),
    difficulty: toDifficulty(s.difficulty),
    levelText: toNullableString(s.levelText),
    internalLevel: toNullableNumber(s.internalLevel),
    achievement: toNullableNumber(s.achievement),
    rank: toNullableString(s.rank),
    fcap: toNullableString(s.fcap),
    sync: toNullableString(s.sync),
    dxScore,
  };
}

function coerceRating(value: unknown): ImportedRating | null {
  if (!value || typeof value !== "object") return null;
  const r = value as Record<string, unknown>;
  const songName = typeof r.songName === "string" ? r.songName : "";
  if (!songName) return null;

  const source: RatingSource =
    r.ratingSource === "displayed" || r.ratingSource === "estimated" ? r.ratingSource : "unknown";

  return {
    songName,
    genre: toNullableString(r.genre),
    chartType: toChartType(r.chartType),
    difficulty: toDifficulty(r.difficulty),
    levelText: toNullableString(r.levelText),
    internalLevel: toNullableNumber(r.internalLevel),
    achievement: toNullableNumber(r.achievement),
    rank: toNullableString(r.rank),
    rating: toNullableNumber(r.rating),
    ratingSource: source,
    songIdx: toNullableString(r.songIdx),
  };
}

function coercePayload(value: unknown): ExportPayload | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (typeof obj.schema !== "string") return null;
  if (typeof obj.origin !== "string") return null;
  if (typeof obj.exportedAt !== "number") return null;

  const rawScore = Array.isArray(obj.score) ? obj.score : Array.isArray(obj.scores) ? obj.scores : null;
  if (!rawScore) return null;

  const score = rawScore.map(coerceScore).filter((x): x is ImportedScore => x != null);
  const rating = (Array.isArray(obj.rating) ? obj.rating : [])
    .map(coerceRating)
    .filter((x): x is ImportedRating => x != null);

  return {
    schema: obj.schema,
    origin: obj.origin,
    exportedAt: obj.exportedAt,
    score,
    rating,
  };
}

function readFromWindowName(): { payload: ExportPayload | null; shouldClear: boolean } {
  try {
    const raw = typeof window !== "undefined" && typeof window.name === "string" ? window.name : "";
    if (!raw.startsWith(WINDOW_NAME_PREFIX)) {
      return { payload: null, shouldClear: false };
    }
    const jsonText = raw.slice(WINDOW_NAME_PREFIX.length);
    const parsed = JSON.parse(jsonText) as unknown;
    return { payload: coercePayload(parsed), shouldClear: true };
  } catch {
    return { payload: null, shouldClear: true };
  }
}

function readSavedPayload(): ExportPayload | null {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return coercePayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

type InitialState = {
  payload: ExportPayload | null;
  status: string;
  shouldClearWindowName: boolean;
};

function getInitialState(): InitialState {
  if (typeof window === "undefined") {
    return {
      payload: null,
      status: "Waiting for bookmarklet...",
      shouldClearWindowName: false,
    };
  }

  const saved = readSavedPayload();
  const incoming = readFromWindowName();

  if (incoming.payload) {
    return {
      payload: incoming.payload,
      status: `Received ${incoming.payload.score.length} scores and ${incoming.payload.rating.length} ratings.`,
      shouldClearWindowName: incoming.shouldClear,
    };
  }

  if (incoming.shouldClear) {
    return {
      payload: saved,
      status: "Received data, but schema is not recognized.",
      shouldClearWindowName: true,
    };
  }

  if (saved) {
    return {
      payload: saved,
      status: `Loaded saved data (${saved.score.length} scores, ${saved.rating.length} ratings).`,
      shouldClearWindowName: false,
    };
  }

  return {
    payload: null,
    status: "Waiting for bookmarklet...",
    shouldClearWindowName: false,
  };
}

export default function MyScorePage() {
  const initialState = useMemo(() => getInitialState(), []);
  const [payload, setPayload] = useState<ExportPayload | null>(() => initialState.payload);
  const [status, setStatus] = useState(() => initialState.status);

  useEffect(() => {
    if (initialState.shouldClearWindowName) {
      try {
        window.name = "";
      } catch {
        // Ignore window.name reset errors.
      }
    }

    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as unknown;
      if (!data || typeof data !== "object") return;
      const msg = data as Partial<ImportMessage>;
      if (msg.type !== "DMMC_MAIMAI_IMPORT") return;

      const coerced = coercePayload((msg as ImportMessage).payload);
      if (!coerced) {
        setStatus("Received data, but schema is not recognized.");
        return;
      }

      setPayload(coerced);
      setStatus(`Received ${coerced.score.length} scores and ${coerced.rating.length} ratings.`);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [initialState.shouldClearWindowName]);

  useEffect(() => {
    if (!payload) return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore localStorage failures.
    }
  }, [payload]);

  const summary = useMemo(() => {
    if (!payload) return null;

    const scoreByDiff = new Map<Difficulty, number>();
    for (const s of payload.score) {
      scoreByDiff.set(s.difficulty, (scoreByDiff.get(s.difficulty) ?? 0) + 1);
    }

    const ratingBySource = new Map<RatingSource, number>();
    let ratingSum = 0;
    let ratingCount = 0;
    for (const r of payload.rating) {
      ratingBySource.set(r.ratingSource, (ratingBySource.get(r.ratingSource) ?? 0) + 1);
      if (typeof r.rating === "number") {
        ratingSum += r.rating;
        ratingCount += 1;
      }
    }

    return {
      scoreTotal: payload.score.length,
      ratingTotal: payload.rating.length,
      scoreByDiff,
      ratingBySource,
      ratingSum,
      ratingCount,
    };
  }, [payload]);

  const sortedScores = useMemo(() => {
    if (!payload) return [];
    return payload.score
      .filter((s) => s.achievement != null)
      .sort((a, b) => (b.achievement as number) - (a.achievement as number));
  }, [payload]);

  const ratingByRule = useMemo(() => {
    if (!payload) return { topNew: [] as ImportedRating[], topOld: [] as ImportedRating[], total: 0 };

    const rated = payload.rating.filter((r) => r.rating != null);
    if (rated.length === 0) return { topNew: [] as ImportedRating[], topOld: [] as ImportedRating[], total: 0 };

    const explicitNew = rated.filter((r) => isNewSongLabel(r.genre));
    const explicitOld = rated.filter((r) => isOldSongLabel(r.genre));

    let newPool: ImportedRating[] = [];
    let oldPool: ImportedRating[] = [];

    if (explicitNew.length > 0 || explicitOld.length > 0) {
      newPool = explicitNew;
      oldPool = explicitOld.length > 0 ? explicitOld : rated.filter((r) => !isNewSongLabel(r.genre));
    } else {
      // Fallback: rating page usually has new songs section first, then old songs.
      const orderedGenres: string[] = [];
      for (const r of rated) {
        const g = r.genre ?? "";
        if (!orderedGenres.includes(g)) orderedGenres.push(g);
      }
      if (orderedGenres.length >= 2) {
        const first = orderedGenres[0];
        newPool = rated.filter((r) => (r.genre ?? "") === first);
        oldPool = rated.filter((r) => (r.genre ?? "") !== first);
      } else {
        // Last fallback: no section labels found. Keep old as full pool.
        newPool = rated.slice(0, 15);
        oldPool = rated;
      }
    }

    const sortByRating = (a: ImportedRating, b: ImportedRating) => (b.rating as number) - (a.rating as number);
    const topNew = newPool.sort(sortByRating).slice(0, 15);
    const topOld = oldPool.sort(sortByRating).slice(0, 50);
    const total =
      topNew.reduce((sum, r) => sum + (r.rating ?? 0), 0) +
      topOld.reduce((sum, r) => sum + (r.rating ?? 0), 0);
    return { topNew, topOld, total };
  }, [payload]);

  function clearSaved() {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore localStorage failures.
    }
    setPayload(null);
    setStatus("Cleared saved data.");
  }

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

        <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/45 mb-1">STATUS</div>
            <div className="text-sm font-semibold text-[#2f2461]/80">{status}</div>
          </div>
          <button
            type="button"
            onClick={clearSaved}
            className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2f2461]/70 hover:bg-white hover:text-[#2f2461]"
          >
            Clear Saved
          </button>
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

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4">
                <div className="text-sm font-semibold text-[#2f2461]/80">Scores: {summary.scoreTotal}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {Array.from(summary.scoreByDiff.entries()).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[#2f2461]/10 bg-white/80 px-3 py-2">
                      <div className="font-bold tracking-widest text-[#2f2461]/45">{k}</div>
                      <div className="mt-1 text-sm font-semibold text-[#2f2461]/80">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4">
                <div className="text-sm font-semibold text-[#2f2461]/80">Ratings: {summary.ratingTotal}</div>
                <div className="mt-1 text-xs text-[#2f2461]/60">Total selected rating: {ratingByRule.total}</div>
                <div className="mt-3 grid grid-cols-1 gap-2 text-xs">
                  {Array.from(summary.ratingBySource.entries()).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-[#2f2461]/10 bg-white/80 px-3 py-2">
                      <div className="font-bold tracking-widest text-[#2f2461]/45">{k}</div>
                      <div className="mt-1 text-sm font-semibold text-[#2f2461]/80">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PageCard>

          <PageCard color="pink">
            <SectionHeader color="pink">Top Scores (Highest to Lowest)</SectionHeader>
            <div className="overflow-auto rounded-2xl border border-[#2f2461]/10 bg-white/60 ring-1 ring-[#2f2461]/5 h-72 overflow-y-auto">
              <table className="min-w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="text-[#2f2461]/55 border-b border-[#2f2461]/10">
                    <th className="px-3 py-3 font-bold tracking-widest">SONG</th>
                    <th className="px-3 py-3 font-bold tracking-widest">LEVEL</th>
                    <th className="px-3 py-3 font-bold tracking-widest">TYPE</th>
                    <th className="px-3 py-3 font-bold tracking-widest">ACHV</th>
                    <th className="px-3 py-3 font-bold tracking-widest">RANK</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedScores.slice(0, 50).map((s, idx) => (
                    <tr key={`${s.songName}-${idx}`} className="border-t border-[#2f2461]/8 text-[#2f2461]/80">
                      <td className="max-w-[280px] truncate px-3 py-2" title={s.songName}>
                        {s.songName}
                      </td>
                      <td className="px-3 py-2">{s.levelText ?? "-"}</td>
                      <td className="px-3 py-2">{s.chartType}</td>
                      <td className="px-3 py-2">
                        {typeof s.achievement === "number" ? `${s.achievement.toFixed(4)}%` : "-"}
                      </td>
                      <td className="px-3 py-2">{s.rank ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PageCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-12">
            <PageCard color="yellow">
              <SectionHeader color="yellow">Top 15 New Songs (PRiSM PLUS + CiRCLE)</SectionHeader>
              <div className="overflow-auto rounded-2xl border border-[#2f2461]/10 bg-white/60 ring-1 ring-[#2f2461]/5 h-72 overflow-y-auto">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="text-[#2f2461]/55 border-b border-[#2f2461]/10">
                      <th className="px-3 py-3 font-bold tracking-widest">SONG</th>
                      <th className="px-3 py-3 font-bold tracking-widest">LEVEL</th>
                      <th className="px-3 py-3 font-bold tracking-widest">RATING</th>
                      <th className="px-3 py-3 font-bold tracking-widest">SOURCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratingByRule.topNew.map((r, idx) => (
                      <tr key={`new-${r.songName}-${idx}`} className="border-t border-[#2f2461]/8 text-[#2f2461]/80">
                        <td className="max-w-[280px] truncate px-3 py-2" title={r.songName}>
                          {r.songName}
                        </td>
                        <td className="px-3 py-2">{r.levelText ?? "-"}</td>
                        <td className="px-3 py-2">{typeof r.rating === "number" ? r.rating : "-"}</td>
                        <td className="px-3 py-2">{r.ratingSource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageCard>

            <PageCard color="blue">
              <SectionHeader color="blue">Top 50 Old Songs (Any Version)</SectionHeader>
              <div className="overflow-auto rounded-2xl border border-[#2f2461]/10 bg-white/60 ring-1 ring-[#2f2461]/5 h-72 overflow-y-auto">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="text-[#2f2461]/55 border-b border-[#2f2461]/10">
                      <th className="px-3 py-3 font-bold tracking-widest">SONG</th>
                      <th className="px-3 py-3 font-bold tracking-widest">LEVEL</th>
                      <th className="px-3 py-3 font-bold tracking-widest">RATING</th>
                      <th className="px-3 py-3 font-bold tracking-widest">SOURCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ratingByRule.topOld.map((r, idx) => (
                      <tr key={`old-${r.songName}-${idx}`} className="border-t border-[#2f2461]/8 text-[#2f2461]/80">
                        <td className="max-w-[280px] truncate px-3 py-2" title={r.songName}>
                          {r.songName}
                        </td>
                        <td className="px-3 py-2">{r.levelText ?? "-"}</td>
                        <td className="px-3 py-2">{typeof r.rating === "number" ? r.rating : "-"}</td>
                        <td className="px-3 py-2">{r.ratingSource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </PageCard>
          </div>
        </>
      ) : null}
    </PageWrapper>
  );
}
