export type MaimaiDifficulty =
  | "basic"
  | "advanced"
  | "expert"
  | "master"
  | "remaster";

export type MaimaiSheetType = "dx" | "std";

export type MaimaiRegionValue = string | boolean;

export type MaimaiRegions = {
  jp: MaimaiRegionValue;
  intl: MaimaiRegionValue;
  usa: MaimaiRegionValue;
  cn: MaimaiRegionValue;
};

export type MaimaiSongSheet = {
  type: MaimaiSheetType;
  difficulty: MaimaiDifficulty;
  level: string;
  levelValue: number;
  internalLevelValue: number | null;
  noteDesigner: string;
  noteCounts: {
    tap: number | null;
    hold: number | null;
    slide: number | null;
    touch: number | null;
    break: number | null;
    total: number | null;
  };
  regions: MaimaiRegions;
  isSpecial: boolean;
  version: string;
};

export type MaimaiSongRaw = {
  songId: string;
  category: string;
  title: string;
  artist: string;
  bpm: number | null;
  imageName: string | null;
  version: string | null;
  releaseDate: string | null;
  isNew: boolean;
  isLocked: boolean;
  comment: string | null;
  sheets: MaimaiSongSheet[];
};

export type MaimaiDataRaw = {
  songs: MaimaiSongRaw[];
};

export type MaimaiSong = {
  id: string;
  title: string;
  artist: string;
  category: string;
  bpm: number | null;
  version: string | null;
  releaseDate: string | null;
  imageName: string | null;
  sheets: MaimaiSongSheet[];
  regions: MaimaiRegions;
  hasDx: boolean;
  hasStd: boolean;
  maxLevelValue: number | null;
};

function mergeRegionValue(values: MaimaiRegionValue[]) {
  if (values.some((v) => v === true)) return true;

  const firstString = values.find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  if (firstString) return firstString;

  return false;
}

function aggregateRegions(sheets: MaimaiSongSheet[]): MaimaiRegions {
  return {
    jp: mergeRegionValue(sheets.map((s) => s.regions.jp)),
    intl: mergeRegionValue(sheets.map((s) => s.regions.intl)),
    usa: mergeRegionValue(sheets.map((s) => s.regions.usa)),
    cn: mergeRegionValue(sheets.map((s) => s.regions.cn)),
  };
}

export const MAIMAI_DATA_URL =
  "https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json";

export const MAIMAI_COVER_BASE_URL =
  "https://dp4p6x0xfi5o9.cloudfront.net/maimai/img/cover/";

export function maimaiCoverUrl(imageName: string | null) {
  if (!imageName) return null;
  return MAIMAI_COVER_BASE_URL + encodeURIComponent(imageName);
}

export function normalizeMaimaiSong(raw: MaimaiSongRaw): MaimaiSong {
  const hasDx = raw.sheets.some((s) => s.type === "dx");
  const hasStd = raw.sheets.some((s) => s.type === "std");
  const maxLevelValue =
    raw.sheets.length > 0
      ? Math.max(...raw.sheets.map((s) => s.levelValue ?? 0))
      : null;
  const regions = aggregateRegions(raw.sheets);

  return {
    id: raw.songId,
    title: raw.title,
    artist: raw.artist,
    category: raw.category,
    bpm: raw.bpm ?? null,
    version: raw.version ?? null,
    releaseDate: raw.releaseDate ?? null,
    imageName: raw.imageName ?? null,
    sheets: raw.sheets,
    regions,
    hasDx,
    hasStd,
    maxLevelValue,
  };
}

export async function fetchMaimaiSongs(): Promise<MaimaiSong[]> {
  const res = await fetch(MAIMAI_DATA_URL, {
    cache: "force-cache",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch maimai song data: ${res.status}`);
  }

  const data = (await res.json()) as MaimaiDataRaw;
  return data.songs.map(normalizeMaimaiSong);
}
