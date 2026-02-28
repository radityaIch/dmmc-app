import type { DmmcEvent } from "../lib/events";
import { eventDate, eventTime } from "../lib/events";

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type EventWithOrganizer = DmmcEvent & {
  organizer?: { name: string; image: string | null };
};

export function EventCard({ event }: { event: EventWithOrganizer }) {
  const date = eventDate(event);
  const time = eventTime(event);

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl border bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-5 shadow-sm ring-1 transition " +
        "border-[#ff4fd8]/25 ring-[#ff4fd8]/15 hover:border-[#ff4fd8]/40"
      }
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,79,216,0.30),transparent_60%)]" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-white">
            {event.name}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {formatDate(date)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {time}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            {event.location.name}
          </span>
        </div>

        <p className="text-sm leading-6 text-white/70">{event.description}</p>

        {event.organizer && (
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            {event.organizer.image ? (
              <img
                src={event.organizer.image}
                alt=""
                className="h-5 w-5 rounded-full object-cover ring-1 ring-white/20"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4fd8]/20 text-[9px] font-bold text-pink-200 ring-1 ring-[#ff4fd8]/30">
                {event.organizer.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-semibold text-white/50">
              {event.organizer.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
