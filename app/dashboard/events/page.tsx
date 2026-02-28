"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";
import { MAIMAI_LOCATIONS, findLocationById } from "@/app/lib/locations";
import Link from "next/link";
import { PageCard } from "@/app/components/PageCard";
import { PageWrapper } from "@/app/components/PageWrapper";
import { SectionHeader } from "@/app/components/SectionHeader";

type LocationMode = "preset" | "custom";

type Draft = {
    name: string;
    description: string;
    datetime: string;
    locationMode: LocationMode;
    presetLocationId: string;
    customLocationName: string;
    customLocationAddress: string;
    customLocationGoogleMapURL: string;
};

const emptyDraft: Draft = {
    name: "",
    description: "",
    datetime: "",
    locationMode: "preset",
    presetLocationId: MAIMAI_LOCATIONS[0]?.id ?? "",
    customLocationName: "",
    customLocationAddress: "",
    customLocationGoogleMapURL: "",
};

function statusBadge(status: string) {
    switch (status) {
        case "approved":
            return (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-400/30">
                    Approved
                </span>
            );
        case "removed":
            return (
                <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-400/30">
                    Removed
                </span>
            );
        default:
            return (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-400/30">
                    Pending
                </span>
            );
    }
}

export default function DashboardEventsPage() {
    const events = useQuery(api.handlers.event.listMine) ?? [];
    const createEvent = useMutation(api.handlers.event.create);
    const updateEvent = useMutation(api.handlers.event.update);
    const removeEvent = useMutation(api.handlers.event.remove);

    const [draft, setDraft] = useState<Draft>(emptyDraft);
    const [editingId, setEditingId] = useState<Id<"event"> | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    function resolveLocation() {
        if (draft.locationMode === "preset") {
            const loc = findLocationById(draft.presetLocationId);
            if (!loc) throw new Error("Invalid preset location");
            return {
                name: loc.name,
                address: loc.address,
                googleMapURL: loc.googleMapURL,
            };
        }
        return {
            name: draft.customLocationName,
            address: draft.customLocationAddress,
            googleMapURL: draft.customLocationGoogleMapURL,
        };
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const location = resolveLocation();
            const payload = {
                name: draft.name,
                description: draft.description,
                datetime: draft.datetime,
                location,
            };

            if (editingId) {
                await updateEvent({ id: editingId, ...payload });
            } else {
                await createEvent(payload);
            }
            setDraft(emptyDraft);
            setEditingId(null);
        } finally {
            setSaving(false);
        }
    }

    function startEdit(event: (typeof events)[number]) {
        const preset = MAIMAI_LOCATIONS.find(
            (l) => l.name === event.location.name,
        );

        setEditingId(event._id);
        setDraft({
            name: event.name,
            description: event.description,
            datetime: event.datetime,
            locationMode: preset ? "preset" : "custom",
            presetLocationId: preset?.id ?? MAIMAI_LOCATIONS[0]?.id ?? "",
            customLocationName: preset ? "" : event.location.name,
            customLocationAddress: preset ? "" : event.location.address,
            customLocationGoogleMapURL: preset
                ? ""
                : event.location.googleMapURL,
        });
    }

    async function handleDelete(id: Id<"event">) {
        setDeleting(id);
        try {
            await removeEvent({ id });
        } finally {
            setDeleting(null);
        }
    }

    const isCustom = draft.locationMode === "custom";

    return (
        <PageWrapper>
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
            >
                ← Back to Dashboard
            </Link>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
                {/* ─── Create / Edit Form ─── */}
                <PageCard color="pink">
                    <SectionHeader color="pink">
                        {editingId ? "Edit Event" : "Create Event"}
                    </SectionHeader>

                    <form className="space-y-3" onSubmit={handleSubmit}>
                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                                EVENT NAME
                            </span>
                            <input
                                value={draft.name}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, name: e.target.value }))
                                }
                                className="mt-2 w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-[#ff4fd8]/30"
                                required
                                placeholder="e.g. Weekend Grind & Chill"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                                DATE & TIME
                            </span>
                            <input
                                type="datetime-local"
                                value={draft.datetime}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, datetime: e.target.value }))
                                }
                                className="mt-2 w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
                                required
                            />
                        </label>

                        {/* ─── Location Picker ─── */}
                        <div>
                            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                                LOCATION
                            </span>
                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraft((d) => ({ ...d, locationMode: "preset" }))
                                    }
                                    className={
                                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                                        (!isCustom
                                            ? "bg-[#ff4fd8]/20 text-[#2f2461] ring-[#ff4fd8]/40"
                                            : "bg-[#2f2461]/5 text-[#2f2461]/60 ring-[#2f2461]/15 hover:bg-[#ff4fd8]/10 hover:text-[#2f2461]")
                                    }
                                >
                                    maimai Arcade
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraft((d) => ({ ...d, locationMode: "custom" }))
                                    }
                                    className={
                                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                                        (isCustom
                                            ? "bg-[#ff4fd8]/20 text-[#2f2461] ring-[#ff4fd8]/40"
                                            : "bg-[#2f2461]/5 text-[#2f2461]/60 ring-[#2f2461]/15 hover:bg-[#ff4fd8]/10 hover:text-[#2f2461]")
                                    }
                                >
                                    Custom Location
                                </button>
                            </div>

                            {!isCustom ? (
                                <div className="mt-3 space-y-2">
                                    {MAIMAI_LOCATIONS.map((loc) => {
                                        const selected = draft.presetLocationId === loc.id;
                                        return (
                                            <button
                                                key={loc.id}
                                                type="button"
                                                onClick={() =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        presetLocationId: loc.id,
                                                    }))
                                                }
                                                className={
                                                    "w-full rounded-xl border px-4 py-3 text-left transition ring-1 " +
                                                    (selected
                                                        ? "border-[#ff4fd8]/35 bg-[#ff4fd8]/10 ring-[#ff4fd8]/20 text-[#2f2461]"
                                                        : "border-[#2f2461]/10 bg-white/60 ring-[#2f2461]/5 text-[#2f2461]/70 hover:bg-white/80 hover:text-[#2f2461]")
                                                }
                                            >
                                                <div className="text-sm font-bold">
                                                    {loc.name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-[#2f2461]/45">
                                                    {loc.address}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <input
                                        value={draft.customLocationName}
                                        onChange={(e) =>
                                            setDraft((d) => ({ ...d, customLocationName: e.target.value }))
                                        }
                                        className="w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                                        required={isCustom}
                                        placeholder="Location name"
                                    />
                                    <input
                                        value={draft.customLocationAddress}
                                        onChange={(e) =>
                                            setDraft((d) => ({ ...d, customLocationAddress: e.target.value }))
                                        }
                                        className="w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                                        required={isCustom}
                                        placeholder="Address"
                                    />
                                    <input
                                        type="url"
                                        value={draft.customLocationGoogleMapURL}
                                        onChange={(e) =>
                                            setDraft((d) => ({ ...d, customLocationGoogleMapURL: e.target.value }))
                                        }
                                        className="w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                                        required={isCustom}
                                        placeholder="Google Maps URL"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">
                                DESCRIPTION
                            </span>
                            <textarea
                                value={draft.description}
                                onChange={(e) =>
                                    setDraft((d) => ({ ...d, description: e.target.value }))
                                }
                                rows={4}
                                className="mt-2 w-full resize-none rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                                required
                                placeholder="Tell the community what to expect..."
                            />
                        </label>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 rounded-full bg-[linear-gradient(180deg,#ff4fd8,#c026d3)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(255,79,216,0.55),0_0_24px_rgba(255,79,216,0.25)] hover:shadow-[0_0_0_1px_rgba(255,79,216,0.75),0_0_34px_rgba(255,79,216,0.45)] disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Event"
                                        : "Submit Event"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingId(null);
                                        setDraft(emptyDraft);
                                    }}
                                    className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-4 py-3 text-sm font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </PageCard>

                {/* ─── My Events List ─── */}
                <PageCard color="yellow" className="mb-12">
                    <SectionHeader color="yellow">My Events ({events.length})</SectionHeader>

                    {events.length === 0 ? (
                        <div className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-8 text-center">
                            <p className="text-sm text-[#2f2461]/50">
                                You haven&#39;t created any events yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {events.map((e) => (
                                <div
                                    key={e._id}
                                    className="rounded-2xl border border-[#2f2461]/10 bg-white/60 p-4 ring-1 ring-[#2f2461]/5"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-[#2f2461]">
                                                    {e.name}
                                                </span>
                                                {statusBadge(e.status)}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-[#2f2461]/45">
                                                {eventDate(e)} • {eventTime(e)} • {e.location.name}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(e)}
                                                className="rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-3 py-1 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deleting === e._id}
                                                onClick={() => handleDelete(e._id)}
                                                className="rounded-full border border-red-400/30 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                                            >
                                                {deleting === e._id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-[#2f2461]/60">
                                        {e.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </PageCard>
            </div>
        </PageWrapper>
    );
}
