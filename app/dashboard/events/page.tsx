"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";
import { MAIMAI_LOCATIONS, findLocationById } from "@/app/lib/locations";
import Link from "next/link";

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
                <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-300/30">
                    Approved
                </span>
            );
        case "removed":
            return (
                <span className="rounded-full bg-red-400/15 px-2.5 py-1 text-xs font-semibold text-red-200 ring-1 ring-red-300/30">
                    Removed
                </span>
            );
        default:
            return (
                <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-200 ring-1 ring-amber-300/30">
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
        // Detect if the event location matches a preset
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
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
            {/* Back link */}
            <Link
                href="/dashboard"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"
            >
                ← Back to Dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-2xl font-black tracking-tight text-white">
                    My Events
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/60">
                    Create and manage your community events. New events will be
                    reviewed by an admin before appearing publicly.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
                {/* ─── Create / Edit Form ─── */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10">
                    <div className="text-xs font-bold tracking-widest text-white/60">
                        {editingId ? "EDIT EVENT" : "CREATE EVENT"}
                    </div>

                    <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-white/70">
                                EVENT NAME
                            </span>
                            <input
                                value={draft.name}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        name: e.target.value,
                                    }))
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-[#ff4fd8]/40"
                                required
                                placeholder="e.g. Weekend Grind & Chill"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-white/70">
                                DATE & TIME
                            </span>
                            <input
                                type="datetime-local"
                                value={draft.datetime}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        datetime: e.target.value,
                                    }))
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
                                required
                            />
                        </label>

                        {/* ─── Location Picker ─── */}
                        <div>
                            <span className="text-xs font-bold tracking-widest text-white/70">
                                LOCATION
                            </span>
                            <div className="mt-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraft((d) => ({
                                            ...d,
                                            locationMode: "preset",
                                        }))
                                    }
                                    className={
                                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                                        (!isCustom
                                            ? "bg-[#ff4fd8]/20 text-pink-100 ring-[#ff4fd8]/40"
                                            : "bg-white/5 text-white/60 ring-white/15 hover:bg-white/10 hover:text-white")
                                    }
                                >
                                    maimai Arcade
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDraft((d) => ({
                                            ...d,
                                            locationMode: "custom",
                                        }))
                                    }
                                    className={
                                        "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                                        (isCustom
                                            ? "bg-[#ff4fd8]/20 text-pink-100 ring-[#ff4fd8]/40"
                                            : "bg-white/5 text-white/60 ring-white/15 hover:bg-white/10 hover:text-white")
                                    }
                                >
                                    Custom Location
                                </button>
                            </div>

                            {!isCustom ? (
                                <div className="mt-3 space-y-2">
                                    {MAIMAI_LOCATIONS.map((loc) => {
                                        const selected =
                                            draft.presetLocationId === loc.id;
                                        return (
                                            <button
                                                key={loc.id}
                                                type="button"
                                                onClick={() =>
                                                    setDraft((d) => ({
                                                        ...d,
                                                        presetLocationId:
                                                            loc.id,
                                                    }))
                                                }
                                                className={
                                                    "w-full rounded-xl border px-4 py-3 text-left transition ring-1 " +
                                                    (selected
                                                        ? "border-[#ff4fd8]/40 bg-[#ff4fd8]/15 ring-[#ff4fd8]/30 text-white"
                                                        : "border-white/10 bg-black/20 ring-white/5 text-white/70 hover:bg-black/30 hover:text-white")
                                                }
                                            >
                                                <div className="text-sm font-bold">
                                                    {loc.name}
                                                </div>
                                                <div className="mt-0.5 text-xs text-white/40">
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
                                            setDraft((d) => ({
                                                ...d,
                                                customLocationName:
                                                    e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                                        required={isCustom}
                                        placeholder="Location name"
                                    />
                                    <input
                                        value={draft.customLocationAddress}
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                customLocationAddress:
                                                    e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                                        required={isCustom}
                                        placeholder="Address"
                                    />
                                    <input
                                        type="url"
                                        value={
                                            draft.customLocationGoogleMapURL
                                        }
                                        onChange={(e) =>
                                            setDraft((d) => ({
                                                ...d,
                                                customLocationGoogleMapURL:
                                                    e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                                        required={isCustom}
                                        placeholder="Google Maps URL"
                                    />
                                </div>
                            )}
                        </div>

                        <label className="block">
                            <span className="text-xs font-bold tracking-widest text-white/70">
                                DESCRIPTION
                            </span>
                            <textarea
                                value={draft.description}
                                onChange={(e) =>
                                    setDraft((d) => ({
                                        ...d,
                                        description: e.target.value,
                                    }))
                                }
                                rows={4}
                                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-sky-400/40"
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
                                    className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* ─── My Events List ─── */}
                <div>
                    <div className="text-xs font-bold tracking-widest text-white/60">
                        MY EVENTS ({events.length})
                    </div>

                    {events.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center ring-1 ring-white/5">
                            <p className="text-sm text-white/50">
                                You haven&#39;t created any events yet.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {events.map((e) => (
                                <div
                                    key={e._id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/10"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-white">
                                                    {e.name}
                                                </span>
                                                {statusBadge(e.status)}
                                            </div>
                                            <div className="mt-1 text-xs font-semibold text-white/50">
                                                {eventDate(e)} •{" "}
                                                {eventTime(e)} •{" "}
                                                {e.location.name}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(e)}
                                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                disabled={deleting === e._id}
                                                onClick={() =>
                                                    handleDelete(e._id)
                                                }
                                                className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-400/20 hover:text-red-100 disabled:opacity-50"
                                            >
                                                {deleting === e._id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-3 text-sm leading-6 text-white/60">
                                        {e.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
