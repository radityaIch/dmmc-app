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
      <div className="mb-6 rounded-3xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-6 shadow-[0_0_0_1px_rgba(255,79,216,0.14),0_16px_45px_rgba(18,8,30,0.45)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Upcoming Arcade Meetups
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
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
                ? "bg-[#ff4fd8]/20 text-pink-100 ring-[#ff4fd8]/40"
                : "bg-white/8 text-white/75 ring-white/20 hover:bg-[#ff4fd8]/15 hover:text-white")
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
                ? "bg-[#ff4fd8]/20 text-pink-100 ring-[#ff4fd8]/40"
                : "bg-white/8 text-white/75 ring-white/20 hover:bg-[#ff4fd8]/15 hover:text-white")
            }
          >
            Calendar
          </button>
        </div>
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
