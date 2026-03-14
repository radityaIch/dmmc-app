"use client";

import { Chart } from "chart.js/auto";
import type { Chart as ChartJS, ChartConfiguration } from "chart.js";
import domtoimage from "dom-to-image";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DifficultyChip } from "../components/DifficultyChip";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";
import { authClient } from "../lib/auth/client";
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

type Top50ExportRow = {
  bucketRank: number;
  songName: string;
  resolvedCoverUrl: string | null;
  internalLevelText: string | null;
  levelText: string | null;
  difficulty: Difficulty;
  chartType: ChartType;
  achievement: number | null;
  rank: string | null;
  fcap: string | null;
  sync: string | null;
  finalRating: number | null;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function difficultyLabelForExport(difficulty: Difficulty): string {
  if (difficulty === "REMASTER") return "Re:MASTER";
  return difficulty;
}

function difficultyClassForExportCard(difficulty: Difficulty): string {
  if (difficulty === "BASIC") return "diff-basic";
  if (difficulty === "ADVANCED") return "diff-advanced";
  if (difficulty === "EXPERT") return "diff-expert";
  if (difficulty === "MASTER") return "diff-master";
  if (difficulty === "REMASTER") return "diff-remaster";
  return "diff-unknown";
}

function badgeStyleForRank(rank: string | null): string {
  if (rank === "SSS+") return "background:linear-gradient(135deg,#ffd95f,#ff9de2,#a78eff);color:#fff;border:1px solid transparent;";
  if (rank === "SSS") return "background:linear-gradient(135deg,#ffd95f,#ffb830);color:#5c3300;border:1px solid transparent;";
  if (rank === "SS+") return "background:#fff1c7;color:#a25f00;border:1px solid rgba(255,180,80,.65);";
  if (rank === "SS") return "background:#fff7b7;color:#8f7200;border:1px solid rgba(226,195,50,.65);";
  if (rank === "S+") return "background:#ffe3c7;color:#a24f00;border:1px solid rgba(255,155,80,.65);";
  if (rank === "S") return "background:#ffeedd;color:#a55a1a;border:1px solid rgba(255,168,102,.55);";
  if (rank === "AAA") return "background:#efe0ff;color:#6b40a6;border:1px solid rgba(160,120,220,.55);";
  if (rank?.startsWith("AA")) return "background:#e0edff;color:#2f63a2;border:1px solid rgba(114,157,220,.55);";
  if (rank?.startsWith("A")) return "background:#dff5ff;color:#1d6f9c;border:1px solid rgba(88,190,230,.55);";
  return "background:#f1f2fb;color:#5f5f7f;border:1px solid rgba(120,120,160,.35);";
}

function badgeStyleForFcap(fcap: string | null): string {
  if (fcap?.startsWith("AP+")) return "background:linear-gradient(135deg,#ffd95f,#ff9de2,#a78eff);color:#fff;";
  if (fcap?.startsWith("AP")) return "background:linear-gradient(135deg,#ffd95f,#ffb830);color:#5c3300;";
  if (fcap?.startsWith("FC+")) return "background:#10b981;color:#fff;";
  if (fcap?.startsWith("FC")) return "background:#d1fae5;color:#047857;";
  return "background:#f1f2fb;color:#5f5f7f;";
}

function badgeStyleForSync(sync: string | null): string {
  if (sync?.startsWith("FSD")) return "background:linear-gradient(135deg,#ffe678,#67d9ff);color:#0b4968;";
  if (sync?.startsWith("FS+")) return "background:linear-gradient(135deg,#44c8ff,#9a8cff);color:#fff;";
  if (sync?.startsWith("FS")) return "background:#dbeafe;color:#1d4ed8;";
  if (sync === "SYNC") return "background:#eef0f9;color:#59607d;";
  return "background:#f1f2fb;color:#5f5f7f;";
}

function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();
  return Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  ).then(() => undefined);
}

