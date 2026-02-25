import Dexie, { type Table } from "dexie";
import type { MaimaiSong } from "./maimai";

export type TournamentStateRecord = {
  id: "current";
  name: string;
  players: Array<{ id: string; name: string }>;
  bracket: Array<{
    id: string;
    round: number;
    index: number;
    p1: { id: string; name: string } | null;
    p2: { id: string; name: string } | null;
    winnerId: string | null;
  }> | null;
  matchConfigs: Record<
    string,
    {
      songCount: number;
      songs: Array<{
        song: string;
        p1Score: number | null;
        p2Score: number | null;
      }>;
    }
  >;
};

export type SongCacheRecord = {
  id: "maimai-songs";
  songs: MaimaiSong[];
  updatedAt: number;
};

class DmmcDb extends Dexie {
  tournamentStates!: Table<TournamentStateRecord, string>;
  songCache!: Table<SongCacheRecord, string>;

  constructor() {
    super("dmmc");
    this.version(1).stores({
      tournamentStates: "id",
    });
    this.version(2).stores({
      tournamentStates: "id",
      songCache: "id, updatedAt",
    });
  }
}

export const db = new DmmcDb();
