"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";

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

type FilterStatus = "all" | "pending" | "approved" | "removed";

export default function AdminDashboardPage() {
  const [active, setActive] = useState<"overview" | "events">("overview");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const allEvents = useQuery(api.handlers.event.listAll) ?? [];
  const approveEvent = useMutation(api.handlers.event.approve);
  const adminRemoveEvent = useMutation(api.handlers.event.adminRemove);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return allEvents;
    return allEvents.filter((e) => e.status === filter);
  }, [allEvents, filter]);

  const stats = useMemo(() => {
    const pending = allEvents.filter((e) => e.status === "pending").length;
    const approved = allEvents.filter((e) => e.status === "approved").length;
    const removed = allEvents.filter((e) => e.status === "removed").length;
    return { total: allEvents.length, pending, approved, removed };
  }, [allEvents]);

  async function handleApprove(id: Id<"event">) {
    setActionLoading(id);
    try {
      await approveEvent({ id });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemove(id: Id<"event">) {
    setActionLoading(id);
    try {
      await adminRemoveEvent({ id });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 ring-1 ring-white/10">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest text-white/60">ADMIN</div>
              <div className="text-base font-black tracking-tight text-white">
                Dashboard
              </div>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75 hover:bg-black/40 hover:text-white"
            >
              Site
            </Link>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setActive("overview")}
              className={
                "w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition " +
                (active === "overview"
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "bg-black/20 text-white/75 hover:bg-black/30 hover:text-white")
              }
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActive("events")}
              className={
                "w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition " +
                (active === "events"
                  ? "bg-white/10 text-white ring-1 ring-white/20"
                  : "bg-black/20 text-white/75 hover:bg-black/30 hover:text-white")
              }
            >
              Manage Events
              {stats.pending > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-[10px] font-bold text-amber-200">
                  {stats.pending}
                </span>
              )}
            </button>

            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-black/20 px-4 py-3 text-left text-sm font-semibold text-white/75 hover:bg-black/30 hover:text-white"
            >
              ← User Dashboard
            </Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
          {active === "overview" ? (
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Overview</h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Admin panel connected to Convex. All data is live and reactive.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold tracking-widest text-white/60">TOTAL</div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {stats.total}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
                  <div className="text-xs font-bold tracking-widest text-amber-200/60">PENDING</div>
                  <div className="mt-1 text-2xl font-black text-amber-200">
                    {stats.pending}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="text-xs font-bold tracking-widest text-emerald-200/60">APPROVED</div>
                  <div className="mt-1 text-2xl font-black text-emerald-200">
                    {stats.approved}
                  </div>
                </div>
                <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
                  <div className="text-xs font-bold tracking-widest text-red-200/60">REMOVED</div>
                  <div className="mt-1 text-2xl font-black text-red-200">
                    {stats.removed}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">
                    Manage Events
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Approve or remove events submitted by community members.
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-2">
                  {(["all", "pending", "approved", "removed"] as const).map(
                    (f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFilter(f)}
                        className={
                          "rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition " +
                          (filter === f
                            ? "bg-white/10 text-white ring-white/30"
                            : "bg-black/20 text-white/60 ring-white/10 hover:bg-black/30 hover:text-white/80")
                        }
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === "pending" && stats.pending > 0 && (
                          <span className="ml-1 text-amber-200">
                            ({stats.pending})
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-8 text-center">
                  <p className="text-sm text-white/50">
                    No events match this filter.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {filtered.map((e) => (
                    <div
                      key={e._id}
                      className={
                        "rounded-2xl border p-4 ring-1 " +
                        (e.status === "pending"
                          ? "border-amber-400/20 bg-amber-400/5 ring-amber-300/15"
                          : e.status === "approved"
                            ? "border-emerald-400/15 bg-emerald-400/5 ring-emerald-300/10"
                            : "border-red-400/15 bg-red-400/5 ring-red-300/10")
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">
                              {e.name}
                            </span>
                            {statusBadge(e.status)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-white/50">
                            {eventDate(e)} • {eventTime(e)} •{" "}
                            {e.location.name}
                          </div>
                          <div className="mt-1 text-xs text-white/40 flex items-center gap-1.5">
                            {e.organizer?.image ? (
                              <img
                                src={e.organizer.image}
                                alt=""
                                className="h-4 w-4 rounded-full object-cover ring-1 ring-white/15"
                              />
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[8px] font-bold text-white/50 ring-1 ring-white/15">
                                ?
                              </span>
                            )}
                            {e.organizer?.name ?? "Unknown"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {e.status !== "approved" && (
                            <button
                              type="button"
                              disabled={actionLoading === e._id}
                              onClick={() => handleApprove(e._id)}
                              className="rounded-full border border-emerald-400/25 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/25 hover:text-emerald-100 disabled:opacity-50"
                            >
                              {actionLoading === e._id
                                ? "..."
                                : "Approve"}
                            </button>
                          )}
                          {e.status !== "removed" && (
                            <button
                              type="button"
                              disabled={actionLoading === e._id}
                              onClick={() => handleRemove(e._id)}
                              className="rounded-full border border-red-400/25 bg-red-400/15 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-400/25 hover:text-red-100 disabled:opacity-50"
                            >
                              {actionLoading === e._id
                                ? "..."
                                : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-white/60">
                        {e.description}
                      </p>

                      {e.location.address && (
                        <div className="mt-1 text-xs text-white/40">
                          📍 {e.location.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