function rowHtml(row: Top50ExportRow): string {
  const achievementText = typeof row.achievement === "number" ? `${row.achievement.toFixed(2)}%` : "-";
  const ratingText = typeof row.finalRating === "number" ? String(row.finalRating) : "-";
  const constText = row.internalLevelText ?? row.levelText ?? "-";
  const coverImg = row.resolvedCoverUrl
    ? `<img class="cover-img" src="${escapeHtml(row.resolvedCoverUrl)}" alt="" crossOrigin="anonymous" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid';" />`
    : "";
  return `
  <div class="score-row ${difficultyClassForExportCard(row.difficulty)}">
    <div class="top-row">
      <div class="top-left">
        <span class="pill type-pill">${escapeHtml(row.chartType)}</span>
      </div>
      <div class="const-pill">${escapeHtml(constText)}</div>
    </div>
    <div class="song-name" title="${escapeHtml(row.songName)}">${escapeHtml(row.songName)}</div>
    <div class="bottom-row">
      <div class="cover-col">
        ${coverImg}
        <div class="cover-fallback" ${row.resolvedCoverUrl ? "style=\"display:none\"" : ""}>DMMC</div>
      </div>
      <div class="stat-col">
        <div class="rank-line">
          <span class="rank-chip" style="${badgeStyleForRank(row.rank)}">${escapeHtml(row.rank ?? "-")}</span>
          ${row.fcap ? `<span class="tiny-badge" style="${badgeStyleForFcap(row.fcap)}">${escapeHtml(row.fcap)}</span>` : ""}
          ${row.sync ? `<span class="tiny-badge" style="${badgeStyleForSync(row.sync)}">${escapeHtml(row.sync)}</span>` : ""}
        </div>
        <div class="achv">${achievementText}</div>
        <div class="meta-row">
          <span class="pill diff-pill">${escapeHtml(difficultyLabelForExport(row.difficulty))}</span>
          <span class="pill level-pill">Lv ${escapeHtml(row.levelText ?? "-")}</span>
        </div>
      </div>
      <div class="rating-col">${ratingText}</div>
    </div>
  </div>`;
}

