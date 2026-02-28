type ChartType = "UTAGE" | "DX" | "STD" | "UNKNOWN";
type Difficulty = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "REMASTER" | "UNKNOWN";
type Rank = "SSS+" | "SSS" | "SS+" | "SS" | "S+" | "S" | "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "C" | "D";

interface OverlayElements {
  wrap: HTMLDivElement;
  msg: HTMLDivElement;
  barInner: HTMLDivElement;
}

interface DxScore {
  player: number;
  max: number;
  ratio: number;
  star: number;
}

interface ScoreItem {
  songName: string;
  genre: string | null;
  chartType: ChartType;
  difficulty: Difficulty;
  levelText: string | null;
  internalLevel: null;
  achievement: number | null;
  rank: Rank | null;
  fcap: string | null;
  sync: string | null;
  dxScore: DxScore | null;
}

type RatingSource = "displayed" | "estimated" | "unknown";

interface RatingItem {
  songName: string;
  genre: string | null;
  chartType: ChartType;
  difficulty: Difficulty;
  levelText: string | null;
  internalLevel: number | null;
  achievement: number | null;
  rank: Rank | null;
  rating: number | null;
  ratingSource: RatingSource;
  songIdx: string | null;
}

interface ExportPayload {
  schema: string;
  origin: string;
  exportedAt: number;
  score: ScoreItem[];
  rating: RatingItem[];
}

const DIFFICULTY_BY_INDEX: Difficulty[] = ["BASIC", "ADVANCED", "EXPERT", "MASTER", "REMASTER"];

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseText(el: Element | null): string {
  return el ? String(el.textContent ?? "").trim() : "";
}

function normalizeSongName(name: string): string {
  return name.replace(/" \+ '/g, "").replace(/' \+ "/g, "");
}

function parseDifficultyFromRowClass(row: HTMLElement): Difficulty {
  const target = row.classList.contains("pointer")
    ? row
    : row.querySelector<HTMLElement>(".pointer") ?? row;
  const match = target.className.match(/music_([a-z]+)_score_back/);
  const kind = match?.[1]?.toLowerCase() ?? "";
  if (kind === "basic") return "BASIC";
  if (kind === "advanced") return "ADVANCED";
  if (kind === "expert") return "EXPERT";
  if (kind === "master") return "MASTER";
  if (kind === "remaster") return "REMASTER";
  return "UNKNOWN";
}

function mkOverlay(): OverlayElements {
  const old = document.getElementById("dmmc-mai-export-overlay");
  if (old) old.remove();

  const wrap = document.createElement("div");
  wrap.id = "dmmc-mai-export-overlay";
  wrap.style.position = "fixed";
  wrap.style.inset = "0";
  wrap.style.zIndex = "2147483647";
  wrap.style.background = "rgba(0,0,0,0.72)";
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "center";
  wrap.style.padding = "16px";

  const card = document.createElement("div");
  card.style.maxWidth = "520px";
  card.style.width = "100%";
  card.style.borderRadius = "18px";
  card.style.border = "1px solid rgba(255,255,255,0.12)";
  card.style.background = "rgba(0,0,0,0.65)";
  card.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.08), 0 0 28px rgba(255,79,216,0.25)";
  card.style.padding = "16px";
  card.style.color = "#fff";
  card.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";

  const title = document.createElement("div");
  title.textContent = "DMMC Export";
  title.style.fontWeight = "800";
  title.style.letterSpacing = "0.08em";
  title.style.fontSize = "12px";
  title.style.opacity = "0.75";

  const msg = document.createElement("div");
  msg.textContent = "Starting...";
  msg.style.marginTop = "8px";
  msg.style.fontWeight = "800";
  msg.style.fontSize = "18px";

  const sub = document.createElement("div");
  sub.textContent = "Please keep this tab open.";
  sub.style.marginTop = "8px";
  sub.style.opacity = "0.8";
  sub.style.fontSize = "13px";

  const barOuter = document.createElement("div");
  barOuter.style.marginTop = "14px";
  barOuter.style.height = "10px";
  barOuter.style.borderRadius = "999px";
  barOuter.style.background = "rgba(255,255,255,0.12)";
  barOuter.style.overflow = "hidden";

  const barInner = document.createElement("div");
  barInner.style.height = "100%";
  barInner.style.width = "0%";
  barInner.style.background = "linear-gradient(90deg,#ff4fd8,#39b7ff)";
  barInner.style.boxShadow = "0 0 18px rgba(255,79,216,0.35)";
  barOuter.appendChild(barInner);

  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Hide";
  btn.style.marginTop = "14px";
  btn.style.borderRadius = "999px";
  btn.style.border = "1px solid rgba(255,255,255,0.16)";
  btn.style.background = "rgba(255,255,255,0.06)";
  btn.style.color = "#fff";
  btn.style.padding = "8px 12px";
  btn.style.cursor = "pointer";
  btn.onclick = () => wrap.remove();

  card.appendChild(title);
  card.appendChild(msg);
  card.appendChild(sub);
  card.appendChild(barOuter);
  card.appendChild(btn);
  wrap.appendChild(card);
  document.body.appendChild(wrap);

  return { wrap, msg, barInner };
}

