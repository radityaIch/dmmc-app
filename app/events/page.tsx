"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { eventDate } from "../lib/events";

import { CalendarGrid } from "../components/CalendarGrid";
import { EventCard } from "../components/EventCard";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

export default function EventsPage() {
  const [view, setView] = useState<"cards" | "calendar">("calendar");
  const rawEvents = useQuery(api.handlers.event.listApproved);
  const events = useMemo(() => rawEvents ?? [], [rawEvents]);

  const focusDate = useMemo(() => {
    const sorted = [...events].sort((a, b) =>
      a.datetime.localeCompare(b.datetime),
    );
    const first = sorted[0];
    return first ? eventDate(first) : new Date().toISOString().slice(0, 10);
  }, [events]);

  return (
    <PageWrapper>
      <PageCard color="pink">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionHeader color="pink" className="mb-2 sm:text-left">
              Upcoming Arcade Meetups
            </SectionHeader>
            <p className="text-center sm:text-left text-sm font-medium leading-6 text-slate-500 max-w-2xl">
              Pull up for rhythm game nights, score attacks, and chill sessions. Bring gloves, bring vibes.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setView("cards")}
              className={
                "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition " +
                (view === "cards"
                  ? "bg-[#f472b6]/20 text-slate-700 ring-[#f472b6]/40"
                  : "bg-slate-100 text-slate-400 ring-[#334155]/15 hover:bg-pink-50 hover:text-slate-700")
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
                  ? "bg-[#f472b6]/20 text-slate-700 ring-[#f472b6]/40"
                  : "bg-slate-100 text-slate-400 ring-[#334155]/15 hover:bg-pink-50 hover:text-slate-700")
              }
            >
              Calendar
            </button>
          </div>
        </div>
      </PageCard>

      {events.length === 0 ? (
        <PageCard color="pink" className="text-center mb-12">
          <p className="text-sm text-slate-400">No upcoming events yet. Check back soon!</p>
        </PageCard>
      ) : view === "calendar" ? (
        <div className="mb-12">
          <CalendarGrid events={events} focusDate={focusDate} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-12">
          {events.map((e) => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
