import Dexie, { type Table } from "dexie";

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

class DmmcDb extends Dexie {
  tournamentStates!: Table<TournamentStateRecord, string>;

  constructor() {
    super("dmmc");
    this.version(1).stores({
      tournamentStates: "id",
    });
  }
}

export const db = new DmmcDb();
