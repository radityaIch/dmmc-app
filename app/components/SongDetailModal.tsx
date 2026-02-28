"use client";

import { useEffect, useMemo } from "react";

import type { MaimaiSong, MaimaiSongSheet } from "../lib/maimai";
import { maimaiCoverUrl } from "../lib/maimai";

type SongDetailModalProps = {
  open: boolean;
  song: MaimaiSong | null;
  onClose: () => void;
  actionLabel?: string | null;
  onAction?: (() => void) | null;
  actionDisabled?: boolean;
};

const difficultyLabel: Record<string, string> = {
  basic: "BASIC",
  advanced: "ADVANCED",
  expert: "EXPERT",
  master: "MASTER",
  remaster: "Re:MASTER",
};

const difficultyOrder = ["basic", "advanced", "expert", "master", "remaster"];

function sortSheets(a: MaimaiSongSheet, b: MaimaiSongSheet) {
  if (a.type !== b.type) return a.type.localeCompare(b.type);
  const ai = difficultyOrder.indexOf(a.difficulty);
  const bi = difficultyOrder.indexOf(b.difficulty);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
}

function groupByType(sheets: MaimaiSongSheet[]) {
  const dx: MaimaiSongSheet[] = [];
  const std: MaimaiSongSheet[] = [];
  for (const s of sheets) {
    if (s.type === "dx") dx.push(s);
    else std.push(s);
  }
  dx.sort(sortSheets);
  std.sort(sortSheets);
  return { dx, std };
}

export function SongDetailModal({
  open,
  song,
  onClose,
  actionLabel,
  onAction,
  actionDisabled,
}: SongDetailModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const { dx, std } = useMemo(() => {
    if (!song) return { dx: [], std: [] };
    return groupByType(song.sheets);
  }, [song]);

  if (!open || !song) return null;

  const cover = maimaiCoverUrl(song.imageName);

  return (
    <div className="fixed inset-0 z-60">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-130 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-[#ff4fd8]/25 bg-white/95 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,79,216,0.10),0_24px_60px_rgba(47,36,97,0.25)]">
        <div className="relative grid grid-cols-[140px_1fr] gap-4 p-4">
          <div className="relative overflow-hidden rounded-2xl border border-[#2f2461]/10 bg-[#2f2461]/5 ring-1 ring-[#2f2461]/5">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                className="h-35 w-35 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="grid h-35 w-35 place-items-center text-xs font-black tracking-widest text-[#2f2461]/30">
                DMMC
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(47,36,97,0.06)]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">
                  {song.category}
                </div>
                <div className="mt-1 text-balance text-lg font-black leading-tight tracking-tight text-[#2f2461]">
                  {song.title}
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-[#2f2461]/60">
                  {song.artist}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-3 py-1 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
              >
                Close
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[#2f2461]/60">
              {song.bpm != null ? (
                <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
                  {song.bpm} BPM
                </span>
              ) : null}
              {song.version ? (
                <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
                  {song.version}
                </span>
              ) : null}
              {song.releaseDate ? (
                <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
                  Released {song.releaseDate}
                </span>
              ) : null}
            </div>

            {actionLabel && onAction ? (
              <div className="mt-4">
                <button
                  type="button"
                  disabled={!!actionDisabled}
                  onClick={onAction}
                  className={
                    "w-full rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,79,216,0.45),0_0_24px_rgba(255,79,216,0.20)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 " +
                    (actionLabel.toLowerCase().includes("ban")
                      ? "bg-[linear-gradient(180deg,#ff5b5b,#ff2f4b)]"
                      : "bg-[linear-gradient(180deg,#29ff8a,#0bd66a)]")
                  }
                >
                  {actionLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[#2f2461]/10 p-4">
          <div className="text-xs font-bold tracking-widest text-[#2f2461]/50">
            SHEETS
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#39b7ff]/20 bg-[#39b7ff]/5 p-4">
              <div className="text-xs font-black tracking-widest text-[#168bff]">DX</div>
              <div className="mt-3 space-y-2">
                {dx.length === 0 ? (
                  <div className="text-sm font-semibold text-[#2f2461]/50">No DX charts</div>
                ) : (
                  dx.map((s, idx) => (
                    <div
                      key={`${s.type}-${s.difficulty}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[#2f2461]/10 bg-white/60 px-3 py-2"
                    >
                      <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                        {difficultyLabel[s.difficulty] ?? s.difficulty.toUpperCase()}
                      </div>
                      <div className="text-sm font-black text-[#2f2461]">{s.level}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-50 p-4">
              <div className="text-xs font-black tracking-widest text-emerald-600">STD</div>
              <div className="mt-3 space-y-2">
                {std.length === 0 ? (
                  <div className="text-sm font-semibold text-[#2f2461]/50">No STD charts</div>
                ) : (
                  std.map((s, idx) => (
                    <div
                      key={`${s.type}-${s.difficulty}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-[#2f2461]/10 bg-white/60 px-3 py-2"
                    >
                      <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                        {difficultyLabel[s.difficulty] ?? s.difficulty.toUpperCase()}
                      </div>
                      <div className="text-sm font-black text-[#2f2461]">{s.level}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
