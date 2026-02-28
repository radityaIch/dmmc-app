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
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#ff4fd8]/30 border-t-[#ff4fd8]" />
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
                    <p className="mt-2 text-sm text-[#2f2461]/60">
                        This event may have been removed or doesn&apos;t exist.
                    </p>
                    <Link
                        href="/events"
                        className="mt-4 inline-block rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-4 py-2 text-sm font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10"
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
                                className="h-7 w-7 rounded-full object-cover ring-2 ring-[#ff4fd8]/30"
                            />
                        ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4fd8]/10 text-xs font-bold text-[#d63fb5] ring-2 ring-[#ff4fd8]/30">
                                {event.organizer.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className="text-center">
                            <div className="text-sm font-semibold text-[#2f2461]">
                                {event.organizer.name}
                            </div>
                            <div className="text-[11px] font-medium text-[#2f2461]/45">
                                Organizer
                            </div>
                        </div>
                    </div>
                )}

                {/* Date / Time pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2f2461]/5 px-3.5 py-1.5 text-sm font-semibold text-[#2f2461]/75 ring-1 ring-[#2f2461]/10">
                        <span className="text-[#2f2461]/40">📅</span>{" "}
                        {formatFullDate(date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2f2461]/5 px-3.5 py-1.5 text-sm font-semibold text-[#2f2461]/75 ring-1 ring-[#2f2461]/10">
                        <span className="text-[#2f2461]/40">🕐</span> {time}
                    </span>
                </div>

                {/* Description */}
                <div className="mb-6 border-t border-[#ff4fd8]/15 pt-6">
                    <div className="text-xs font-bold tracking-widest text-[#2f2461]/45 text-center mb-3">
                        ABOUT THIS EVENT
                    </div>
                    <p className="whitespace-pre-line text-sm leading-7 text-[#2f2461]/70 text-center max-w-2xl mx-auto">
                        {event.description}
                    </p>
                </div>

                {/* Location card */}
                <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4">
                    <div className="text-xs font-bold tracking-widest text-[#2f2461]/45 text-center mb-2">
                        LOCATION
                    </div>
                    <div className="text-sm font-bold text-[#2f2461] text-center">
                        {event.location.name}
                    </div>
                    {event.location.address && (
                        <div className="mt-1 text-xs text-[#2f2461]/50 text-center">
                            📍 {event.location.address}
                        </div>
                    )}
                    {event.location.googleMapURL && (
                        <div className="mt-3 flex justify-center">
                            <a
                                href={event.location.googleMapURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#ff4fd8]/30 bg-[#ff4fd8]/10 px-4 py-2 text-xs font-semibold text-[#d63fb5] transition hover:bg-[#ff4fd8]/20 hover:text-[#2f2461]"
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