function setOverlay(overlay: OverlayElements | null, text: string, pct?: number): void {
  if (!overlay) return;
  try {
    overlay.msg.textContent = text;
    if (typeof pct === "number" && Number.isFinite(pct)) {
      overlay.barInner.style.width = `${Math.max(0, Math.min(1, pct)) * 100}%`;
    }
  } catch {
    // Ignore overlay update errors.
  }
}

function detectChartType(row: HTMLElement): ChartType {
  if (row.id) {
    return row.id.includes("sta_") ? "STD" : "DX";
  }
  if (row.querySelector(".playlog_music_kind_icon_utage")) {
    return "UTAGE";
  }
  const img =
    row.querySelector<HTMLImageElement>(".playlog_music_kind_icon") ??
    row.querySelector<HTMLImageElement>(".music_kind_icon") ??
    row.querySelector<HTMLImageElement>(".f_l.h_20") ??
    row.querySelector<HTMLImageElement>("img:nth-child(2)");
  if (!(img instanceof HTMLImageElement)) {
    return "DX";
  }
  return img.src.includes("_standard") ? "STD" : "DX";
}

function rankFromAchv(achievement: number | null): Rank | null {
  if (achievement == null || !Number.isFinite(achievement)) return null;
  const x = achievement;
  if (x >= 100.5) return "SSS+";
  if (x >= 100) return "SSS";
  if (x >= 99.5) return "SS+";
  if (x >= 99) return "SS";
  if (x >= 98) return "S+";
  if (x >= 97) return "S";
  if (x >= 94) return "AAA";
  if (x >= 90) return "AA";
  if (x >= 80) return "A";
  if (x >= 75) return "BBB";
  if (x >= 70) return "BB";
  if (x >= 60) return "B";
  if (x >= 50) return "C";
  return "D";
}

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

function parseInternalLevel(levelText: string | null): number | null {
  if (!levelText) return null;
  const cleaned = levelText.trim().replace(/\?/g, "");
  if (!cleaned) return null;
  const base = Number.parseInt(cleaned, 10);
  if (!Number.isFinite(base)) return null;
  // Since BUDDiES PLUS, + starts from x.6. Use current intl behavior.
  return cleaned.endsWith("+") ? base + 0.6 : base;
}

function estimateChartRating(internalLevel: number | null, achievement: number | null): number | null {
  if (internalLevel == null || achievement == null || !Number.isFinite(achievement)) return null;
  const clampedAchv = Math.min(achievement, 100.5);
  const factor = ratingFactorByAchievement(clampedAchv);
  return Math.floor(Math.abs(internalLevel) * clampedAchv * factor);
}

function parseDisplayedChartRating(row: HTMLElement, estimated: number | null): number | null {
  const candidates: number[] = [];
  const scoreBlocks = Array.from(row.querySelectorAll<HTMLElement>(".music_score_block"));

  for (const block of scoreBlocks) {
    const text = block.innerText.trim();
    if (!text || text.includes("%") || text.includes("/")) continue;
    const num = Number.parseInt(text.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(num) && num >= 100 && num <= 2000) {
      candidates.push(num);
    }
  }

  if (estimated != null) {
    const allText = row.innerText ?? "";
    const matches = allText.match(/\d{3,4}/g) ?? [];
    for (const m of matches) {
      const num = Number.parseInt(m, 10);
      if (Number.isFinite(num) && num >= 100 && num <= 2000) {
        candidates.push(num);
      }
    }
  }

  if (candidates.length === 0) return null;
  if (estimated == null) return null;

  let best = candidates[0];
  let bestDiff = Math.abs(best - estimated);
  for (let i = 1; i < candidates.length; i += 1) {
    const diff = Math.abs(candidates[i] - estimated);
    if (diff < bestDiff) {
      best = candidates[i];
      bestDiff = diff;
    }
  }
  return bestDiff <= 60 ? best : null;
}

