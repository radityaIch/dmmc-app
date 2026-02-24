"use client";

import { useEffect, useMemo, useState } from "react";

import { GlowButton } from "../components/GlowButton";
import { SongDetailModal } from "../components/SongDetailModal";
import type { MaimaiSong } from "../lib/maimai";
import { fetchMaimaiSongs, maimaiCoverUrl } from "../lib/maimai";
import { pickN, seededRng } from "../lib/rng";
import { useLocalStorageState } from "../lib/useLocalStorageState";

type SheetEntry = {
  id: string;
  title: string;
  artist: string;
  category: string;
  bpm: number | null;
  maxLevelValue: number | null;
  imageName: string | null;
  status: "available" | "banned" | "picked";
};

type BanPickMode = {
  enabled: boolean;
  teamA: string;
  teamB: string;
  bansPerTeam: number;
  picksPerTeam: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function includesLoose(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export default function SongsPage() {
  const [songs, setSongs] = useState<MaimaiSong[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "dx" | "std">("all");

  const [minLevel, setMinLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(15);

  const [, setSeed] = useLocalStorageState<string>("dmmc.sheet.seed", "DMMC");
  const [sheetSize, setSheetSize] = useLocalStorageState<number>(
    "dmmc.sheet.size",
    12,
  );
  const [sheet, setSheet] = useLocalStorageState<SheetEntry[]>(
    "dmmc.sheet.entries",
    [],
  );

  const [mode, setMode] = useLocalStorageState<BanPickMode>(
    "dmmc.sheet.banpick.mode",
    {
      enabled: false,
      teamA: "Team A",
      teamB: "Team B",
      bansPerTeam: 1,
      picksPerTeam: 3,
    },
  );

  const [turn, setTurn] = useLocalStorageState<number>("dmmc.sheet.turn", 0);

  const [fx, setFx] = useState<{ id: number; chars: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const s = await fetchMaimaiSongs();
        if (!cancelled) setSongs(s);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch songs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    if (!songs) return [];
    return ["all", ...uniq(songs.map((s) => s.category)).sort((a, b) => a.localeCompare(b))];
  }, [songs]);

  const filtered = useMemo(() => {
    if (!songs) return [];

    return songs.filter((s) => {
      if (query.trim()) {
        const q = query.trim();
        if (!includesLoose(s.title, q) && !includesLoose(s.artist, q)) return false;
      }
      if (category !== "all" && s.category !== category) return false;
      if (typeFilter === "dx" && !s.hasDx) return false;
      if (typeFilter === "std" && !s.hasStd) return false;

      const lv = s.maxLevelValue;
      if (lv != null) {
        if (lv < minLevel || lv > maxLevel) return false;
      }

      return true;
    });
  }, [songs, query, category, typeFilter, minLevel, maxLevel]);

  const stats = useMemo(() => {
    const total = songs?.length ?? 0;
    const shown = filtered.length;
    return { total, shown };
  }, [songs, filtered.length]);

  const songById = useMemo(() => {
    const map = new Map<string, MaimaiSong>();
    for (const s of songs ?? []) map.set(s.id, s);
    return map;
  }, [songs]);

  const selectedSong = useMemo(() => {
    if (!selectedSongId) return null;
    return songById.get(selectedSongId) ?? null;
  }, [selectedSongId, songById]);

  const actionPlan = useMemo(() => {
    if (!mode.enabled) return [] as Array<"banA" | "banB" | "pickA" | "pickB">;

    const plan: Array<"banA" | "banB" | "pickA" | "pickB"> = [];

    for (let i = 0; i < mode.bansPerTeam; i += 1) {
      plan.push("banA");
      plan.push("banB");
    }
    for (let i = 0; i < mode.picksPerTeam; i += 1) {
      plan.push("pickA");
      plan.push("pickB");
    }

    return plan;
  }, [mode]);

  const currentStep = actionPlan[turn] ?? null;

  const isDone = useMemo(() => {
    if (!mode.enabled) return false;
    return turn >= actionPlan.length;
  }, [mode.enabled, turn, actionPlan.length]);

  const promptText = useMemo(() => {
    if (!mode.enabled) return "Tap songs to preview. Generate a Random Sheet to start.";
    if (isDone) return "Draft complete. Good luck and play clean.";

    switch (currentStep) {
      case "banA":
        return `${mode.teamA} — BAN a song`;
      case "banB":
        return `${mode.teamB} — BAN a song`;
      case "pickA":
        return `${mode.teamA} — PICK a song`;
      case "pickB":
        return `${mode.teamB} — PICK a song`;
      default:
        return "";
    }
  }, [mode, isDone, currentStep]);

  const picked = sheet.filter((x) => x.status === "picked");
  const banned = sheet.filter((x) => x.status === "banned");

  const selectedEntry = useMemo(() => {
    if (!selectedSongId) return null;
    return sheet.find((x) => x.id === selectedSongId) ?? null;
  }, [selectedSongId, sheet]);

  const modalActionLabel = useMemo(() => {
    if (!mode.enabled) return null;
    if (isDone) return null;
    if (!currentStep) return null;

    if (currentStep === "banA") return `${mode.teamA} — BAN`;
    if (currentStep === "banB") return `${mode.teamB} — BAN`;
    if (currentStep === "pickA") return `${mode.teamA} — PICK`;
    if (currentStep === "pickB") return `${mode.teamB} — PICK`;
    return null;
  }, [mode, isDone, currentStep]);

  const modalActionDisabled = useMemo(() => {
    if (!mode.enabled) return true;
    if (!selectedEntry) return true;
    return selectedEntry.status !== "available";
  }, [mode.enabled, selectedEntry]);

  function generateSheet() {
    if (!songs) return;

    const nextSeed =
      "DMMC-" +
      Math.random().toString(16).slice(2) +
      "-" +
      Date.now().toString(16);
    setSeed(nextSeed);

    const charset =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789★☆";
    let burst = "";
    for (let i = 0; i < 36; i += 1) {
      burst += charset[Math.floor(Math.random() * charset.length)];
    }
    setFx({ id: Date.now(), chars: burst });
    window.setTimeout(() => setFx(null), 900);

    const rng = seededRng(nextSeed + `|${query}|${category}|${typeFilter}|${minLevel}-${maxLevel}`);

    const pool = filtered.map((s) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      category: s.category,
      bpm: s.bpm,
      maxLevelValue: s.maxLevelValue,
      imageName: s.imageName,
      status: "available" as const,
    }));

    const chosen = pickN(pool, clamp(Number(sheetSize) || 12, 4, 40), rng);

    setSheet(chosen);
    setTurn(0);
  }

  function resetDraft() {
    setSheet((prev) => prev.map((x) => ({ ...x, status: "available" })));
    setTurn(0);
  }

  function clickEntry(id: string) {
    setSelectedSongId(id);
  }

  function performModalAction() {
    if (!selectedSongId) return;
    if (!mode.enabled) return;
    if (isDone) return;

    const step = currentStep;
    if (!step) return;

    setSheet((prev) => {
      const entry = prev.find((x) => x.id === selectedSongId);
      if (!entry) return prev;
      if (entry.status !== "available") return prev;

      const nextStatus = step.startsWith("ban") ? "banned" : "picked";
      return prev.map((x) =>
        x.id === selectedSongId ? { ...x, status: nextStatus } : x,
      );
    });

    setTurn((t) => t + 1);
    setSelectedSongId(null);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <SongDetailModal
        open={!!selectedSong}
        song={selectedSong}
        onClose={() => setSelectedSongId(null)}
        actionLabel={modalActionLabel}
        onAction={modalActionLabel ? performModalAction : null}
        actionDisabled={modalActionDisabled}
      />

      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-white/80">
          <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_16px_rgba(57,183,255,0.55)]" />
          OPERATOR MODE — MAIMAI SONG SELECT
        </div>

        <h1 className="mt-4 text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
          Song Library + Random Sheets
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
          Filter the full maimai list, generate a seedable random sheet, then run a ban/pick draft like a tournament stage.
        </p>
      </div>

      {fx ? (
        <div
          key={fx.id}
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,79,216,0.18),transparent_60%)] opacity-80 animate-[pulse_0.6s_ease-in-out_1]" />
          <div className="max-w-4xl px-6 text-center font-mono text-sm font-black tracking-widest text-white/80 [text-shadow:0_0_14px_rgba(57,183,255,0.35)] animate-[floaty_0.8s_ease-in-out_1]">
            {fx.chars}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest text-white/60">FILTERS</div>
              <div className="mt-1 text-sm font-semibold text-white/80">
                Showing {stats.shown} / {stats.total}
              </div>
            </div>

            <div className="text-xs font-semibold text-white/60">
              {loading ? "Fetching songs…" : error ? "Fetch failed" : "Ready"}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold tracking-widest text-white/70">SEARCH</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="title / artist"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-widest text-white/70">CATEGORY</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-fuchsia-400/40"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-widest text-white/70">CHART TYPE</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
              >
                <option value="all">All</option>
                <option value="dx">DX only</option>
                <option value="std">STD only</option>
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold tracking-widest text-white/70">MIN LV</span>
                <input
                  type="number"
                  value={minLevel}
                  onChange={(e) => setMinLevel(Number(e.target.value || 1))}
                  min={1}
                  max={15}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold tracking-widest text-white/70">MAX LV</span>
                <input
                  type="number"
                  value={maxLevel}
                  onChange={(e) => setMaxLevel(Number(e.target.value || 15))}
                  min={1}
                  max={15}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <label className="block">
                <span className="text-xs font-bold tracking-widest text-white/70">SHEET SIZE</span>
                <input
                  type="number"
                  value={sheetSize}
                  onChange={(e) => setSheetSize(Number(e.target.value || 12))}
                  min={4}
                  max={40}
                  className="mt-2 w-[120px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={generateSheet}
                disabled={loading || !!error}
                className="rounded-full bg-[linear-gradient(180deg,#29ff8a,#0bd66a)] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(41,255,138,0.55),0_0_24px_rgba(41,255,138,0.25)] hover:shadow-[0_0_0_1px_rgba(41,255,138,0.75),0_0_34px_rgba(41,255,138,0.45)] disabled:opacity-50"
              >
                Generate Random Sheet
              </button>
              <button
                type="button"
                onClick={resetDraft}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              >
                Reset Sheet
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold tracking-widest text-white/60">SHEET</div>
            <p className="mt-2 text-sm font-semibold text-white/80">{promptText}</p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sheet.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/70 sm:col-span-2">
                  Generate a sheet to begin.
                </div>
              ) : (
                sheet.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => clickEntry(x.id)}
                    className={
                      "relative overflow-hidden rounded-2xl border p-4 text-left ring-1 transition " +
                      (x.status === "picked"
                        ? "border-emerald-400/25 bg-emerald-400/10 ring-emerald-300/20"
                        : x.status === "banned"
                          ? "border-red-400/25 bg-red-400/10 ring-red-300/20"
                          : "border-white/10 bg-black/20 ring-white/10 hover:bg-black/30")
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 ring-1 ring-white/10">
                        {maimaiCoverUrl(x.imageName) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={maimaiCoverUrl(x.imageName) ?? ""}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-[10px] font-black tracking-widest text-white/50">
                            DMMC
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-white">
                              {x.title}
                            </div>
                            <div className="mt-1 truncate text-xs font-semibold text-white/70">
                              {x.artist}
                            </div>
                          </div>
                          <div className="shrink-0 text-xs font-bold text-white/60">
                            {x.maxLevelValue != null ? `MAX ${x.maxLevelValue}` : ""}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70">
                          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                            {x.category}
                          </span>
                          {x.bpm != null ? (
                            <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                              {x.bpm} BPM
                            </span>
                          ) : null}
                          {x.status !== "available" ? (
                            <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                              {x.status.toUpperCase()}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs font-bold tracking-widest text-white/60">BAN / PICK MODE</div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white/80">
                Draft Control
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode((m) => ({ ...m, enabled: !m.enabled }));
                  setTurn(0);
                  setSheet((prev) => prev.map((x) => ({ ...x, status: "available" })));
                }}
                className={
                  "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition " +
                  (mode.enabled
                    ? "bg-fuchsia-400/15 text-fuchsia-100 ring-fuchsia-300/25"
                    : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white")
                }
              >
                {mode.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="block">
                <span className="text-xs font-bold tracking-widest text-white/70">TEAM A</span>
                <input
                  value={mode.teamA}
                  onChange={(e) => setMode((m) => ({ ...m, teamA: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold tracking-widest text-white/70">TEAM B</span>
                <input
                  value={mode.teamB}
                  onChange={(e) => setMode((m) => ({ ...m, teamB: e.target.value }))}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-fuchsia-400/40"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-bold tracking-widest text-white/70">BANS / TEAM</span>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={mode.bansPerTeam}
                    onChange={(e) =>
                      setMode((m) => ({
                        ...m,
                        bansPerTeam: clamp(Number(e.target.value || 0), 0, 5),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold tracking-widest text-white/70">PICKS / TEAM</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={mode.picksPerTeam}
                    onChange={(e) =>
                      setMode((m) => ({
                        ...m,
                        picksPerTeam: clamp(Number(e.target.value || 0), 0, 10),
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
                  />
                </label>
              </div>

              <div className="mt-1 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-bold tracking-widest text-white/60">STATUS</div>
                <div className="mt-2 text-sm font-semibold text-white/80">
                  Turn {Math.min(turn + 1, actionPlan.length)} / {actionPlan.length}
                </div>
                <div className="mt-1 text-xs font-semibold text-white/60">
                  {mode.enabled ? (isDone ? "Completed" : "In Progress") : "Off"}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-bold tracking-widest text-white/60">BANNED</div>
                    <div className="mt-1 text-lg font-black text-white">{banned.length}</div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs font-bold tracking-widest text-white/60">PICKED</div>
                    <div className="mt-1 text-lg font-black text-white">{picked.length}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTurn(0);
                      setSheet((prev) => prev.map((x) => ({ ...x, status: "available" })));
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                  >
                    Reset Draft
                  </button>

                  <GlowButton
                    href="/tournament"
                    variant="pink"
                    className="w-full"
                    onClick={() => {
                      try {
                        const pickedIds = sheet.filter((x) => x.status === "picked").map((x) => x.id);
                        window.localStorage.setItem(
                          "dmmc.tournament.importSongs",
                          JSON.stringify({ ids: pickedIds, at: Date.now() }),
                        );
                      } catch {
                        // ignore
                      }
                    }}
                  >
                    Go to Tournament Bracket
                  </GlowButton>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
            <div className="text-xs font-bold tracking-widest text-white/60">DATA SOURCE</div>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Songs are fetched live from the community dataset.
            </p>
            <a
              className="mt-3 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              href="https://dp4p6x0xfi5o9.cloudfront.net/maimai/data.json"
              target="_blank"
              rel="noreferrer"
            >
              Open data.json
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
