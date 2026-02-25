import type { DmmcEvent } from "../lib/events";

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

function formatFullDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CalendarGrid({
  events,
  focusDate,
}: {
  events: DmmcEvent[];
  focusDate: string;
}) {
  const [monthFocus, setMonthFocus] = useState(() => new Date(focusDate + "T00:00:00"));
  const [selectedEvent, setSelectedEvent] = useState<DmmcEvent | null>(null);

  const focus = monthFocus;
  const start = startOfMonth(focus);
  const end = endOfMonth(focus);

  const firstWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = end.getDate();

  const byDate = useMemo(() => {
    const map = new Map<string, DmmcEvent[]>();
    for (const e of events) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    for (const [k, list] of map.entries()) {
      list.sort((a, b) => (a.date + "T" + a.time).localeCompare(b.date + "T" + b.time));
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
    <div className="rounded-2xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 ring-1 ring-[#ff4fd8]/20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold tracking-widest text-white/60">CALENDAR</div>
          <div className="mt-1 text-lg font-black tracking-tight text-white">
            {monthTitle(focus)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonthFocus((d) => addMonths(d, -1))}
            className="rounded-full border border-[#ff4fd8]/35 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-[#ff4fd8]/20 hover:text-white"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setMonthFocus(new Date(focusDate + "T00:00:00"))}
            className="hidden rounded-full border border-[#ff4fd8]/30 bg-white/10 px-3 py-2 text-xs font-semibold text-white/75 hover:bg-[#ff4fd8]/20 hover:text-white sm:block"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setMonthFocus((d) => addMonths(d, 1))}
            className="rounded-full border border-[#ff4fd8]/35 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-[#ff4fd8]/20 hover:text-white"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-bold tracking-widest text-white/50">
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
                className="h-[92px] rounded-xl border border-white/10 bg-black/15"
              />
            );
          }

          const key = toKey(c.date);
          const dayEvents = byDate.get(key) ?? [];
          const important = dayEvents.some((e) => e.important);

          return (
            <div
              key={key}
              className={
                "relative h-[92px] overflow-hidden rounded-xl border p-2 ring-1 " +
                (important
                  ? "border-fuchsia-400/25 bg-fuchsia-400/10 ring-fuchsia-300/20 shadow-[0_0_0_1px_rgba(255,79,216,0.25),0_0_22px_rgba(255,79,216,0.18)]"
                  : "border-white/10 bg-black/25 ring-white/10")
              }
            >
              <div className="flex items-start justify-between">
                <div className="text-xs font-black text-white">{c.date.getDate()}</div>
                {important ? (
                  <div className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(255,79,216,0.55)]" />
                ) : null}
              </div>

              <div className="mt-2 max-h-[56px] space-y-1 overflow-auto pr-1">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelectedEvent(e)}
                    className={
                      "block w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-semibold ring-1 transition hover:bg-white/10 " +
                      (e.important
                        ? "bg-fuchsia-400/15 text-fuchsia-100 ring-fuchsia-300/25"
                        : "bg-white/10 text-white/85 ring-white/15")
                    }
                    title={`${e.time} — ${e.title}`}
                  >
                    {e.time} {e.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedEvent ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#ff4fd8]/35 bg-[#1b0824]/92 p-5 text-white ring-1 ring-[#ff4fd8]/25">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold tracking-widest text-white/60">EVENT</div>
                <div className="mt-1 text-lg font-black tracking-tight text-white">
                  {selectedEvent.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-full border border-[#ff4fd8]/35 bg-white/10 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-[#ff4fd8]/20 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/75">
              <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                {formatFullDate(selectedEvent.date)}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                {selectedEvent.time}
              </span>
              <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
                {selectedEvent.location}
              </span>
              {selectedEvent.important ? (
                <span className="rounded-full bg-fuchsia-400/15 px-3 py-1 text-sm font-semibold text-fuchsia-200 ring-1 ring-fuchsia-300/30">
                  Important
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-sm leading-6 text-white/70">{selectedEvent.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