function buildTop50PosterHtml(params: {
  playerName: string;
  totalRating: number;
  exportedAt: number;
  topNew: Top50ExportRow[];
  topOld: Top50ExportRow[];
}): string {
  const { playerName, totalRating, exportedAt, topNew, topOld } = params;
  const oldFixed = [...topOld];
  const newFixed = [...topNew];
  while (oldFixed.length < 35) {
    oldFixed.push({
      bucketRank: oldFixed.length + 1,
      songName: "-",
      resolvedCoverUrl: null,
      internalLevelText: null,
      levelText: null,
      difficulty: "UNKNOWN",
      chartType: "UNKNOWN",
      achievement: null,
      rank: null,
      fcap: null,
      sync: null,
      finalRating: null,
    });
  }
  while (newFixed.length < 15) {
    newFixed.push({
      bucketRank: newFixed.length + 1,
      songName: "-",
      resolvedCoverUrl: null,
      internalLevelText: null,
      levelText: null,
      difficulty: "UNKNOWN",
      chartType: "UNKNOWN",
      achievement: null,
      rank: null,
      fcap: null,
      sync: null,
      finalRating: null,
    });
  }
  const newRows = newFixed.slice(0, 15).map((row) => rowHtml(row)).join("");
  const oldRows = oldFixed.slice(0, 35).map((row) => rowHtml(row)).join("");
  const ts = new Date(exportedAt).toLocaleString();
  const cardH = 112;
  const rowGap = 8;
  const panelHead = 44;
  const panelPadY = 9;
  const topAreaHeight = 145;
  const sectionGap = 16;
  const oldGridH = cardH * 7 + rowGap * 6;
  const newGridH = cardH * 3 + rowGap * 2;
  const oldPanelHeight = panelHead + panelPadY * 2 + oldGridH;
  const newPanelHeight = panelHead + panelPadY * 2 + newGridH;
  const canvasHeight = topAreaHeight + oldPanelHeight + sectionGap + newPanelHeight + 28;

  return `
  <div id="dmmc-top50-export" style="width:1500px;height:${canvasHeight}px;position:relative;overflow:hidden;color:#fff;
    background:radial-gradient(1200px 660px at 65% 20%, rgba(100,65,170,.42), rgba(20,19,60,.95)),
    linear-gradient(135deg,#31144f 0%,#1a2f66 55%,#1b1a4f 100%);
    font-family: system-ui, -apple-system, Segoe UI, sans-serif;">

    <img src="/assets/images/tile_purple_left.png" alt="" style="position:absolute;left:0;top:240px;width:110px;opacity:.9" />
    <img src="/assets/images/tile_green.png" alt="" style="position:absolute;right:0;top:100px;width:170px;opacity:.85" />
    <img src="/assets/images/circle_white.png" alt="" style="position:absolute;left:280px;top:80px;width:920px;opacity:.23" />
    <img src="/assets/images/circle_yellow.png" alt="" style="position:absolute;left:270px;top:118px;width:940px;opacity:.48" />
    <img src="/assets/images/chara.png" alt="" style="position:absolute;right:68px;top:95px;width:320px;opacity:.6" />
    <img src="/assets/images/3d_glove_pink.png" alt="" style="position:absolute;left:48px;top:380px;width:95px;opacity:.95" />
    <img src="/assets/images/3d_glove_blue.png" alt="" style="position:absolute;right:55px;bottom:54px;width:95px;opacity:.95" />

    <div style="position:absolute;left:0;right:0;top:0;height:120px;background:linear-gradient(180deg,rgba(10,30,90,.65),rgba(10,30,90,0));"></div>
    <div style="position:absolute;left:44px;top:26px;display:flex;align-items:center;gap:14px;">
      <img src="/assets/images/Logo 04.png" alt="DMMC" style="height:58px;width:auto;" />
      <div>
        <div style="font-size:18px;font-weight:800;letter-spacing:.06em;opacity:.95;">DMMC TOP 50</div>
        <div style="font-size:12px;opacity:.75;">${escapeHtml(playerName)} • ${escapeHtml(ts)}</div>
      </div>
    </div>

    <div style="position:absolute;right:44px;top:26px;text-align:right;">
      <div style="font-size:11px;opacity:.72;letter-spacing:.18em">TOTAL RATING</div>
      <div style="font-size:50px;font-weight:900;line-height:1;color:#fff;text-shadow:0 0 24px rgba(255,98,185,.6)">${totalRating}</div>
    </div>

    <div style="position:absolute;left:28px;right:28px;top:136px;display:flex;flex-direction:column;gap:16px;">
      <section class="panel panel-old">
        <div class="panel-head old">OLD CHARTS</div>
        <div class="list list-old">${oldRows}</div>
      </section>
      <section class="panel panel-new">
        <div class="panel-head new">NEW CHARTS</div>
        <div class="list list-new">${newRows}</div>
      </section>
    </div>

    <style>
      #dmmc-top50-export .panel{
        border:1px solid rgba(255,255,255,.25);
        border-radius:14px;
        background:rgba(24,17,58,.6);
        backdrop-filter: blur(2px);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 10px 24px rgba(9,8,24,.4);
        display:flex;
        min-height:0;
        flex-direction:column;
      }
      #dmmc-top50-export .panel-head{
        display:flex;
        align-items:center;
        justify-content:flex-start;
        padding:9px 12px;
        font-size:21px;
        font-weight:900;
        letter-spacing:.08em;
        border-bottom:1px solid rgba(255,255,255,.22);
      }
      #dmmc-top50-export .panel-head.old{ background:linear-gradient(90deg,rgba(58,142,255,.35),rgba(58,142,255,.08)); }
      #dmmc-top50-export .panel-head.new{ background:linear-gradient(90deg,rgba(255,107,185,.35),rgba(255,107,185,.08)); }
      #dmmc-top50-export .list{
        padding:9px;
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:8px;
      }
      #dmmc-top50-export .list-old{grid-template-rows:repeat(7,${cardH}px);}
      #dmmc-top50-export .list-new{grid-template-rows:repeat(3,${cardH}px);}
      #dmmc-top50-export .score-row{
        display:flex;
        flex-direction:column;
        align-items:stretch;
        border:1px solid rgba(20,13,46,.9);
        background:linear-gradient(180deg,#4c2a69,#44245f);
        border-radius:10px;
        padding:6px;
        min-height:${cardH}px;
        overflow:hidden;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.06);
      }
      #dmmc-top50-export .score-row.diff-basic{background:linear-gradient(180deg,#3a8d40,#2f6e34);}
      #dmmc-top50-export .score-row.diff-advanced{background:linear-gradient(180deg,#bd8a18,#946a10);}
      #dmmc-top50-export .score-row.diff-expert{background:linear-gradient(180deg,#c64653,#99343f);}
      #dmmc-top50-export .score-row.diff-master{background:linear-gradient(180deg,#71429d,#563176);}
      #dmmc-top50-export .score-row.diff-remaster{background:linear-gradient(180deg,#a251c5,#7f3a9f);}
      #dmmc-top50-export .score-row.diff-unknown{background:linear-gradient(180deg,#4c2a69,#44245f);}
      #dmmc-top50-export .top-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:6px;
      }
      #dmmc-top50-export .top-left{display:flex;align-items:center;gap:4px;min-width:0;}
      #dmmc-top50-export .pill{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        border-radius:999px;
        font-size:8px;
        font-weight:900;
        letter-spacing:.03em;
        white-space:nowrap;
        padding:2px 5px;
      }
      #dmmc-top50-export .type-pill{background:#c6f6ff;color:#215a7a;}
      #dmmc-top50-export .const-pill{
        min-width:36px;
        text-align:center;
        border-radius:7px;
        font-size:18px;
        line-height:1;
        font-weight:900;
        color:#fff;
        padding:2px 4px;
        background:rgba(255,255,255,.14);
      }
      #dmmc-top50-export .song-name{
        margin-top:3px;
        min-height:13px;
        font-size:11px;
        line-height:1.15;
        font-weight:900;
        color:#f7f8ff;
        text-shadow:0 1px 0 rgba(0,0,0,.24);
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      #dmmc-top50-export .bottom-row{margin-top:4px;display:grid;grid-template-columns:48px 1fr auto;gap:6px;align-items:center;min-height:52px;}
      #dmmc-top50-export .cover-col{
        width:100%;
        height:44px;
        border-radius:8px;
        overflow:hidden;
        border:1px solid rgba(255,255,255,.25);
        background:rgba(255,255,255,.13);
        position:relative;
      }
      #dmmc-top50-export .cover-img{
        width:100%;
        height:100%;
        object-fit:cover;
        display:block;
      }
      #dmmc-top50-export .cover-fallback{
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        font-size:10px;
        font-weight:900;
        letter-spacing:.05em;
        color:rgba(255,255,255,.85);
      }
      #dmmc-top50-export .stat-col{min-width:0;display:flex;flex-direction:column;gap:2px;}
      #dmmc-top50-export .rank-line{display:flex;align-items:center;gap:3px;min-width:0;overflow:hidden;}
      #dmmc-top50-export .rank-chip{
        padding:2px 5px;
        border-radius:999px;
        font-size:9px;
        font-weight:900;
        letter-spacing:.04em;
        line-height:1.2;
        white-space:nowrap;
      }
      #dmmc-top50-export .tiny-badge{
        padding:1px 4px;
        border-radius:999px;
        font-size:7px;
        font-weight:900;
        letter-spacing:.03em;
        line-height:1.2;
        white-space:nowrap;
      }
      #dmmc-top50-export .achv{font-size:12px;font-weight:900;line-height:1;}
      #dmmc-top50-export .meta-row{display:flex;gap:3px;overflow:hidden;}
      #dmmc-top50-export .diff-pill{background:#ffd4f0;color:#7b2660;}
      #dmmc-top50-export .level-pill{background:#d6e9ff;color:#214b7a;}
      #dmmc-top50-export .rating-col{
        align-self:end;
        min-width:32px;
        text-align:right;
        font-size:38px;
        line-height:.9;
        font-weight:900;
        color:#fff;
        text-shadow:0 2px 0 rgba(0,0,0,.22);
        transform:translateY(1px);
      }
    </style>
  </div>`;
}

