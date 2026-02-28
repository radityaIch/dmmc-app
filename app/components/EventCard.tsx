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
      className="group relative block overflow-hidden rounded-2xl border border-[#ff4fd8]/20 bg-white/90 backdrop-blur-sm p-5 shadow-[0_2px_12px_rgba(255,79,216,0.08)] transition-all hover:-translate-y-0.5 hover:border-[#ff4fd8]/35 hover:shadow-[0_6px_24px_rgba(255,79,216,0.15)]"
    >
      <div className="pointer-events-none absolute -top-16 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,79,216,0.08),transparent_60%)]" />

      <div className="relative flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold tracking-tight text-[#2f2461] transition group-hover:text-[#d63fb5]">
            {event.name}
          </h3>
          <span className="shrink-0 text-[#2f2461]/25 transition group-hover:text-[#ff4fd8]/50">↗</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-[#2f2461]/65">
          <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
            {formatDate(date)}
          </span>
          <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
            {time}
          </span>
          <span className="rounded-full bg-[#2f2461]/5 px-3 py-1 ring-1 ring-[#2f2461]/10">
            {event.location.name}
          </span>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-[#2f2461]/65">{event.description}</p>

        {event.organizer && (
          <div className="flex items-center gap-2 border-t border-[#2f2461]/10 pt-1">
            {event.organizer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.organizer.image}
                alt=""
                className="h-5 w-5 rounded-full object-cover ring-1 ring-[#ff4fd8]/20"
              />
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4fd8]/10 text-[9px] font-bold text-[#d63fb5] ring-1 ring-[#ff4fd8]/20">
                {event.organizer.name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-xs font-semibold text-[#2f2461]/50">
              {event.organizer.name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