function dxStarFromRatio(ratio: number): number {
  const thresholds = [0, 0.85, 0.9, 0.93, 0.95, 0.97, 0.99, 1];
  for (let i = thresholds.length - 1; i > 0; i -= 1) {
    if (ratio >= thresholds[i]) return i;
  }
  return 0;
}

function parseDxScore(row: HTMLElement): DxScore | null {
  const blocks = Array.from(row.querySelectorAll<HTMLElement>(".music_score_block"));
  if (blocks.length !== 2) return null;
  const nodes = blocks[1].childNodes;
  const textNode = nodes.item(nodes.length - 1);
  const parts =
    textNode instanceof Text
      ? textNode.wholeText.split("/").map((segment) => segment.replace(",", "").trim())
      : [];
  if (parts.length !== 2) return null;

  const player = Number.parseInt(parts[0], 10);
  const max = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(player) || !Number.isFinite(max) || max <= 0) return null;

  const ratio = player / max;
  return { player, max, ratio, star: dxStarFromRatio(ratio) };
}

function parseAchievement(row: HTMLElement): number | null {
  const block = row.querySelectorAll<HTMLElement>(".music_score_block")[0];
  const value = block instanceof HTMLElement ? Number.parseFloat(block.innerText) : Number.NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseLevelText(row: HTMLElement): string | null {
  const lv =
    row.querySelector(".music_lv_block") ??
    row.querySelector(".music_lv") ??
    row.querySelector(".music_lv_back");
  const text = parseText(lv);
  return text || null;
}

function parseSongName(row: HTMLElement): string {
  const legacy = row.querySelector<HTMLElement>(".basic_block.break");
  if (legacy) {
    const textNode = legacy.childNodes.item(legacy.childNodes.length - 1);
    if (textNode?.nodeValue) {
      return normalizeSongName(textNode.nodeValue);
    }
  }
  const el =
    row.querySelector<HTMLElement>(".music_name_block") ??
    row.querySelector<HTMLElement>(".black_block");
  return normalizeSongName(parseText(el));
}

function parseApFcStatus(row: HTMLElement): string | null {
  const img = row.children.item(0)?.querySelector<HTMLImageElement>("img.f_r:nth-last-of-type(2)");
  if (!(img instanceof HTMLImageElement)) return null;
  const src = img.src.replace(/\?ver=.*$/, "");
  const lastUnderscore = src.lastIndexOf("_");
  const lastDot = src.lastIndexOf(".");
  if (lastUnderscore < 0 || lastDot <= lastUnderscore) return null;
  const lower = src.substring(lastUnderscore + 1, lastDot);
  if (lower === "back") return null;
  return lower.replace("ap", "AP").replace("p", "+").toUpperCase();
}

function parseSyncStatus(row: HTMLElement): string | null {
  const img = row.children.item(0)?.querySelector<HTMLImageElement>("img.f_r:nth-last-of-type(3)");
  if (!(img instanceof HTMLImageElement)) return null;
  const src = img.src.replace(/\?ver=.*$/, "");
  const lastUnderscore = src.lastIndexOf("_");
  const lastDot = src.lastIndexOf(".");
  if (lastUnderscore < 0 || lastDot <= lastUnderscore) return null;
  const lower = src.substring(lastUnderscore + 1, lastDot);
  if (lower === "back") return null;
  return lower.toUpperCase().replace("P", "+").replace("FDX", "FSD");
}

function parseSongIdx(row: HTMLElement): string | null {
  const form = row.querySelector<HTMLFormElement>("form");
  if (!form) return null;
  const idx = form.elements.namedItem("idx");
  if (idx instanceof HTMLInputElement) {
    return idx.value || null;
  }
  return null;
}

async function fetchDoc(url: string): Promise<Document> {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }
  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
}

function extractFromDoc(doc: Document, difficulty: Difficulty): ScoreItem[] {
  const items: ScoreItem[] = [];
  let genre: string | null = null;
  const blocks = Array.from(doc.querySelectorAll<HTMLElement>(".main_wrapper.t_c .m_15"));

  for (const block of blocks) {
    if (block.classList.contains("screw_block")) {
      genre = parseText(block) || genre;
      continue;
    }

    const isRow =
      block.classList.contains("w_450") &&
      block.classList.contains("m_15") &&
      block.classList.contains("p_r") &&
      block.classList.contains("f_0");
    if (!isRow) continue;

    const achievement = parseAchievement(block);
    if (achievement == null) continue;

    const songName = parseSongName(block);
    if (!songName) continue;

    const chartType = detectChartType(block);
    const levelText = parseLevelText(block);
    const dxScore = parseDxScore(block);
    const rank = rankFromAchv(achievement);
    const fcap = parseApFcStatus(block);
    const sync = parseSyncStatus(block);

    items.push({
      songName,
      genre,
      chartType,
      difficulty,
      levelText,
      internalLevel: null,
      achievement,
      rank,
      fcap,
      sync,
      dxScore,
    });
  }

  return items;
}

