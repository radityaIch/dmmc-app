"use client";

import { Chart } from "chart.js/auto";
import type { Chart as ChartJS, ChartConfiguration } from "chart.js";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DifficultyChip } from "../components/DifficultyChip";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";
import { db } from "../lib/db";
import { maimaiCoverUrl } from "../lib/maimai";
import type { MaimaiSong } from "../lib/maimai";

type ChartType = "STD" | "DX" | "UTAGE" | "UNKNOWN";
type Difficulty = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "REMASTER" | "UNKNOWN";
type RatingSource = "displayed" | "estimated" | "unknown" | "db";

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

type ResolvedRating = ImportedRating & {
  resolvedInternalLevel: number | null;
  resolvedFromDb: boolean;
  finalRating: number | null;
  finalRatingSource: RatingSource;
  resolvedSongId: string | null;
  resolvedImageName: string | null;
  resolvedCoverUrl: string | null;
};

type ExportPayload = {
  schema: string;
  origin: string;
  exportedAt: number;
  playerName: string | null;
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

function normalizeTextKey(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/["'`’“”]/g, "");
}

function normalizeDifficultyForSheet(diff: Difficulty): "basic" | "advanced" | "expert" | "master" | "remaster" | null {
  if (diff === "BASIC") return "basic";
  if (diff === "ADVANCED") return "advanced";
  if (diff === "EXPERT") return "expert";
  if (diff === "MASTER") return "master";
  if (diff === "REMASTER") return "remaster";
  return null;
}

function normalizeChartTypeForSheet(chartType: ChartType): "dx" | "std" | null {
  if (chartType === "DX") return "dx";
  if (chartType === "STD") return "std";
  return null;
}

function chartTypeIcon(chartType: ChartType): string | null {
  if (chartType === "DX") return "/assets/images/type-dx.png";
  if (chartType === "STD") return "/assets/images/type-std.png";
  return null;
}

function formatInternalLevel(level: number | null): string {
  if (level == null || !Number.isFinite(level)) return "-";
  if (Number.isInteger(level)) return String(level);
  return level.toFixed(1);
}

function resolveCoverUrl(imageName: string | null): string | null {
  if (!imageName) return null;
  if (/^https?:\/\//i.test(imageName)) return imageName;
  return maimaiCoverUrl(imageName);
}

type RatingTier = {
  name: string;
  min: number;
  max: number | null;
  rangeLabel: string;
  chipClassName: string;
  valueClassName: string;
  badgeClassName: string;
};

const RATING_TIERS: RatingTier[] = [
  {
    name: "Splash+",
    min: 15000,
    max: null,
    rangeLabel: "15000~",
    chipClassName: "border-cyan-400/55 bg-[linear-gradient(135deg,#5fd6ff_0%,#4bb2ff_48%,#7f8dff_100%)]",
    valueClassName: "text-white",
    badgeClassName: "bg-cyan-100/95 text-cyan-700",
  },
  {
    name: "Rainbow",
    min: 14500,
    max: 14999,
    rangeLabel: "14500~14999",
    chipClassName: "border-yellow-300/60 bg-[linear-gradient(135deg,#fff4a7_0%,#ffe97a_45%,#ffd95f_100%)]",
    valueClassName: "text-[#705000]",
    badgeClassName: "bg-white/90 text-[#9d7500]",
  },
  {
    name: "Gold+",
    min: 14000,
    max: 14499,
    rangeLabel: "14000~14499",
    chipClassName: "border-amber-400/60 bg-[linear-gradient(135deg,#ffd95e_0%,#ffbf3a_45%,#f9a220_100%)]",
    valueClassName: "text-[#5c3300]",
    badgeClassName: "bg-white/90 text-[#8f5200]",
  },
  {
    name: "Sky",
    min: 13000,
    max: 13999,
    rangeLabel: "13000~13999",
    chipClassName: "border-sky-400/55 bg-[linear-gradient(135deg,#bceeff_0%,#8bd8ff_45%,#63c4ff_100%)]",
    valueClassName: "text-[#0b4d75]",
    badgeClassName: "bg-white/90 text-sky-700",
  },
  {
    name: "Bronze",
    min: 12000,
    max: 12999,
    rangeLabel: "12000~12999",
    chipClassName: "border-orange-500/60 bg-[linear-gradient(135deg,#ffb686_0%,#f48a56_45%,#d86a35_100%)]",
    valueClassName: "text-white",
    badgeClassName: "bg-orange-100/95 text-orange-700",
  },
  {
    name: "Violet",
    min: 10000,
    max: 11999,
    rangeLabel: "10000~11999",
    chipClassName: "border-fuchsia-400/60 bg-[linear-gradient(135deg,#d993ff_0%,#bf72ff_45%,#a95cf7_100%)]",
    valueClassName: "text-white",
    badgeClassName: "bg-fuchsia-100/95 text-fuchsia-700",
  },
  {
    name: "Rose",
    min: 7000,
    max: 9999,
    rangeLabel: "7000~9999",
    chipClassName: "border-rose-400/60 bg-[linear-gradient(135deg,#ff8e9b_0%,#ff6f83_45%,#ff5d78_100%)]",
    valueClassName: "text-white",
    badgeClassName: "bg-rose-100/95 text-rose-700",
  },
  {
    name: "Sun",
    min: 4000,
    max: 6999,
    rangeLabel: "4000~6999",
    chipClassName: "border-yellow-400/65 bg-[linear-gradient(135deg,#ffe86a_0%,#ffd34a_45%,#ffbf28_100%)]",
    valueClassName: "text-[#6e4b00]",
    badgeClassName: "bg-white/90 text-yellow-700",
  },
  {
    name: "Lime",
    min: 2000,
    max: 3999,
    rangeLabel: "2000~3999",
    chipClassName: "border-lime-400/60 bg-[linear-gradient(135deg,#9aef70_0%,#79df57_45%,#5dcb40_100%)]",
    valueClassName: "text-[#1f4e1b]",
    badgeClassName: "bg-lime-100/95 text-lime-700",
  },
  {
    name: "Blue",
    min: 1000,
    max: 1999,
    rangeLabel: "1000~1999",
    chipClassName: "border-blue-400/60 bg-[linear-gradient(135deg,#79dcff_0%,#5ac8ff_45%,#4ab7ff_100%)]",
    valueClassName: "text-[#0e4b7d]",
    badgeClassName: "bg-white/90 text-blue-700",
  },
  {
    name: "Light Blue",
    min: 0,
    max: 999,
    rangeLabel: "~999",
    chipClassName: "border-sky-300/60 bg-[linear-gradient(135deg,#a7ebff_0%,#84ddff_45%,#68cfff_100%)]",
    valueClassName: "text-[#0a4a74]",
    badgeClassName: "bg-white/90 text-sky-700",
  },
];

function getRatingTier(totalRating: number): RatingTier {
  const rating = Number.isFinite(totalRating) ? totalRating : 0;
  for (const tier of RATING_TIERS) {
    if (rating < tier.min) continue;
    if (tier.max == null || rating <= tier.max) return tier;
  }
  return RATING_TIERS[RATING_TIERS.length - 1];
}

type ScoreAnalytics = {
  averageAchievement: number | null;
  maxAchievement: number | null;
  apCount: number;
  fcCount: number;
  fsdCount: number;
  fsCount: number;
  difficultyLabels: string[];
  difficultyValues: number[];
  achievementBandLabels: string[];
  achievementBandValues: number[];
  chartTypeLabels: string[];
  chartTypeValues: number[];
  ratingSourceLabels: string[];
  ratingSourceValues: number[];
  top50ContributionLabels: string[];
  top50ContributionValues: number[];
};

function ratingFactorByAchievement(achievement: number): number {
  if (achievement >= 100.5) return 0.224;
  if (achievement >= 100) return 0.216;
  if (achievement >= 99.5) return 0.211;
  if (achievement >= 99) return 0.208;
  if (achievement >= 98) return 0.203;
  if (achievement >= 97) return 0.2;
  if (achievement >= 94) return 0.168;
  if (achievement >= 90) return 0.152;
  if (achievement >= 80) return 0.136;
  if (achievement >= 75) return 0.12;
  if (achievement >= 70) return 0.112;
  if (achievement >= 60) return 0.096;
  if (achievement >= 50) return 0.08;
  return 0.016;
}

function calculateChartRating(internalLevel: number | null, achievement: number | null): number | null {
  if (internalLevel == null || achievement == null || !Number.isFinite(achievement)) return null;
  const clampedAchv = Math.min(achievement, 100.5);
  const factor = ratingFactorByAchievement(clampedAchv);
  return Math.floor(Math.abs(internalLevel) * clampedAchv * factor);
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
    r.ratingSource === "displayed" || r.ratingSource === "estimated" || r.ratingSource === "db"
      ? r.ratingSource
      : "unknown";

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
    playerName: toNullableString(obj.playerName),
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
  const [cachedSongs, setCachedSongs] = useState<MaimaiSong[] | null>(null);

  const difficultyChartCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const achievementBandCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartTypeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ratingSourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const top50ContributionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartsRef = useRef<{
    difficulty: ChartJS | null;
    achievement: ChartJS | null;
    chartType: ChartJS | null;
    source: ChartJS | null;
    top50: ChartJS | null;
  }>({
    difficulty: null,
    achievement: null,
    chartType: null,
    source: null,
    top50: null,
  });

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

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const cached = await db.songCache.get("maimai-songs");
        if (!cancelled) {
          setCachedSongs(cached?.songs ?? null);
        }
      } catch {
        if (!cancelled) {
          setCachedSongs(null);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedScores = useMemo(() => {
    if (!payload) return [];
    return payload.score
      .filter((s) => s.achievement != null)
      .sort((a, b) => (b.achievement as number) - (a.achievement as number));
  }, [payload]);

  const resolvedRatings = useMemo(() => {
    if (!payload) return [] as ResolvedRating[];

    const scoreGenreByChart = new Map<string, string | null>();
    for (const s of payload.score) {
      const key = `${normalizeTextKey(s.songName)}|${s.chartType}|${s.difficulty}`;
      if (!scoreGenreByChart.has(key)) {
        scoreGenreByChart.set(key, s.genre);
      }
    }

    return payload.rating.map((rating): ResolvedRating => {
      const sheetType = normalizeChartTypeForSheet(rating.chartType);
      const sheetDifficulty = normalizeDifficultyForSheet(rating.difficulty);
      const scoreKey = `${normalizeTextKey(rating.songName)}|${rating.chartType}|${rating.difficulty}`;
      const scoreGenre = scoreGenreByChart.get(scoreKey);
      let resolvedInternalLevel: number | null = null;
      let resolvedSongId: string | null = null;
      let resolvedImageName: string | null = null;

      if (cachedSongs && sheetType && sheetDifficulty) {
        const titleKey = normalizeTextKey(rating.songName);
        let candidates = cachedSongs.filter((song) => normalizeTextKey(song.title) === titleKey);

        if (scoreGenre) {
          const genreKey = normalizeTextKey(scoreGenre);
          const genreMatched = candidates.filter((song) => normalizeTextKey(song.category) === genreKey);
          if (genreMatched.length > 0) {
            candidates = genreMatched;
          }
        }

        if (candidates.length > 0) {
          resolvedSongId = candidates[0].id;
          resolvedImageName = candidates[0].imageName;
        }

        type SheetCandidate = {
          internalLevelValue: number | null;
          levelValue: number;
          level: string;
          songId: string;
          imageName: string | null;
        };
        const matchedSheets: SheetCandidate[] = [];
        for (const song of candidates) {
          for (const sheet of song.sheets) {
            if (sheet.type !== sheetType || sheet.difficulty !== sheetDifficulty) continue;
            matchedSheets.push({
              internalLevelValue: sheet.internalLevelValue,
              levelValue: sheet.levelValue,
              level: sheet.level,
              songId: song.id,
              imageName: song.imageName,
            });
          }
        }

        const levelText = (rating.levelText ?? "").trim();
        const levelMatched = levelText
          ? matchedSheets.filter((sheet) => sheet.level.trim() === levelText)
          : matchedSheets;
        const picked = levelMatched.length > 0 ? levelMatched[0] : matchedSheets[0];
        if (picked) {
          resolvedInternalLevel = picked.internalLevelValue ?? picked.levelValue;
          resolvedSongId = picked.songId;
          resolvedImageName = picked.imageName;
        }
      }

      const fallbackInternal = rating.internalLevel;
      const internalForCalc = resolvedInternalLevel ?? fallbackInternal;
      const calculated = calculateChartRating(internalForCalc, rating.achievement);
      const finalRating = calculated ?? rating.rating;
      const resolvedFromDb = resolvedInternalLevel != null;
      const finalRatingSource: RatingSource = resolvedFromDb ? "db" : rating.ratingSource;

      return {
        ...rating,
        resolvedInternalLevel: internalForCalc,
        resolvedFromDb,
        finalRating,
        finalRatingSource,
        resolvedSongId,
        resolvedImageName,
        resolvedCoverUrl: resolveCoverUrl(resolvedImageName),
      };
    });
  }, [payload, cachedSongs]);

  const summary = useMemo(() => {
    if (!payload) return null;

    const scoreByDiff = new Map<Difficulty, number>();
    for (const s of payload.score) {
      scoreByDiff.set(s.difficulty, (scoreByDiff.get(s.difficulty) ?? 0) + 1);
    }

    const ratingBySource = new Map<RatingSource, number>();
    for (const r of resolvedRatings) {
      ratingBySource.set(r.finalRatingSource, (ratingBySource.get(r.finalRatingSource) ?? 0) + 1);
    }
    const resolvedFromDbCount = resolvedRatings.filter((r) => r.resolvedFromDb).length;

    return {
      scoreTotal: payload.score.length,
      ratingTotal: resolvedRatings.length,
      scoreByDiff,
      ratingBySource,
      resolvedFromDbCount,
    };
  }, [payload, resolvedRatings]);

  const ratingByRule = useMemo(() => {
    if (!payload) return { topNew: [] as ResolvedRating[], topOld: [] as ResolvedRating[], total: 0 };

    const rated = resolvedRatings.filter((r) => r.finalRating != null);
    if (rated.length === 0) return { topNew: [] as ResolvedRating[], topOld: [] as ResolvedRating[], total: 0 };

    const explicitNew = rated.filter((r) => isNewSongLabel(r.genre));
    const explicitOld = rated.filter((r) => isOldSongLabel(r.genre));

    let newPool: ResolvedRating[] = [];
    let oldPool: ResolvedRating[] = [];

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

    const sortByRating = (a: ResolvedRating, b: ResolvedRating) => (b.finalRating as number) - (a.finalRating as number);
    const topNew = newPool.sort(sortByRating).slice(0, 15);
    const topOld = oldPool.sort(sortByRating).slice(0, 35);
    const total =
      topNew.reduce((sum, r) => sum + (r.finalRating ?? 0), 0) +
      topOld.reduce((sum, r) => sum + (r.finalRating ?? 0), 0);
    return { topNew, topOld, total };
  }, [payload, resolvedRatings]);

  const top50Cards = useMemo(() => {
    const newCards = ratingByRule.topNew.map((rating, idx) => ({
      bucket: "NEW" as const,
      bucketRank: idx + 1,
      rating,
    }));
    const oldCards = ratingByRule.topOld.map((rating, idx) => ({
      bucket: "OLD" as const,
      bucketRank: idx + 1,
      rating,
    }));
    return [...newCards, ...oldCards];
  }, [ratingByRule]);

  const ratingTier = useMemo(() => getRatingTier(ratingByRule.total), [ratingByRule.total]);

  const analytics = useMemo<ScoreAnalytics | null>(() => {
    if (!payload) return null;

    const achvScores = payload.score.filter((s) => typeof s.achievement === "number");
    const averageAchievement =
      achvScores.length > 0
        ? achvScores.reduce((sum, s) => sum + (s.achievement as number), 0) / achvScores.length
        : null;
    const maxAchievement =
      achvScores.length > 0
        ? achvScores.reduce((best, s) => Math.max(best, s.achievement as number), 0)
        : null;

    const apCount = payload.score.filter((s) => (s.fcap ?? "").startsWith("AP")).length;
    const fcCount = payload.score.filter((s) => (s.fcap ?? "").startsWith("FC")).length;
    const fsdCount = payload.score.filter((s) => (s.sync ?? "").startsWith("FSD")).length;
    const fsCount = payload.score.filter((s) => (s.sync ?? "").startsWith("FS") && !(s.sync ?? "").startsWith("FSD")).length;

    const difficultyOrder: Difficulty[] = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "REMASTER"];
    const difficultyLabels = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "RE:MASTER"];
    const difficultyValues = difficultyOrder.map(
      (diff) => payload.score.filter((s) => s.difficulty === diff).length,
    );

    const achievementBandLabels = ["100.5+", "100.0-100.4999", "99.0-99.9999", "97.0-98.9999", "94.0-96.9999", "<94.0"];
    const achievementBandValues = [0, 0, 0, 0, 0, 0];
    for (const s of achvScores) {
      const value = s.achievement as number;
      if (value >= 100.5) achievementBandValues[0] += 1;
      else if (value >= 100) achievementBandValues[1] += 1;
      else if (value >= 99) achievementBandValues[2] += 1;
      else if (value >= 97) achievementBandValues[3] += 1;
      else if (value >= 94) achievementBandValues[4] += 1;
      else achievementBandValues[5] += 1;
    }

    const chartTypeLabels = ["DX", "STD", "UTAGE", "UNKNOWN"];
    const chartTypeValues = chartTypeLabels.map(
      (type) => payload.score.filter((s) => s.chartType === type).length,
    );

    const sourceOrder: RatingSource[] = ["db", "displayed", "estimated", "unknown"];
    const sourceLabelMap: Record<RatingSource, string> = {
      db: "IndexedDB",
      displayed: "Displayed",
      estimated: "Estimated",
      unknown: "Unknown",
    };
    const ratingSourceLabels = sourceOrder.map((source) => sourceLabelMap[source]);
    const ratingSourceValues = sourceOrder.map(
      (source) => resolvedRatings.filter((r) => r.finalRatingSource === source).length,
    );

    const top50ContributionLabels = ["Top 15 New", "Top 35 Old"];
    const top50ContributionValues = [
      ratingByRule.topNew.reduce((sum, item) => sum + (item.finalRating ?? 0), 0),
      ratingByRule.topOld.reduce((sum, item) => sum + (item.finalRating ?? 0), 0),
    ];

    return {
      averageAchievement,
      maxAchievement,
      apCount,
      fcCount,
      fsdCount,
      fsCount,
      difficultyLabels,
      difficultyValues,
      achievementBandLabels,
      achievementBandValues,
      chartTypeLabels,
      chartTypeValues,
      ratingSourceLabels,
      ratingSourceValues,
      top50ContributionLabels,
      top50ContributionValues,
    };
  }, [payload, resolvedRatings, ratingByRule]);

  useEffect(() => {
    if (!analytics) return;

    const destroyChart = (key: keyof typeof chartsRef.current) => {
      chartsRef.current[key]?.destroy();
      chartsRef.current[key] = null;
    };

    const makeChart = (
      key: keyof typeof chartsRef.current,
      canvas: HTMLCanvasElement | null,
      config: ChartConfiguration,
    ) => {
      destroyChart(key);
      if (!canvas) return;
      chartsRef.current[key] = new Chart(canvas, config);
    };

    makeChart("difficulty", difficultyChartCanvasRef.current, {
      type: "doughnut",
      data: {
        labels: analytics.difficultyLabels,
        datasets: [
          {
            data: analytics.difficultyValues,
            backgroundColor: ["#6ee267", "#fadf38", "#ff7a7b", "#9f51db", "#d7abff"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#2f2461", boxWidth: 12, font: { size: 11, weight: 700 } },
          },
        },
      },
    });

    makeChart("achievement", achievementBandCanvasRef.current, {
      type: "bar",
      data: {
        labels: analytics.achievementBandLabels,
        datasets: [
          {
            label: "Songs",
            data: analytics.achievementBandValues,
            backgroundColor: "#39b7ff",
            borderRadius: 8,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: "#2f2461", font: { size: 10, weight: 700 } },
            grid: { color: "rgba(47,36,97,0.08)" },
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#2f2461", font: { size: 10, weight: 700 }, precision: 0 },
            grid: { color: "rgba(47,36,97,0.08)" },
          },
        },
      },
    });

    makeChart("chartType", chartTypeCanvasRef.current, {
      type: "polarArea",
      data: {
        labels: analytics.chartTypeLabels,
        datasets: [
          {
            data: analytics.chartTypeValues,
            backgroundColor: ["#2da8ff", "#16c47f", "#ff7a7b", "#94a3b8"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#2f2461", boxWidth: 12, font: { size: 11, weight: 700 } },
          },
        },
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: "rgba(47,36,97,0.08)" },
          },
        },
      },
    });

    makeChart("source", ratingSourceCanvasRef.current, {
      type: "bar",
      data: {
        labels: analytics.ratingSourceLabels,
        datasets: [
          {
            label: "Ratings",
            data: analytics.ratingSourceValues,
            backgroundColor: ["#2cb869", "#39b7ff", "#ffb84d", "#94a3b8"],
            borderRadius: 8,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: "#2f2461", font: { size: 10, weight: 700 }, precision: 0 },
            grid: { color: "rgba(47,36,97,0.08)" },
          },
          y: {
            ticks: { color: "#2f2461", font: { size: 11, weight: 700 } },
            grid: { display: false },
          },
        },
      },
    });

    makeChart("top50", top50ContributionCanvasRef.current, {
      type: "doughnut",
      data: {
        labels: analytics.top50ContributionLabels,
        datasets: [
          {
            data: analytics.top50ContributionValues,
            backgroundColor: ["#4f9cff", "#ff67b9"],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#2f2461", boxWidth: 12, font: { size: 11, weight: 700 } },
          },
        },
      },
    });

    return () => {
      destroyChart("difficulty");
      destroyChart("achievement");
      destroyChart("chartType");
      destroyChart("source");
      destroyChart("top50");
    };
  }, [analytics]);

  function clearSaved() {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore localStorage failures.
    }
    setPayload(null);
    setStatus("Cleared saved data.");
  }

  function saveToJson() {
    if (!payload) return;
    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date(payload.exportedAt).toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `dmmc-my-score-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("Exported JSON file.");
    } catch {
      setStatus("Failed to export JSON file.");
    }
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

        <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/45 mb-1">STATUS</div>
            <div className="text-sm font-semibold text-[#2f2461]/80">{status}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveToJson}
              disabled={!payload}
              className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2f2461]/70 hover:bg-white hover:text-[#2f2461] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save JSON
            </button>
            <button
              type="button"
              onClick={clearSaved}
              className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2f2461]/70 hover:bg-white hover:text-[#2f2461]"
            >
              Clear Saved
            </button>
          </div>
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
                      <div>
                        <DifficultyChip difficulty={k} showIcon={false} />
                      </div>
                      <div className="mt-1 text-sm font-semibold text-[#2f2461]/80">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4">
                <div className="text-sm font-semibold text-[#2f2461]/80">PROFILE</div>
                <div className="mt-1 text-xs font-semibold tracking-wide text-[#2f2461]/65">
                  PLAYER: {payload.playerName ?? "Unknown"}
                </div>
                <div className="mt-3">
                  <div
                    className={`relative overflow-hidden rounded-2xl border p-3 shadow-[0_6px_18px_rgba(47,36,97,0.14)] ${ratingTier.chipClassName}`}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.45),transparent_48%)]" />
                    <div className="relative flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-black tracking-[0.2em] text-white/95">RATING</div>
                        <div className={`mt-1 text-3xl font-black leading-none ${ratingTier.valueClassName}`}>
                          {ratingByRule.total.toLocaleString("en-US")}
                        </div>
                      </div>
                      <div className={`rounded-xl px-2.5 py-1 text-[10px] font-black tracking-wider ${ratingTier.badgeClassName}`}>
                        {ratingTier.name}
                      </div>
                    </div>
                  </div>
                </div>
                {/* <div className="mt-2 text-xs font-semibold text-[#2f2461]/65">Tier Range: {ratingTier.rangeLabel}</div> */}
              </div>
            </div>
          </PageCard>

          {analytics ? (
            <PageCard color="blue">
              <SectionHeader color="blue">Performance Analytics</SectionHeader>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-[#2f2461]/10 bg-white/70 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">AVG ACHV</div>
                  <div className="mt-1 text-lg font-black text-[#2f2461]">
                    {analytics.averageAchievement != null ? `${analytics.averageAchievement.toFixed(4)}%` : "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#2f2461]/10 bg-white/70 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">MAX ACHV</div>
                  <div className="mt-1 text-lg font-black text-[#2f2461]">
                    {analytics.maxAchievement != null ? `${analytics.maxAchievement.toFixed(4)}%` : "-"}
                  </div>
                </div>
                <div className="rounded-xl border border-[#2f2461]/10 bg-white/70 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">AP / FC</div>
                  <div className="mt-1 text-lg font-black text-[#2f2461]">
                    {analytics.apCount} / {analytics.fcCount}
                  </div>
                </div>
                <div className="rounded-xl border border-[#2f2461]/10 bg-white/70 p-3">
                  <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">FSD / FS</div>
                  <div className="mt-1 text-lg font-black text-[#2f2461]">
                    {analytics.fsdCount} / {analytics.fsCount}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/70 p-4">
                  <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">DIFFICULTY SPREAD</div>
                  <div className="mt-2 h-56">
                    <canvas ref={difficultyChartCanvasRef} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/70 p-4">
                  <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">ACHIEVEMENT BANDS</div>
                  <div className="mt-2 h-56">
                    <canvas ref={achievementBandCanvasRef} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/70 p-4">
                  <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">CHART TYPE SPLIT</div>
                  <div className="mt-2 h-56">
                    <canvas ref={chartTypeCanvasRef} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/70 p-4">
                  <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">RATING SOURCE</div>
                  <div className="mt-2 h-56">
                    <canvas ref={ratingSourceCanvasRef} />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/70 p-4 lg:col-span-2">
                  <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">TOP 50 CONTRIBUTION</div>
                  <div className="mt-2 h-56">
                    <canvas ref={top50ContributionCanvasRef} />
                  </div>
                </div>
              </div>
            </PageCard>
          ) : null}

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
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <DifficultyChip difficulty={s.difficulty} />
                          <span className="font-semibold text-[#2f2461]/70">{s.levelText ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {chartTypeIcon(s.chartType) ? (
                          <Image
                            src={chartTypeIcon(s.chartType) as string}
                            alt={s.chartType}
                            width={28}
                            height={14}
                            className="h-4 w-auto"
                          />
                        ) : (
                          s.chartType
                        )}
                      </td>
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

          <PageCard color="yellow">
            <SectionHeader color="yellow">Best 50 (Top 15 New + Top 35 Old)</SectionHeader>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {top50Cards.map((item, idx) => {
                const r = item.rating;
                const typeIcon = chartTypeIcon(r.chartType);
                return (
                  <div
                    key={`${item.bucket}-${r.songIdx ?? "no-idx"}-${r.songName}-${idx}`}
                    className="rounded-2xl border border-[#2f2461]/10 bg-white/80 p-3 ring-1 ring-[#2f2461]/5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[#2f2461]/10 bg-[#2f2461]/5 ring-1 ring-[#2f2461]/5">
                        {r.resolvedCoverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={r.resolvedCoverUrl}
                            alt={r.songName}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] font-black tracking-widest text-[#2f2461]/40">
                            DMMC
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(47,36,97,0.06)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">
                              {item.bucket} #{item.bucketRank}
                            </div>
                            <div className="truncate text-sm font-black text-[#2f2461]" title={r.songName}>
                              {r.songName}
                            </div>
                            <div className="mt-0.5 truncate text-[11px] font-semibold text-[#2f2461]/60">
                              {r.genre ?? "-"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/45">RATING</div>
                            <div className="text-lg font-black leading-none text-[#2f2461]">
                              {typeof r.finalRating === "number" ? r.finalRating : "-"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {typeIcon ? (
                            <Image quality={100} src={typeIcon} alt={r.chartType} width={30} height={14} className="h-4 w-auto" />
                          ) : (
                            <span className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-2 py-0.5 text-[10px] font-bold text-[#2f2461]/70">
                              {r.chartType}
                            </span>
                          )}
                          <DifficultyChip difficulty={r.difficulty} className="px-2 py-0.5 text-[9px]" />
                          <span className="rounded-full border border-[#2f2461]/15 bg-[#2f2461]/5 px-2 py-0.5 text-[10px] font-bold text-[#2f2461]/70">
                            Lv {r.levelText ?? "-"}
                          </span>
                          <span className="rounded-full border border-[#2f2461]/15 bg-[#2f2461]/5 px-2 py-0.5 text-[10px] font-bold text-[#2f2461]/70">
                            Const {formatInternalLevel(r.resolvedInternalLevel)}
                          </span>
                        </div>

                        <div className="mt-2 text-[11px] font-semibold text-[#2f2461]/65">
                          ACHV {typeof r.achievement === "number" ? `${r.achievement.toFixed(4)}%` : "-"} | RANK {r.rank ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </PageCard>
        </>
      ) : null}
    </PageWrapper>
  );
}
