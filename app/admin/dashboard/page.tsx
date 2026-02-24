"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { DmmcEvent } from "../../lib/events";
import { mockEvents } from "../../lib/events";

type Draft = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  important: boolean;
};

function newId() {
  return "evt_" + Math.random().toString(16).slice(2);
}

export default function AdminDashboardPage() {
  const [active, setActive] = useState<"overview" | "events">("overview");
  const [events, setEvents] = useState<DmmcEvent[]>(mockEvents);
  const [draft, setDraft] = useState<Draft>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    important: false,
  });

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => {
      const ad = a.date + "T" + a.time;
      const bd = b.date + "T" + b.time;
      return ad.localeCompare(bd);
    });
  }, [events]);

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
            </button>

            <Link
              href="/login"
              className="block w-full rounded-xl bg-black/20 px-4 py-3 text-left text-sm font-semibold text-white/75 hover:bg-black/30 hover:text-white"
            >
              Logout
            </Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
          {active === "overview" ? (
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Overview</h1>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Quick admin panel scaffold. Next step is wiring real auth + database.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold tracking-widest text-white/60">EVENTS</div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {events.length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold tracking-widest text-white/60">
                    IMPORTANT
                  </div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {events.filter((e) => e.important).length}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-xs font-bold tracking-widest text-white/60">STATUS</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-200">
                    UI Ready
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-xl font-black tracking-tight text-white">
                    Manage Events
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    CRUD is client-side state for now (mock). Fields match the spec.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                  <div className="text-xs font-bold tracking-widest text-white/60">
                    ADD EVENT
                  </div>

                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const evt: DmmcEvent = {
                        id: newId(),
                        title: draft.title,
                        date: draft.date,
                        time: draft.time,
                        location: draft.location,
                        description: draft.description,
                        important: draft.important,
                      };
                      setEvents((prev) => [evt, ...prev]);
                      setDraft({
                        title: "",
                        date: "",
                        time: "",
                        location: "",
                        description: "",
                        important: false,
                      });
                    }}
                  >
                    <label className="block">
                      <span className="text-xs font-bold tracking-widest text-white/70">
                        EVENT TITLE
                      </span>
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, title: e.target.value }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                        required
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-bold tracking-widest text-white/70">
                          DATE
                        </span>
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, date: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-emerald-400/40"
                          required
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-bold tracking-widest text-white/70">
                          TIME
                        </span>
                        <input
                          type="time"
                          value={draft.time}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, time: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-fuchsia-400/40"
                          required
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-xs font-bold tracking-widest text-white/70">
                        LOCATION
                      </span>
                      <input
                        value={draft.location}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, location: e.target.value }))
                        }
                        className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-yellow-300/40"
                        required
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-bold tracking-widest text-white/70">
                        DESCRIPTION
                      </span>
                      <textarea
                        value={draft.description}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, description: e.target.value }))
                        }
                        rows={4}
                        className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent focus:ring-sky-400/40"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/85">
                      <input
                        type="checkbox"
                        checked={draft.important}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, important: e.target.checked }))
                        }
                      />
                      <span className="font-semibold">
                        Important Announcement (glows on front-end)
                      </span>
                    </label>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[linear-gradient(180deg,#39b7ff,#168bff)] px-6 py-3 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(57,183,255,0.55),0_0_24px_rgba(57,183,255,0.25)] hover:shadow-[0_0_0_1px_rgba(57,183,255,0.75),0_0_34px_rgba(57,183,255,0.45)]"
                    >
                      Add Event
                    </button>
                  </form>
                </div>

                <div>
                  <div className="text-xs font-bold tracking-widest text-white/60">
                    CURRENT EVENTS
                  </div>

                  <div className="mt-4 space-y-3">
                    {sorted.map((e) => (
                      <div
                        key={e.id}
                        className={
                          "rounded-2xl border p-4 ring-1 " +
                          (e.important
                            ? "border-fuchsia-400/30 bg-fuchsia-400/10 ring-fuchsia-300/20"
                            : "border-white/10 bg-black/20 ring-white/10")
                        }
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">
                              {e.title}
                            </div>
                            <div className="mt-1 text-xs font-semibold text-white/70">
                              {e.date} • {e.time} • {e.location}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEvents((prev) =>
                                  prev.map((x) =>
                                    x.id === e.id
                                      ? { ...x, important: !x.important }
                                      : x
                                  )
                                )
                              }
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              Toggle Important
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setEvents((prev) => prev.filter((x) => x.id !== e.id))
                              }
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-white/70">
                          {e.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