function extractRatingFromDoc(doc: Document): RatingItem[] {
  const items: RatingItem[] = [];
  let genre: string | null = null;
  const blocks = Array.from(doc.querySelectorAll<HTMLElement>(".main_wrapper.t_c .m_15"));

  for (const block of blocks) {
    if (block.classList.contains("screw_block")) {
      genre = parseText(block) || genre;
      continue;
    }

    const isRow =
      block.classList.contains("w_450") &&
      block.classList.contains("m_15") &&
      block.classList.contains("f_0");
    if (!isRow) continue;

    const songName = parseSongName(block);
    if (!songName) continue;

    const chartType = detectChartType(block);
    const difficulty = parseDifficultyFromRowClass(block);
    const levelText = parseLevelText(block);
    const internalLevel = parseInternalLevel(levelText);
    const achievement = parseAchievement(block);
    const rank = rankFromAchv(achievement);
    const estimatedRating = estimateChartRating(internalLevel, achievement);
    const displayedRating = parseDisplayedChartRating(block, estimatedRating);
    const rating = displayedRating ?? estimatedRating;
    const ratingSource: RatingSource =
      displayedRating != null ? "displayed" : estimatedRating != null ? "estimated" : "unknown";

    items.push({
      songName,
      genre,
      chartType,
      difficulty,
      levelText,
      internalLevel,
      achievement,
      rank,
      rating,
      ratingSource,
      songIdx: parseSongIdx(block),
    });
  }

  return items;
}

(() => {
  try {
    const origin = location.origin;
    if (!origin.includes("maimaidx-eng.com")) {
      alert("Open this on maimaidx-eng.com while logged in.");
      return;
    }

    const current = document.currentScript;
    const src = current instanceof HTMLScriptElement ? current.src : "";
    const receiver = (() => {
      try {
        if (!src) return "";
        return new URL(src).searchParams.get("receiver") ?? "";
      } catch {
        return "";
      }
    })();

    if (!receiver) {
      alert("DMMC Export: missing receiver URL.");
      return;
    }

    const schema = "dmmc/maimai-dxnet-export@2";

    (async () => {
      const overlay = mkOverlay();
      try {
        setOverlay(overlay, "Fetching scores...", 0);
        const all: ScoreItem[] = [];
        const totalDiff = 5;

        for (let diff = 0; diff <= 4; diff += 1) {
          setOverlay(overlay, `Fetching difficulty ${diff + 1}/${totalDiff}...`, diff / totalDiff);
          const url = `/maimai-mobile/record/musicGenre/search/?genre=99&diff=${diff}`;
          const doc = await fetchDoc(url);
          const difficulty = DIFFICULTY_BY_INDEX[diff] ?? "UNKNOWN";
          all.push(...extractFromDoc(doc, difficulty));
          await sleep(250);
        }

        let rating: RatingItem[] = [];
        try {
          setOverlay(overlay, "Fetching rating...", 0.9);
          const ratingDoc = await fetchDoc("/maimai-mobile/home/ratingTargetMusic/");
          rating = extractRatingFromDoc(ratingDoc);
        } catch (err) {
          console.warn("Failed to fetch rating page", err);
        }

        setOverlay(overlay, "Preparing import...", 0.95);
        const payload: ExportPayload = {
          schema,
          origin,
          exportedAt: Date.now(),
          score: all,
          rating,
        };

        try {
          window.name = `DMMC_MAIMAI_IMPORT:${JSON.stringify(payload)}`;
        } catch {
          alert("DMMC Export: failed to store payload in window.name.");
          return;
        }

        setOverlay(overlay, "Redirecting...", 1);
        location.href = receiver;
      } catch (err) {
        console.error(err);
        try {
          setOverlay(overlay, `Export failed: ${getErrorMessage(err)}`, 1);
        } catch {
          // Ignore overlay update errors.
        }
        setTimeout(() => {
          try {
            overlay.wrap.remove();
          } catch {
            // Ignore overlay cleanup errors.
          }
        }, 6000);
      }
    })();
  } catch (err) {
    alert(`DMMC Export failed: ${getErrorMessage(err)}`);
  }
})();
