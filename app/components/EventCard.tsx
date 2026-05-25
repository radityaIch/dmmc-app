import Link from "next/link";
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
    <Link
      href={`/events/${event._id}`}
      className="group relative block overflow-hidden rounded-2xl border border-pink-300/30 bg-white/90 backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(244,114,182,0.08)] transition-all hover:-translate-y-0.5 hover:border-pink-300/40 hover:shadow-[0_6px_24px_rgba(244,114,182,0.15)]"
    >
      <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.08),transparent_60%)]" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-slate-700 transition group-hover:text-[#e11d79]">
            {event.name}
          </h3>
          <span className="shrink-0 text-slate-700/25 transition group-hover:text-[#f472b6]/50">↗</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-[#334155]/10">
            {formatDate(date)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-[#334155]/10">
            {time}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-[#334155]/10">
            {event.location.name}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{event.description}</p>

        {event.organizer && (
          <div className="flex items-center gap-2 border-t border-slate-100 pt-1">
            {event.organizer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.organizer.image}
                alt=""
                className="h-5 w-5 rounded-full object-cover ring-1 ring-[#f472b6]/20"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-50 text-[9px] font-bold text-[#e11d79] ring-1 ring-[#f472b6]/20">
                {event.organizer.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-400">
              {event.organizer.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
