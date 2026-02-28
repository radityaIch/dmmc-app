"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EventCard } from "./EventCard";

/**
 * Displays the first 4 approved events on the home page.
 * Client component because it uses the Convex reactive query.
 */
export function HomeEventsPreview() {
    const events = useQuery(api.handlers.event.listApproved) ?? [];
    const preview = events.slice(0, 4);

    if (preview.length === 0) {
        return (
            <div className="rounded-2xl border border-[#2f2461]/10 bg-[#2f2461]/5 p-8 text-center ring-1 ring-[#2f2461]/5">
                <p className="text-sm text-[#2f2461]/50">No upcoming events yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {preview.map((e) => (
                <EventCard key={e._id} event={e} />
            ))}
        </div>
    );
}
