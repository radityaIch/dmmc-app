"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { eventDate, eventTime } from "@/app/lib/events";
import { PageCard } from "@/app/components/PageCard";
import { PageWrapper } from "@/app/components/PageWrapper";
import { SectionHeader } from "@/app/components/SectionHeader";

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

type FilterStatus = "all" | "pending" | "approved" | "removed";

export default function AdminDashboardPage() {
  const [active, setActive] = useState<"overview" | "events">("overview");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const rawEvents = useQuery(api.handlers.event.listAll);
  const allEvents = useMemo(() => rawEvents ?? [], [rawEvents]);
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
    <PageWrapper className="max-w-6xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <PageCard color="yellow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-700/45">ADMIN</div>
              <div className="text-base font-black tracking-tight text-slate-700">
                Dashboard
              </div>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
            >
              Site
            </Link>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActive("overview")}
              className={
                "w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition " +
                (active === "overview"
                  ? "bg-pink-100 text-slate-700 ring-1 ring-[#f472b6]/25"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700")
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
                  ? "bg-pink-100 text-slate-700 ring-1 ring-[#f472b6]/25"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200/50 hover:text-slate-700")
              }
            >
              Manage Events
              {stats.pending > 0 && (
                <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                  {stats.pending}
                </span>
              )}
            </button>

            <Link
              href="/dashboard"
              className="block w-full rounded-xl bg-slate-100 px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-700"
            >
              ← User Dashboard
            </Link>
          </div>
        </PageCard>

        {/* Main content */}
        <PageCard color="blue" className="mb-12">
          {active === "overview" ? (
            <div>
              <SectionHeader color="blue">Overview</SectionHeader>
              <p className="mb-6 text-center text-sm font-medium leading-6 text-slate-500">
                Admin panel connected to Convex. All data is live and reactive.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-white/60 p-4 text-center">
                  <div className="text-xs font-bold tracking-widest text-slate-700/45">TOTAL</div>
                  <div className="mt-1 text-2xl font-black text-slate-700">
                    {stats.total}
                  </div>
                </div>
                <div className="rounded-2xl border border-amber-400/25 bg-amber-50 p-4 text-center">
                  <div className="text-xs font-bold tracking-widest text-amber-600/70">PENDING</div>
                  <div className="mt-1 text-2xl font-black text-amber-700">
                    {stats.pending}
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/25 bg-emerald-50 p-4 text-center">
                  <div className="text-xs font-bold tracking-widest text-emerald-600/70">APPROVED</div>
                  <div className="mt-1 text-2xl font-black text-emerald-700">
                    {stats.approved}
                  </div>
                </div>
                <div className="rounded-2xl border border-red-400/25 bg-red-50 p-4 text-center">
                  <div className="text-xs font-bold tracking-widest text-red-600/70">REMOVED</div>
                  <div className="mt-1 text-2xl font-black text-red-600">
                    {stats.removed}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
                <SectionHeader color="blue" className="mb-0">Manage Events</SectionHeader>

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
                            ? "bg-pink-100 text-slate-700 ring-[#f472b6]/25"
                            : "bg-slate-100 text-slate-400 ring-[#334155]/10 hover:bg-slate-200/50 hover:text-slate-700")
                        }
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        {f === "pending" && stats.pending > 0 && (
                          <span className="ml-1 text-amber-600">
                            ({stats.pending})
                          </span>
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-white/60 p-8 text-center">
                  <p className="text-sm text-slate-400">
                    No events match this filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((e) => (
                    <div
                      key={e._id}
                      className={
                        "rounded-2xl border p-4 ring-1 " +
                        (e.status === "pending"
                          ? "border-amber-400/25 bg-amber-50 ring-amber-300/15"
                          : e.status === "approved"
                            ? "border-emerald-400/20 bg-emerald-50 ring-emerald-300/10"
                            : "border-red-400/20 bg-red-50 ring-red-300/10")
                      }
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700">
                              {e.name}
                            </span>
                            {statusBadge(e.status)}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-700/45">
                            {eventDate(e)} • {eventTime(e)} •{" "}
                            {e.location.name}
                          </div>
                          <div className="mt-1 text-xs text-slate-300 flex items-center gap-1.5">
                            {e.organizer?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={e.organizer.image}
                                alt=""
                                className="h-4 w-4 rounded-full object-cover ring-1 ring-[#334155]/15"
                              />
                            ) : (
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200/50 text-[8px] font-bold text-slate-400 ring-1 ring-[#334155]/15">
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
                              className="rounded-full border border-emerald-400/30 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 disabled:opacity-50"
                            >
                              {actionLoading === e._id ? "..." : "Approve"}
                            </button>
                          )}
                          {e.status !== "removed" && (
                            <button
                              type="button"
                              disabled={actionLoading === e._id}
                              onClick={() => handleRemove(e._id)}
                              className="rounded-full border border-red-400/30 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                            >
                              {actionLoading === e._id ? "..." : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {e.description}
                      </p>

                      {e.location.address && (
                        <div className="mt-1 text-xs text-slate-300">
                          📍 {e.location.address}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </PageCard>
      </div>
    </PageWrapper>
  );
}
