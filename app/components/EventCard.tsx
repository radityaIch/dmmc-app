import type { DmmcEvent } from "../lib/events";

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function EventCard({ event }: { event: DmmcEvent }) {
  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 shadow-sm ring-1 transition " +
        (event.important
          ? "border-fuchsia-400/35 ring-fuchsia-300/35 shadow-[0_0_0_1px_rgba(255,79,216,0.35),0_0_28px_rgba(255,79,216,0.24)]"
          : "border-[#ff4fd8]/25 ring-[#ff4fd8]/15 hover:border-[#ff4fd8]/40")
      }
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,79,216,0.30),transparent_60%)]" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-white">
            {event.title}
          </h3>
          {event.important ? (
            <span className="shrink-0 rounded-full bg-fuchsia-400/15 px-2 py-1 text-xs font-semibold text-fuchsia-200 ring-1 ring-fuchsia-300/30">
              Important
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {formatDate(event.date)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {event.time}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {event.location}
          </span>
        </div>

        <p className="text-sm leading-6 text-white/70">{event.description}</p>
      </div>
    </div>
  );
}
