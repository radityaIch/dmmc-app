"use client";

import { useEffect, useMemo, useState } from "react";

import { GlowButton } from "../components/GlowButton";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";
import { SongCombobox } from "../components/SongCombobox";
import { db, type TournamentStateRecord } from "../lib/db";
import type { MaimaiSong } from "../lib/maimai";
import { fetchMaimaiSongs } from "../lib/maimai";

type Player = { id: string; name: string };

type Match = {
  id: string;
  round: number;
  index: number;
  p1: Player | null;
  p2: Player | null;
  winnerId: string | null;
};

type StoredMatch = NonNullable<TournamentStateRecord["bracket"]>[number];

type MatchConfig = TournamentStateRecord["matchConfigs"][string];

function clampScore(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  const clamped = Math.max(min, Math.min(max, n));
  return Math.round(clamped * 10000) / 10000;
}

function normalizeMatchConfigs(
  input: TournamentStateRecord["matchConfigs"] | undefined,
): TournamentStateRecord["matchConfigs"] {
  const data = input ?? {};
  const next: TournamentStateRecord["matchConfigs"] = {};

  for (const [matchId, cfg] of Object.entries(data)) {
    const songCount = Math.max(1, Math.min(4, Math.trunc(Number(cfg.songCount ?? 1) || 1)));
    const rawSongs = (cfg as unknown as { songs?: unknown }).songs;

    const songs: MatchConfig["songs"] = Array.isArray(rawSongs)
      ? rawSongs.map((x) => {
          if (typeof x === "string") {
            return { song: x, p1Score: null, p2Score: null };
          }
          if (x && typeof x === "object") {
            const obj = x as { song?: unknown; p1Score?: unknown; p2Score?: unknown };
            return {
              song: typeof obj.song === "string" ? obj.song : "",
              p1Score: typeof obj.p1Score === "number" ? clampScore(obj.p1Score, 0, 101) : null,
              p2Score: typeof obj.p2Score === "number" ? clampScore(obj.p2Score, 0, 101) : null,
            };
          }
          return { song: "", p1Score: null, p2Score: null };
        })
      : [];

    while (songs.length < songCount) {
      songs.push({ song: "", p1Score: null, p2Score: null });
    }

    next[matchId] = {
      songCount,
      songs: songs.slice(0, songCount),
    };
  }

  return next;
}

function newId(prefix: string) {
  return prefix + "_" + Math.random().toString(16).slice(2);
}

