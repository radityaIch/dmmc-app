"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";
import Link from "next/link";
import { useParams } from "next/navigation";

function formatFullDate(d: string) {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function EventDetailPage() {
    const params = useParams();
    const id = params.id as Id<"event">;
    const event = useQuery(api.handlers.event.getById, { id });

    // Loading
    if (event === undefined) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-20">
                <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#ff4fd8]" />
                    <span className="ml-3 text-sm font-semibold text-white/50">
                        Loading event…
                    </span>
                </div>
            </div>
        );
    }

    // Not found
    if (event === null) {
        return (
            <div className="mx-auto w-full max-w-3xl px-4 py-20 text-center">
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-8 ring-1 ring-red-300/20">
                    <h1 className="text-xl font-black text-red-200">
                        Event Not Found
                    </h1>
                    <p className="mt-2 text-sm text-red-200/70">
                        This event may have been removed or doesn&apos;t exist.
                    </p>
                    <Link
                        href="/events"
                        className="mt-4 inline-block rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                    >
                        ← Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    const date = eventDate(event);
    const time = eventTime(event);

    return (
        <div className="mx-auto w-full max-w-3xl px-4 py-10">
            {/* Back link */}
            <Link
                href="/events"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
            >
                ← All Events
            </Link>

            {/* Hero card */}
            <div className="relative overflow-hidden rounded-3xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.95),rgba(14,7,24,0.95))] p-6 ring-1 ring-[#ff4fd8]/20 sm:p-8">
                {/* Glow */}
                <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,79,216,0.25),transparent_60%)]" />

                <div className="relative">
                    {/* Title */}
                    <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {event.name}
                    </h1>

                    {/* Organizer */}
                    {event.organizer && (
                        <div className="mt-3 flex items-center gap-2.5">
                            {event.organizer.image ? (
                                <img
                                    src={event.organizer.image}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover ring-2 ring-[#ff4fd8]/30"
                                />
                            ) : (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4fd8]/20 text-xs font-bold text-pink-200 ring-2 ring-[#ff4fd8]/30">
                                    {event.organizer.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            )}
                            <div>
                                <div className="text-sm font-semibold text-white/80">
                                    {event.organizer.name}
                                </div>
                                <div className="text-[11px] font-medium text-white/40">
                                    Organizer
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Date / Time / Location pills */}
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white/80 ring-1 ring-white/10">
                            <span className="text-white/40">📅</span>{" "}
                            {formatFullDate(date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3.5 py-1.5 text-sm font-semibold text-white/80 ring-1 ring-white/10">
                            <span className="text-white/40">🕐</span> {time}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="mt-6">
                        <div className="text-xs font-bold tracking-widest text-white/50">
                            ABOUT THIS EVENT
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/75">
                            {event.description}
                        </p>
                    </div>

                    {/* Location card */}
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4 ring-1 ring-white/5">
                        <div className="text-xs font-bold tracking-widest text-white/50">
                            LOCATION
                        </div>
                        <div className="mt-2 text-sm font-bold text-white">
                            {event.location.name}
                        </div>
                        {event.location.address && (
                            <div className="mt-1 text-xs text-white/50">
                                📍 {event.location.address}
                            </div>
                        )}
                        {event.location.googleMapURL && (
                            <a
                                href={event.location.googleMapURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#ff4fd8]/30 bg-[#ff4fd8]/10 px-4 py-2 text-xs font-semibold text-pink-100 transition hover:bg-[#ff4fd8]/20 hover:text-white"
                            >
                                Open in Google Maps
                                <span>↗</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
