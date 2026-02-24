"use client";

import { useMemo, useState } from "react";

import { CalendarGrid } from "../components/CalendarGrid";
import { EventCard } from "../components/EventCard";
import { mockEvents } from "../lib/events";

export default function EventsPage() {
  const [view, setView] = useState<"cards" | "calendar">("calendar");

  const focusDate = useMemo(() => {
    const first = [...mockEvents].sort((a, b) =>
      (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time),
    )[0];
    return first?.date ?? new Date().toISOString().slice(0, 10);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Upcoming Arcade Meetups
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Pull up for rhythm game nights, score attacks, and chill sessions. Bring gloves, bring vibes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={
              "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition " +
              (view === "cards"
                ? "bg-white/10 text-white ring-white/20"
                : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white")
            }
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={
              "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition " +
              (view === "calendar"
                ? "bg-white/10 text-white ring-white/20"
                : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white")
            }
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "calendar" ? (
        <CalendarGrid events={mockEvents} focusDate={focusDate} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mockEvents.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