function nextPow2(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function buildBracket(players: Player[]): Match[] {
  const size = nextPow2(players.length);
  const seeded = [...players];

  while (seeded.length < size) {
    seeded.push({ id: newId("bye"), name: "BYE" });
  }

  const round1: Match[] = [];
  for (let i = 0; i < size / 2; i += 1) {
    const p1 = seeded[i * 2] ?? null;
    const p2 = seeded[i * 2 + 1] ?? null;

    const autoWin =
      (p1?.name === "BYE" && p2?.name !== "BYE" ? p2?.id : null) ??
      (p2?.name === "BYE" && p1?.name !== "BYE" ? p1?.id : null);

    round1.push({
      id: newId("m"),
      round: 1,
      index: i,
      p1: p1?.name === "BYE" ? null : p1,
      p2: p2?.name === "BYE" ? null : p2,
      winnerId: autoWin ?? null,
    });
  }

  const matches: Match[] = [...round1];

  let round = 2;
  let matchesInRound = round1.length / 2;
  while (matchesInRound >= 1) {
    for (let i = 0; i < matchesInRound; i += 1) {
      matches.push({
        id: newId("m"),
        round,
        index: i,
        p1: null,
        p2: null,
        winnerId: null,
      });
    }
    round += 1;
    matchesInRound = Math.floor(matchesInRound / 2);
  }

  return matches;
}

function roundName(round: number) {
  if (round === 1) return "Round 1";
  if (round === 2) return "Quarterfinals";
  if (round === 3) return "Semifinals";
  if (round === 4) return "Finals";
  return `Round ${round}`;
}

export default function TournamentPage() {
  const [loaded, setLoaded] = useState(false);
  const [name, setName] = useState("DMMC Weekly Bracket");
  const [players, setPlayers] = useState<Player[]>([
    { id: "p1", name: "Player 1" },
    { id: "p2", name: "Player 2" },
    { id: "p3", name: "Player 3" },
    { id: "p4", name: "Player 4" },
  ]);

  const [songs, setSongs] = useState<MaimaiSong[] | null>(null);
  const [importSongIds, setImportSongIds] = useState<string[] | null>(null);
  const [songsOpenByMatch, setSongsOpenByMatch] = useState<Record<string, boolean>>({});

  const [bracket, setBracket] = useState<Match[] | null>(null);
  const [matchConfigs, setMatchConfigs] = useState<TournamentStateRecord["matchConfigs"]>({});

  const serializedBracket = useMemo<TournamentStateRecord["bracket"]>(() => {
    if (!bracket) return null;
    return bracket.map((m): StoredMatch => ({
      id: m.id,
      round: m.round,
      index: m.index,
      p1: m.p1,
      p2: m.p2,
      winnerId: m.winnerId,
    }));
  }, [bracket]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const rec = await db.tournamentStates.get("current");
        if (cancelled) return;

        if (rec) {
          setName(rec.name);
          setPlayers(rec.players);
          setBracket((rec.bracket ?? null) as Match[] | null);
          setMatchConfigs(normalizeMatchConfigs(rec.matchConfigs));
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("dmmc.tournament.importSongs");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { ids?: unknown };
      if (!Array.isArray(parsed.ids)) return;
      const ids = parsed.ids.filter((x): x is string => typeof x === "string");
      setImportSongIds(ids);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const s = await fetchMaimaiSongs();
        if (!cancelled) setSongs(s);
      } catch {
        if (!cancelled) setSongs([]);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const rec: TournamentStateRecord = {
      id: "current",
      name,
      players,
      bracket: serializedBracket,
      matchConfigs,
    };

    const t = window.setTimeout(() => {
      db.tournamentStates.put(rec).catch(() => {
        // ignore
      });
    }, 200);

    return () => window.clearTimeout(t);
  }, [loaded, name, players, serializedBracket, matchConfigs]);

  const rounds = useMemo(() => {
    const data = bracket ?? buildBracket(players);
    const byRound = new Map<number, Match[]>();
    for (const m of data) {
      const list = byRound.get(m.round) ?? [];
      list.push(m);
      byRound.set(m.round, list);
    }
    return Array.from(byRound.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([r, ms]) => ({
        round: r,
        matches: ms.sort((a, b) => a.index - b.index),
      }));
  }, [bracket, players]);

  const songOptions = useMemo(() => {
    return (songs ?? []).map((s) => ({
      value: s.id,
      label: s.title,
      subLabel: s.artist,
    }));
  }, [songs]);

  function createBracket() {
    const b = buildBracket(players);
    setBracket(b);
    setMatchConfigs((prev) => {
      const next = { ...prev };
      for (const m of b) {
        if (!next[m.id]) {
          next[m.id] = {
            songCount: 1,
            songs: [{ song: "", p1Score: null, p2Score: null }],
          };
        }
      }
      return next;
    });
  }

  function setWinner(matchId: string, winnerId: string) {
    setBracket((prev) => {
      const current = prev ?? buildBracket(players);
      const next = current.map((m) =>
        m.id === matchId ? { ...m, winnerId } : m,
      );

      // advance winners forward
      const byRound = new Map<number, Match[]>();
      for (const m of next) {
        const list = byRound.get(m.round) ?? [];
        list.push(m);
        byRound.set(m.round, list);
      }

      const maxRound = Math.max(...next.map((m) => m.round));

      for (let r = 1; r < maxRound; r += 1) {
        const rMatches = (byRound.get(r) ?? []).sort((a, b) => a.index - b.index);
        const nextMatches = (byRound.get(r + 1) ?? []).sort(
          (a, b) => a.index - b.index,
        );

        for (let i = 0; i < nextMatches.length; i += 1) {
          const from1 = rMatches[i * 2];
          const from2 = rMatches[i * 2 + 1];

          const p1 =
            from1?.winnerId != null
              ? players.find((p) => p.id === from1.winnerId) ?? null
              : null;
          const p2 =
            from2?.winnerId != null
              ? players.find((p) => p.id === from2.winnerId) ?? null
              : null;

          const nm = nextMatches[i];
          if (!nm) continue;

          next.forEach((m, idx) => {
            if (m.id === nm.id) {
              next[idx] = { ...m, p1, p2 };
            }
          });
        }
      }

      return next;
    });
  }

  function updateMatchConfig(matchId: string, updater: (c: MatchConfig) => MatchConfig) {
    setMatchConfigs((prev) => {
      const existing =
        prev[matchId] ??
        ({
          songCount: 1,
          songs: [{ song: "", p1Score: null, p2Score: null }],
        } satisfies MatchConfig);
      const next = updater(existing);
      return { ...prev, [matchId]: next };
    });
  }

  const totalsByMatch = useMemo(() => {
    const map = new Map<string, { p1: number | null; p2: number | null }>();
    for (const [matchId, cfg] of Object.entries(matchConfigs)) {
      const songs = cfg.songs ?? [];

      const p1Vals = songs.map((s) => s.p1Score).filter((x): x is number => typeof x === "number");
      const p2Vals = songs.map((s) => s.p2Score).filter((x): x is number => typeof x === "number");

      map.set(matchId, {
        p1: p1Vals.length > 0 ? p1Vals.reduce((a, b) => a + b, 0) : null,
        p2: p2Vals.length > 0 ? p2Vals.reduce((a, b) => a + b, 0) : null,
      });
    }
    return map;
  }, [matchConfigs]);

  function importPickedSongsIntoMatch(matchId: string) {
    if (!importSongIds || importSongIds.length === 0) return;

    updateMatchConfig(matchId, (c) => {
      const songCount = Math.max(1, Math.min(4, c.songCount));
      const nextSongs = [...(c.songs ?? [])];
      while (nextSongs.length < songCount) {
        nextSongs.push({ song: "", p1Score: null, p2Score: null });
      }

      for (let i = 0; i < songCount; i += 1) {
        const id = importSongIds[i] ?? "";
        const existing = nextSongs[i] ?? { song: "", p1Score: null, p2Score: null };
        nextSongs[i] = { ...existing, song: id };
      }

      return { songCount, songs: nextSongs.slice(0, songCount) };
    });

    try {
      window.localStorage.removeItem("dmmc.tournament.importSongs");
    } catch {
      // ignore
    }
    setImportSongIds(null);
  }

  const champion = useMemo(() => {
    const data = bracket;
    if (!data) return null;
    const maxRound = Math.max(...data.map((m) => m.round));
    const finals = data.filter((m) => m.round === maxRound);
    const final = finals[0];
    if (!final?.winnerId) return null;
    return players.find((p) => p.id === final.winnerId) ?? null;
  }, [bracket, players]);

  return (
    <PageWrapper className="max-w-6xl">
      {/* Page Header */}
      <PageCard color="pink">
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff4fd8]/30 bg-[#ff4fd8]/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#2f2461]/70">
            <span className="h-2 w-2 rounded-full bg-[#ff4fd8] shadow-[0_0_16px_rgba(255,79,216,0.55)]" />
            TOURNAMENT MODE — BRACKET
          </div>
        </div>
        <SectionHeader color="pink">{name}</SectionHeader>
        <p className="text-center text-sm font-medium leading-6 text-[#2f2461]/70 max-w-3xl mx-auto">
          Single-elimination bracket (customizable). Add players, generate bracket, then report match winners.
        </p>
      </PageCard>

      <div className="flex flex-col gap-6">
        {/* Setup Panel */}
        <PageCard color="blue">
          <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">SETUP</div>

          <label className="mt-4 block">
            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">TOURNAMENT NAME</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] outline-none ring-1 ring-transparent focus:ring-[#ff4fd8]/30"
            />
          </label>

          <div className="mt-5">
            <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">PLAYERS</div>
            <div className="mt-3 space-y-2">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    value={p.name}
                    onChange={(e) =>
                      setPlayers((prev) =>
                        prev.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)),
                      )
                    }
                    className="w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] outline-none ring-1 ring-transparent focus:ring-[#ff4fd8]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setPlayers((prev) => prev.filter((x) => x.id !== p.id))}
                    className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-3 py-2 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#ff4fd8]/10 hover:text-[#2f2461]"
                  >
                    Del
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setPlayers((prev) => [...prev, { id: newId("p"), name: `Player ${prev.length + 1}` }])
                }
                className="flex-1 rounded-full border border-[#ff4fd8]/30 bg-[#ff4fd8]/5 px-6 py-3 text-sm font-semibold text-[#2f2461] hover:bg-[#ff4fd8]/10"
              >
                Add Player
              </button>
              <button
                type="button"
                onClick={() => {
                  setBracket(null);
                }}
                className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-6 py-3 text-sm font-semibold text-[#2f2461]/70 hover:bg-[#ff4fd8]/10 hover:text-[#2f2461]"
              >
                Reset
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={createBracket}
                className="w-full rounded-full text-white bg-[linear-gradient(180deg,#ff4fd8,#ff2fb1)] px-6 py-3 text-sm font-semibold shadow-[0_0_0_1px_rgba(255,79,216,0.55),0_0_24px_rgba(255,79,216,0.25)] hover:shadow-[0_0_0_1px_rgba(255,79,216,0.75),0_0_34px_rgba(255,79,216,0.45)]"
              >
                Generate Bracket
              </button>
            </div>

            <div className="mt-4">
              <GlowButton href="/songs" variant="pink" className="w-full text-sm">
                Open Song Select
              </GlowButton>
            </div>
          </div>
        </PageCard>

        {/* Bracket Panel */}
        <PageCard color="yellow" className="mb-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">BRACKET</div>
              <div className="mt-1 text-sm font-semibold text-[#2f2461]/70">
                {bracket ? "Live" : "Preview"}
              </div>
            </div>
            {champion ? (
              <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-300/25">
                Champion: {champion.name}
              </div>
            ) : null}
          </div>

          <div className="mt-5">
            <div style={{ maxHeight: "70vh" }} className="overflow-auto pr-1">
              <div className="flex min-w-max items-start gap-6">
                {rounds.map((r) => (
                  <div key={r.round} className="w-96 shrink-0 space-y-4">
                    <div className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                      {roundName(r.round)}
                    </div>

                    {r.matches.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-[#2f2461]/10 bg-white/80 p-5 ring-1 ring-[#2f2461]/5"
                      >
                        <div className="text-xs font-semibold text-[#2f2461]/55">
                          Match {m.index + 1}
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            disabled={!m.p1}
                            onClick={() => m.p1 && setWinner(m.id, m.p1.id)}
                            className={
                              "rounded-xl border px-3 py-2 text-left text-sm font-semibold ring-1 transition " +
                              (m.winnerId === m.p1?.id
                                ? "border-emerald-400/25 bg-emerald-50 ring-emerald-300/20 text-[#2f2461]"
                                : "border-[#2f2461]/15 bg-white/60 ring-[#2f2461]/5 text-[#2f2461]/80 hover:bg-[#ff4fd8]/8 hover:border-[#ff4fd8]/20")
                            }
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="min-w-0 truncate">{m.p1?.name ?? "TBD"}</span>
                              {m.p1?.id ? (
                                <span className="shrink-0 text-xs font-black tracking-widest text-[#2f2461]/55">
                                  {(() => {
                                    const t = totalsByMatch.get(m.id);
                                    if (t?.p1 == null) return "";
                                    return t.p1.toFixed(4);
                                  })()}
                                </span>
                              ) : null}
                            </span>
                          </button>
                          <button
                            type="button"
                            disabled={!m.p2}
                            onClick={() => m.p2 && setWinner(m.id, m.p2.id)}
                            className={
                              "rounded-xl border px-3 py-2 text-left text-sm font-semibold ring-1 transition " +
                              (m.winnerId === m.p2?.id
                                ? "border-emerald-400/25 bg-emerald-50 ring-emerald-300/20 text-[#2f2461]"
                                : "border-[#2f2461]/15 bg-white/60 ring-[#2f2461]/5 text-[#2f2461]/80 hover:bg-[#ff4fd8]/8 hover:border-[#ff4fd8]/20")
                            }
                          >
                            <span className="flex items-center justify-between gap-3">
                              <span className="min-w-0 truncate">{m.p2?.name ?? "TBD"}</span>
                              {m.p2?.id ? (
                                <span className="shrink-0 text-xs font-black tracking-widest text-[#2f2461]/55">
                                  {(() => {
                                    const t = totalsByMatch.get(m.id);
                                    if (t?.p2 == null) return "";
                                    return t.p2.toFixed(4);
                                  })()}
                                </span>
                              ) : null}
                            </span>
                          </button>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#2f2461]/10 bg-[#2f2461]/5 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-xs font-bold tracking-widest text-[#2f2461]/55">
                              SONGS
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSongsOpenByMatch((prev) => ({
                                    ...prev,
                                    [m.id]: !(prev[m.id] ?? false),
                                  }))
                                }
                                className="rounded-full border border-[#2f2461]/20 bg-white/60 px-3 py-1 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#ff4fd8]/10 hover:text-[#2f2461]"
                              >
                                {(songsOpenByMatch[m.id] ?? false) ? "Hide" : "Show"}
                              </button>

                              {importSongIds && importSongIds.length > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => importPickedSongsIntoMatch(m.id)}
                                  className="rounded-full border border-[#ff4fd8]/30 bg-[#ff4fd8]/5 px-3 py-1 text-xs font-semibold text-[#2f2461] hover:bg-[#ff4fd8]/10"
                                >
                                  Import Picked
                                </button>
                              ) : null}

                              <label className="flex items-center gap-2 text-xs font-semibold text-[#2f2461]/60">
                                <span>Count</span>
                                <select
                                  value={matchConfigs[m.id]?.songCount ?? 1}
                                  onChange={(e) => {
                                    const songCount = Math.max(
                                      1,
                                      Math.min(4, Number(e.target.value || 1)),
                                    );
                                    updateMatchConfig(m.id, (c) => {
                                      const songs = [...(c.songs ?? [])];
                                      while (songs.length < songCount) {
                                        songs.push({ song: "", p1Score: null, p2Score: null });
                                      }
                                      return { songCount, songs: songs.slice(0, songCount) };
                                    });
                                  }}
                                  className="rounded-full border border-[#2f2461]/20 bg-white/80 px-3 py-1 text-xs font-semibold text-[#2f2461] outline-none"
                                >
                                  <option value={1}>1</option>
                                  <option value={2}>2</option>
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                </select>
                              </label>
                            </div>
                          </div>

                          {(songsOpenByMatch[m.id] ?? false) ? (
                            <div className="mt-4 space-y-3">
                              {Array.from({
                                length: matchConfigs[m.id]?.songCount ?? 1,
                              }).map((_, idx) => (
                                <div
                                  key={idx}
                                  className="rounded-xl border border-[#2f2461]/10 bg-white/60 p-4 ring-1 ring-transparent focus-within:ring-[#ff4fd8]/30"
                                >
                                  <div className="grid grid-cols-1 gap-3">
                                    <label className="block">
                                      <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/55">
                                        Song {idx + 1}
                                      </div>
                                      <div className="mt-1">
                                        <SongCombobox
                                          value={matchConfigs[m.id]?.songs?.[idx]?.song ?? ""}
                                          onChange={(v) => {
                                            updateMatchConfig(m.id, (c) => {
                                              const songCount = Math.max(1, Math.min(4, c.songCount));
                                              const songs = [...(c.songs ?? [])];
                                              while (songs.length < songCount) {
                                                songs.push({ song: "", p1Score: null, p2Score: null });
                                              }
                                              const existing = songs[idx] ?? {
                                                song: "",
                                                p1Score: null,
                                                p2Score: null,
                                              };
                                              songs[idx] = { ...existing, song: v };
                                              return { songCount, songs: songs.slice(0, songCount) };
                                            });
                                          }}
                                          options={songOptions}
                                          placeholder="Select song…"
                                        />
                                      </div>
                                    </label>

                                    <div className="grid grid-cols-2 gap-2">
                                      <label className="block">
                                        <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/55">
                                          P1
                                        </div>
                                        <input
                                          type="number"
                                          inputMode="decimal"
                                          min={0}
                                          max={101}
                                          step={0.0001}
                                          value={matchConfigs[m.id]?.songs?.[idx]?.p1Score ?? ""}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            updateMatchConfig(m.id, (c) => {
                                              const songCount = Math.max(1, Math.min(4, c.songCount));
                                              const songs = [...(c.songs ?? [])];
                                              while (songs.length < songCount) {
                                                songs.push({
                                                  song: "",
                                                  p1Score: null,
                                                  p2Score: null,
                                                });
                                              }
                                              const existing = songs[idx] ?? {
                                                song: "",
                                                p1Score: null,
                                                p2Score: null,
                                              };
                                              const p1Score =
                                                raw.trim() === ""
                                                  ? null
                                                  : clampScore(Number(raw), 0, 101);
                                              songs[idx] = { ...existing, p1Score };
                                              return { songCount, songs: songs.slice(0, songCount) };
                                            });
                                          }}
                                          className="mt-1 w-full rounded-lg border border-[#2f2461]/20 bg-white/80 px-3 py-2 text-sm text-[#2f2461] outline-none"
                                          placeholder="0-101.0000"
                                        />
                                      </label>
                                      <label className="block">
                                        <div className="text-[10px] font-bold tracking-widest text-[#2f2461]/55">
                                          P2
                                        </div>
                                        <input
                                          type="number"
                                          inputMode="decimal"
                                          min={0}
                                          max={101}
                                          step={0.0001}
                                          value={matchConfigs[m.id]?.songs?.[idx]?.p2Score ?? ""}
                                          onChange={(e) => {
                                            const raw = e.target.value;
                                            updateMatchConfig(m.id, (c) => {
                                              const songCount = Math.max(1, Math.min(4, c.songCount));
                                              const songs = [...(c.songs ?? [])];
                                              while (songs.length < songCount) {
                                                songs.push({
                                                  song: "",
                                                  p1Score: null,
                                                  p2Score: null,
                                                });
                                              }
                                              const existing = songs[idx] ?? {
                                                song: "",
                                                p1Score: null,
                                                p2Score: null,
                                              };
                                              const p2Score =
                                                raw.trim() === ""
                                                  ? null
                                                  : clampScore(Number(raw), 0, 101);
                                              songs[idx] = { ...existing, p2Score };
                                              return { songCount, songs: songs.slice(0, songCount) };
                                            });
                                          }}
                                          className="mt-1 w-full rounded-lg border border-[#2f2461]/20 bg-white/80 px-3 py-2 text-sm text-[#2f2461] outline-none"
                                          placeholder="0-101.0000"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PageCard>
      </div>
    </PageWrapper>
  );
}