function top50ExportWindowHtml(dataUrl: string, asPdf: boolean): string {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>DMMC Top 50 Play</title>
      <style>
        :root{color-scheme:light dark;}
        body{margin:0;padding:20px;background:#12131f;color:#f5f8ff;font-family:Segoe UI,system-ui,sans-serif;}
        .toolbar{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-bottom:14px;}
        .hint{font-size:12px;opacity:.78;}
        button{border:0;border-radius:999px;padding:8px 14px;font-weight:700;cursor:pointer;background:#ff4fbe;color:#fff;}
        .frame{display:flex;justify-content:center;}
        img{max-width:min(96vw,1500px);width:100%;height:auto;border-radius:12px;box-shadow:0 10px 36px rgba(0,0,0,.35);}
        @media print{.toolbar{display:none;} body{background:#fff;padding:0;} img{max-width:100%;border-radius:0;box-shadow:none;}}
      </style>
    </head>
    <body>
      <div class="toolbar">
        ${asPdf ? "<button onclick=\"window.print()\">Print / Save as PDF</button><span class='hint'>Tip: Destination = Save as PDF</span>" : "<span class='hint'>Right click image -> Copy image or Hold the image then copy image (Mobile)</span>"}
      </div>
      <div class="frame"><img src="${dataUrl}" alt="DMMC Top 50 Play" /></div>
      ${asPdf ? "<script>setTimeout(()=>window.print(),300)</script>" : ""}
    </body>
  </html>`;
}

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
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [exporting, setExporting] = useState<null | "png" | "pdf">(null);

  const [payload, setPayload] = useState<ExportPayload | null>(null);
  const [status, setStatus] = useState("Waiting for bookmarklet...");
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
    const initialState = getInitialState();
    setPayload(initialState.payload);
    setStatus(initialState.status);

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
  }, []);

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

  async function exportTop50(mode: "png" | "pdf") {
    if (!payload) return;

    const exportWindow = window.open("", "_blank");
    if (!exportWindow) {
      setStatus("Popup blocked. Please allow popups for this site and try again.");
      return;
    }
    exportWindow.document.open();
    exportWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Preparing export...</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#12131f;color:#f5f8ff;font-family:Segoe UI,system-ui,sans-serif;} .box{padding:16px 20px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.04);font-weight:700;}</style></head><body><div class="box">Rendering Top 50 ${mode.toUpperCase()}...</div></body></html>`);
    exportWindow.document.close();

    const topNewRows: Top50ExportRow[] = ratingByRule.topNew.map((r, idx) => ({
      bucketRank: idx + 1,
      songName: r.songName,
      resolvedCoverUrl: r.resolvedCoverUrl,
      internalLevelText: formatInternalLevel(r.resolvedInternalLevel),
      levelText: r.levelText,
      difficulty: r.difficulty,
      chartType: r.chartType,
      achievement: r.achievement,
      rank: r.rank,
      fcap: null,
      sync: null,
      finalRating: r.finalRating,
    }));

    const scoreKeyMap = new Map<string, ImportedScore>();
    for (const s of payload.score) {
      const key = `${normalizeTextKey(s.songName)}|${s.chartType}|${s.difficulty}|${s.levelText ?? ""}`;
      if (!scoreKeyMap.has(key)) scoreKeyMap.set(key, s);
    }

    const withScoreBadges = (r: ResolvedRating): Pick<Top50ExportRow, "fcap" | "sync"> => {
      const key = `${normalizeTextKey(r.songName)}|${r.chartType}|${r.difficulty}|${r.levelText ?? ""}`;
      const matched = scoreKeyMap.get(key);
      return {
        fcap: matched?.fcap ?? null,
        sync: matched?.sync ?? null,
      };
    };

    const topOldRows: Top50ExportRow[] = ratingByRule.topOld.map((r, idx) => {
      const badge = withScoreBadges(r);
      return {
        bucketRank: idx + 1,
        songName: r.songName,
        resolvedCoverUrl: r.resolvedCoverUrl,
        internalLevelText: formatInternalLevel(r.resolvedInternalLevel),
        levelText: r.levelText,
        difficulty: r.difficulty,
        chartType: r.chartType,
        achievement: r.achievement,
        rank: r.rank,
        fcap: badge.fcap,
        sync: badge.sync,
        finalRating: r.finalRating,
      };
    });

    for (let i = 0; i < topNewRows.length; i += 1) {
      const badge = withScoreBadges(ratingByRule.topNew[i]);
      topNewRows[i].fcap = badge.fcap;
      topNewRows[i].sync = badge.sync;
    }

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.zIndex = "-1";
    wrapper.style.pointerEvents = "none";
    wrapper.innerHTML = buildTop50PosterHtml({
      playerName: payload.playerName ?? "Anonymous Player",
      totalRating: ratingByRule.total,
      exportedAt: payload.exportedAt,
      topNew: topNewRows,
      topOld: topOldRows,
    });

    document.body.appendChild(wrapper);

    try {
      setExporting(mode);
      const target = wrapper.firstElementChild as HTMLElement | null;
      if (!target) throw new Error("Failed to build export layout.");

      await waitForImages(target);
      const dataUrl = await domtoimage.toPng(target, {
        quality: 1,
        cacheBust: true,
        bgcolor: "#1e1b3b",
      });

      exportWindow.document.open();
      exportWindow.document.write(top50ExportWindowHtml(dataUrl, mode === "pdf"));
      exportWindow.document.close();

      if (mode === "png") {
        setStatus("Opened Top 50 PNG in a new tab (base64 image). Right click to copy.");
      } else {
        setStatus("Opened print-ready Top 50 tab. Use Save as PDF in the print dialog.");
      }
    } catch {
      exportWindow.document.open();
      exportWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>Export failed</title><style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#12131f;color:#f5f8ff;font-family:Segoe UI,system-ui,sans-serif;padding:24px;} .box{max-width:720px;padding:16px 20px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(255,255,255,.04);} h1{margin:0 0 8px;font-size:18px;} p{margin:0;opacity:.85;line-height:1.5;}</style></head><body><div class="box"><h1>Failed to generate export</h1><p>Please try again. If it still fails, reload the page and ensure image assets are accessible.</p></div></body></html>`);
      exportWindow.document.close();
      setStatus(`Failed to export Top 50 ${mode.toUpperCase()}.`);
    } finally {
      setExporting(null);
      wrapper.remove();
    }
  }

  const isDev = process.env.NODE_ENV === "development";

  if (!isDev && isSessionPending) {
    return (
      <PageWrapper>
        <PageCard color="green" className="mx-auto max-w-md mb-12">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2cb869]/30 border-t-[#2cb869]" />
          </div>
        </PageCard>
      </PageWrapper>
    );
  }

  if (!isDev && !session) {
    const signIn = () =>
      authClient.signIn.social({ provider: "discord", callbackURL: "/my-score" });

    return (
      <PageWrapper>
        <PageCard color="green" className="mx-auto max-w-md mb-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <SectionHeader color="green" className="mb-0 flex-1">My Score</SectionHeader>
          </div>

          <p className="mb-6 text-center text-sm font-medium leading-6 text-[#2f2461]/70">
            Sign in with your Discord account to view your score.
          </p>

          <button
            type="button"
            onClick={signIn}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[#5865F2] px-6 py-3 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(88,101,242,0.55),0_0_24px_rgba(88,101,242,0.25)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(88,101,242,0.75),0_0_34px_rgba(88,101,242,0.45)] active:translate-y-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.03.056a19.9 19.9 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
            </svg>
            Sign in with Discord
          </button>
        </PageCard>
      </PageWrapper>
    );
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
              onClick={() => exportTop50("png")}
              disabled={!payload || exporting != null}
              className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2f2461]/70 hover:bg-white hover:text-[#2f2461] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "png" ? "Rendering PNG..." : "Top 50 PNG"}
            </button>
            <button
              type="button"
              onClick={() => exportTop50("pdf")}
              disabled={!payload || exporting != null}
              className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#2f2461]/70 hover:bg-white hover:text-[#2f2461] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === "pdf" ? "Rendering PDF..." : "Top 50 PDF"}
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
            <div className="h-96 overflow-y-auto rounded-2xl border border-[#2f2461]/10 bg-white/60 ring-1 ring-[#2f2461]/5">
              <div className="divide-y divide-[#2f2461]/8">
                {sortedScores.slice(0, 50).map((s, idx) => {
                  const rankCls =
                    s.rank === "SSS+" ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ff9de2_50%,#a78eff_100%)] text-white border-transparent" :
                    s.rank === "SSS"  ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ffb830_100%)] text-[#5c3300] border-transparent" :
                    s.rank === "SS+"  ? "bg-amber-100 text-amber-700 border-amber-300/60" :
                    s.rank === "SS"   ? "bg-yellow-100 text-yellow-700 border-yellow-300/60" :
                    s.rank === "S+"   ? "bg-orange-100 text-orange-600 border-orange-300/60" :
                    s.rank === "S"    ? "bg-orange-50 text-orange-500 border-orange-200/60" :
                    s.rank === "AAA"  ? "bg-purple-100 text-purple-700 border-purple-200/60" :
                    (s.rank?.startsWith("AA") ?? false) ? "bg-blue-100 text-blue-700 border-blue-200/60" :
                    (s.rank?.startsWith("A") ?? false)  ? "bg-sky-100 text-sky-600 border-sky-200/60" :
                    "bg-[#2f2461]/5 text-[#2f2461]/55 border-[#2f2461]/15";
                  const fcapCls =
                    (s.fcap?.startsWith("AP+") ?? false) ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ff9de2_50%,#a78eff_100%)] text-white" :
                    (s.fcap?.startsWith("AP") ?? false)  ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ffb830_100%)] text-[#5c3300]" :
                    (s.fcap?.startsWith("FC+") ?? false) ? "bg-emerald-500 text-white" :
                    (s.fcap?.startsWith("FC") ?? false)  ? "bg-emerald-100 text-emerald-700" :
                    null;
                  const syncCls =
                    (s.sync?.startsWith("FSD") ?? false) ? "bg-[linear-gradient(135deg,#ffd95f_0%,#40e0ff_100%)] text-[#0d3d5c]" :
                    (s.sync?.startsWith("FS+") ?? false) ? "bg-[linear-gradient(135deg,#40c8ff_0%,#a78eff_100%)] text-white" :
                    (s.sync?.startsWith("FS") ?? false)  ? "bg-sky-100 text-sky-700" :
                    s.sync === "SYNC" ? "bg-[#2f2461]/8 text-[#2f2461]/50" :
                    null;
                  const typeIcon = chartTypeIcon(s.chartType);
                  return (
                    <div key={`${s.songName}-${s.chartType}-${s.difficulty}-${idx}`} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-[4.5rem] shrink-0 text-center">
                        <div className={`inline-flex items-center justify-center rounded-lg border px-2 py-0.5 text-xs font-black ${rankCls}`}>
                          {s.rank ?? "-"}
                        </div>
                        <div className="mt-1 text-[12px] font-black leading-none text-[#2f2461]">
                          {typeof s.achievement === "number" ? `${s.achievement.toFixed(2)}%` : "-"}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#2f2461]" title={s.songName}>
                          {s.songName}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                          <DifficultyChip difficulty={s.difficulty} className="px-2 py-0.5 text-[9px]" />
                          <span className="text-[11px] font-semibold text-[#2f2461]/60">Lv {s.levelText ?? "-"}</span>
                          {typeIcon && (
                            <Image src={typeIcon} alt={s.chartType} width={28} height={14} className="h-3.5 w-auto" />
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {fcapCls && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${fcapCls}`}>
                            {s.fcap}
                          </span>
                        )}
                        {syncCls && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${syncCls}`}>
                            {s.sync}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PageCard>

          <PageCard color="yellow">
            <SectionHeader color="yellow">Best 50 (Top 15 New + Top 35 Old)</SectionHeader>

            {(["NEW", "OLD"] as const).map((bucket) => {
              const cards = top50Cards.filter((c) => c.bucket === bucket);
              const isNew = bucket === "NEW";
              return (
                <div key={bucket}>
                  <div className={`${isNew ? "mt-4" : "mt-8"} mb-3 flex items-center gap-3`}>
                    <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black tracking-widest ${
                      isNew
                        ? "border-[#4f9cff]/40 bg-[#4f9cff]/10 text-[#4f9cff]"
                        : "border-[#ff67b9]/40 bg-[#ff67b9]/10 text-[#ff67b9]"
                    }`}>
                      {bucket} CHARTS
                    </span>
                    <div className={`flex-1 border-t ${isNew ? "border-[#4f9cff]/20" : "border-[#ff67b9]/20"}`} />
                    <span className="shrink-0 text-[11px] font-bold text-[#2f2461]/40">{cards.length} songs</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {cards.map((item, idx) => {
                      const r = item.rating;
                      const typeIcon = chartTypeIcon(r.chartType);
                      const rankCls =
                        r.rank === "SSS+" ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ff9de2_50%,#a78eff_100%)] text-white border-transparent" :
                        r.rank === "SSS"  ? "bg-[linear-gradient(135deg,#ffd95f_0%,#ffb830_100%)] text-[#5c3300] border-transparent" :
                        r.rank === "SS+"  ? "bg-amber-100 text-amber-700 border-amber-300/60" :
                        r.rank === "SS"   ? "bg-yellow-100 text-yellow-700 border-yellow-300/60" :
                        r.rank === "S+"   ? "bg-orange-100 text-orange-600 border-orange-300/60" :
                        r.rank === "S"    ? "bg-orange-50 text-orange-500 border-orange-200/60" :
                        r.rank === "AAA"  ? "bg-purple-100 text-purple-700 border-purple-200/60" :
                        (r.rank?.startsWith("AA") ?? false) ? "bg-blue-100 text-blue-700 border-blue-200/60" :
                        (r.rank?.startsWith("A") ?? false)  ? "bg-sky-100 text-sky-600 border-sky-200/60" :
                        "bg-[#2f2461]/5 text-[#2f2461]/55 border-[#2f2461]/15";
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
                                  <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/50">#{item.bucketRank}</div>
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

                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className="text-[12px] font-black text-[#2f2461]">
                                  {typeof r.achievement === "number" ? `${r.achievement.toFixed(2)}%` : "-"}
                                </span>
                                {r.rank && (
                                  <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-black ${rankCls}`}>
                                    {r.rank}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </PageCard>
        </>
      ) : null}
    </PageWrapper>
  );
}
