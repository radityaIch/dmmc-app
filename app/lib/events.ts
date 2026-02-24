export type DmmcEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  description: string;
  important?: boolean;
};

export const mockEvents: DmmcEvent[] = [
  {
    id: "weekend-grind-chill-2026-02-28",
    title: "Weekend Grind & Chill",
    date: "2026-02-28",
    time: "16:00",
    location: "Timezone Level 21",
    description:
      "Warm-ups, song requests, and casual sets. Perfect for new members and anyone chasing consistency.",
  },
  {
    id: "monthly-score-attack-2026-03-08",
    title: "Monthly Score Attack (SSS+ Chase)",
    date: "2026-03-08",
    time: "18:30",
    location: "Timezone Mall Bali Galeria",
    description:
      "Bring your best picks. We’ll do a friendly leaderboard for the night and celebrate PBs.",
    important: true,
  },
  {
    id: "newbie-bootcamp-2026-03-15",
    title: "Newbie Bootcamp: From Basic to Expert",
    date: "2026-03-15",
    time: "15:00",
    location: "Timezone Level 21",
    description:
      "Technique clinic: reading patterns, stamina tips, and how to stop getting jumpscared by slides.",
  },
  {
    id: "late-night-arcade-run-2026-03-22",
    title: "Late Night Arcade Run",
    date: "2026-03-22",
    time: "20:00",
    location: "Trans Studio Mall Denpasar",
    description:
      "High-BPM vibes, neon lights, and a chill hangout. Great for photos and meeting other players.",
  },
];
