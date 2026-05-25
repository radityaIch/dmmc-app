import type { DmmcEvent } from "../lib/events";
import { eventDate, eventTime } from "../lib/events";
import Link from "next/link";

import { useMemo, useState } from "react";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthTitle(d: Date) {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function CalendarGrid({
  events,
  focusDate,
}: {
  events: DmmcEvent[];
  focusDate: string;
}) {
  const [monthFocus, setMonthFocus] = useState(() => new Date(focusDate + "T00:00:00"));

  const focus = monthFocus;
  const start = startOfMonth(focus);
  const end = endOfMonth(focus);

  const firstWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = end.getDate();

  const byDate = useMemo(() => {
    const map = new Map<string, DmmcEvent[]>();
    for (const e of events) {
      const date = eventDate(e);
      const list = map.get(date) ?? [];
      list.push(e);
      map.set(date, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => a.datetime.localeCompare(b.datetime));
      map.set(k, list);
    }
    return map;
  }, [events]);

  const cells: Array<{ date: Date | null }> = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push({ date: null });
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(focus.getFullYear(), focus.getMonth(), day) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null });

  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="rounded-2xl border border-pink-300/30 bg-white/90 backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(244,114,182,0.08)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-400">CALENDAR</div>
          <div className="mt-1 text-lg font-black tracking-tight text-slate-700">
            {monthTitle(focus)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthFocus((d) => addMonths(d, -1))}
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-pink-50 hover:text-slate-700"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setMonthFocus(new Date(focusDate + "T00:00:00"))}
            className="hidden rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-pink-50 hover:text-slate-700 sm:block"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthFocus((d) => addMonths(d, 1))}
            className="rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-pink-50 hover:text-slate-700"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-bold tracking-widest text-slate-700/45">
        {weekLabels.map((w) => (
          <div key={w} className="px-1">
            {w}
          </div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {cells.map((c, idx) => {
          if (!c.date) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-[92px] rounded-xl border border-[#334155]/8 bg-[#334155]/3"
              />
            );
          }

          const key = toKey(c.date);
          const dayEvents = byDate.get(key) ?? [];

          return (
            <div
              key={key}
              className={
                "relative h-[92px] overflow-hidden rounded-xl border p-2 ring-1 " +
                (dayEvents.length > 0
                  ? "border-pink-300/30 bg-pink-50/50 ring-[#f472b6]/15 shadow-[0_0_16px_rgba(244,114,182,0.10)]"
                  : "border-slate-100 bg-white/60 ring-[#334155]/5")
              }
            >
              <div className="flex items-start justify-between">
                <div className="text-xs font-black text-slate-700">{c.date.getDate()}</div>
                {dayEvents.length > 0 ? (
                  <div className="h-2 w-2 rounded-full bg-[#f472b6] shadow-[0_0_8px_rgba(244,114,182,0.5)]" />
                ) : null}
              </div>

              <div className="mt-2 max-h-[56px] space-y-1 overflow-auto pr-1">
                {dayEvents.map((e) => (
                  <Link
                    key={e._id}
                    href={`/events/${e._id}`}
                    className="block w-full truncate rounded-md bg-pink-100 px-2 py-1 text-left text-[11px] font-semibold text-slate-700 ring-1 ring-[#f472b6]/20 transition hover:bg-[#f472b6]/25"
                    title={`${eventTime(e)} — ${e.name}`}
                  >
                    {eventTime(e)} {e.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
