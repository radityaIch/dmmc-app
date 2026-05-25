"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageCard } from "@/app/components/PageCard";
import { PageWrapper } from "@/app/components/PageWrapper";
import { SectionHeader } from "@/app/components/SectionHeader";

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

    if (event === undefined) {
        return (
            <PageWrapper>
                <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-pink-300/40 border-t-[#f472b6]" />
                    <span className="ml-3 text-sm font-semibold text-white/50">
                        Loading event…
                    </span>
                </div>
            </PageWrapper>
        );
    }

    if (event === null) {
        return (
            <PageWrapper>
                <PageCard color="pink" className="text-center mb-12">
                    <h1 className="text-xl font-black text-red-500">Event Not Found</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        This event may have been removed or doesn&apos;t exist.
                    </p>
                    <Link
                        href="/events"
                        className="mt-4 inline-block rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-200/50"
                    >
                        ← Back to Events
                    </Link>
                </PageCard>
            </PageWrapper>
        );
    }

    const date = eventDate(event);
    const time = eventTime(event);

    return (
        <PageWrapper className="max-w-3xl">
            <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
            >
                ← All Events
            </Link>

            <PageCard color="pink" className="mb-12">
                <SectionHeader color="pink">{event.name}</SectionHeader>

                {event.organizer && (
                    <div className="flex items-center justify-center gap-2.5 mb-6">
                        {event.organizer.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={event.organizer.image}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover ring-2 ring-[#f472b6]/30"
                            />
                        ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-xs font-bold text-[#e11d79] ring-2 ring-[#f472b6]/30">
                                {event.organizer.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="text-center">
                            <div className="text-sm font-semibold text-slate-700">
                                {event.organizer.name}
                            </div>
                            <div className="text-[11px] font-medium text-slate-700/45">
                                Organizer
                            </div>
                        </div>
                    </div>
                )}

                {/* Date / Time pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-500 ring-1 ring-[#334155]/10">
                        <span className="text-slate-300">📅</span>{" "}
                        {formatFullDate(date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-semibold text-slate-500 ring-1 ring-[#334155]/10">
                        <span className="text-slate-300">🕐</span> {time}
                    </span>
                </div>

                {/* Description */}
                <div className="mb-6 border-t border-pink-200/30 pt-6">
                    <div className="text-xs font-bold tracking-widest text-slate-700/45 text-center mb-3">
                        ABOUT THIS EVENT
                    </div>
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-500 text-center max-w-2xl mx-auto">
                        {event.description}
                    </p>
                </div>

                {/* Location card */}
                <div className="rounded-2xl border border-slate-100 bg-white/60 p-4">
                    <div className="text-xs font-bold tracking-widest text-slate-700/45 text-center mb-2">
                        LOCATION
                    </div>
                    <div className="text-sm font-bold text-slate-700 text-center">
                        {event.location.name}
                    </div>
                    {event.location.address && (
                        <div className="mt-1 text-xs text-slate-400 text-center">
                            📍 {event.location.address}
                        </div>
                    )}
                    {event.location.googleMapURL && (
                        <div className="mt-3 flex justify-center">
                            <a
                                href={event.location.googleMapURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-pink-300/40 bg-pink-50 px-4 py-2 text-xs font-semibold text-[#e11d79] transition hover:bg-[#f472b6]/20 hover:text-slate-700"
                            >
                                Open in Google Maps
                                <span>↗</span>
                            </a>
                        </div>
                    )}
                </div>
            </PageCard>
        </PageWrapper>
    );
}
