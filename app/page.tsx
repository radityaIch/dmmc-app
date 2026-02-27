import Link from "next/link";

import { EventCard } from "./components/EventCard";
import { GlowButton } from "./components/GlowButton";
import { mockEvents } from "./lib/events";

export default function Home() {
  return (
    <main>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative">
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <div className="relative py-6 sm:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ff4fd8]/40 bg-[#ff4fd8]/15 px-4 py-2 text-xs font-bold tracking-wider text-pink-100">
                  <span className="h-2 w-2 rounded-full bg-[#ff4fd8] shadow-[0_0_16px_rgba(255,79,216,0.7)]" />
                  DMMC ARCADE
                </div>

                <h1 className="mt-6 max-w-2xl text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                  Denpasar&apos;s maimai community, in one place.
                </h1>
                <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/78 sm:text-lg">
                  Track scores, run tournaments, find meetups, and connect with
                  local players — all without leaving your browser.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <GlowButton
                    href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p"
                    variant="pink"
                    className="w-full sm:w-auto"
                  >
                    Join WhatsApp Group
                  </GlowButton>
                  <Link
                    href="/events"
                    className="inline-flex items-center justify-center rounded-full border border-[#ff4fd8]/45 bg-white px-6 py-3 text-base font-semibold text-[#ff4fd8] hover:bg-[#ff4fd8]/22"
                  >
                    See Events
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[320px]">
                <img
                  src="/assets/images/circle_colorful.png"
                  alt=""
                  className="absolute top-8 left-1/2 h-[270px] w-[270px] -translate-x-1/2 opacity-70"
                />
                <img
                  src="/assets/images/chara.png"
                  alt="DMMC characters"
                  className="absolute right-1/2 sm:bottom-0 lg:-bottom-20 lg:h-[500px] sm:h-[200px] w-auto translate-x-1/2 animate-[floaty_6.5s_ease-in-out_infinite]"
                />
                <img
                  src="/assets/images/kv_logo_pc.png"
                  alt="maimai circle logo"
                  className="absolute bottom-4 left-1/2 w-[240px] -translate-x-1/2 drop-shadow-[0_10px_20px_rgba(0,0,0,0.45)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About + Quick Links ───────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              About DMMC
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              DMMC is a Denpasar-based maimai circle open to players of all
              levels. We organize regular meetups, casual sessions, and
              small-scale tournaments across arcades in Bali. If you play —
              or want to start — you&apos;re welcome here.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-6 ring-1 ring-white/10">
            <h3 className="text-sm font-bold tracking-widest text-white/80">
              QUICK LINKS
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
              <Link
                href="/rules"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/80 transition hover:bg-black/40 hover:text-white"
              >
                Rules &amp; Etiquette
              </Link>
              <Link
                href="/events"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/80 transition hover:bg-black/40 hover:text-white"
              >
                Upcoming Meetups
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/50">
              Works as a PWA — add to home screen for quick access.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tournament ────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-6 ring-1 ring-[#ff4fd8]/20 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-fuchsia-100 ring-1 ring-fuchsia-300/20">
                TOURNAMENT
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Run a bracket in minutes.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Single-elimination brackets with per-match song selection and
                score entry to 4 decimal places. Designed for how DMMC
                actually runs its meetups.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GlowButton
                  href="/tournament"
                  variant="pink"
                  className="w-full sm:w-auto"
                >
                  Open Tournament
                </GlowButton>
                <Link
                  href="/songs"
                  className="inline-flex items-center justify-center rounded-full border border-[#ff4fd8]/35 bg-white/12 px-6 py-3 text-base font-semibold text-white/90 hover:bg-[#ff4fd8]/20 hover:text-white"
                >
                  Song List
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-sky-300/30 bg-[linear-gradient(180deg,rgba(57,183,255,0.2),rgba(8,19,39,0.9))] p-5 ring-1 ring-sky-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  BRACKET
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Scrollable rounds
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Wide match cards with one-tap winner selection.
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/35 bg-[linear-gradient(180deg,rgba(255,79,216,0.22),rgba(40,9,42,0.9))] p-5 ring-1 ring-fuchsia-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  SONGS
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Search &amp; assign picks
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Searchable song selector with per-match lists.
                </p>
              </div>
              <div className="rounded-2xl border border-violet-300/35 bg-[linear-gradient(180deg,rgba(168,85,247,0.2),rgba(24,12,40,0.9))] p-5 ring-1 ring-violet-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  SCORES
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  4-decimal precision
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Totals shown beside each player name per round.
                </p>
              </div>
              <div className="rounded-2xl border border-lime-200/35 bg-[linear-gradient(180deg,rgba(213,255,99,0.22),rgba(30,36,8,0.9))] p-5 ring-1 ring-lime-100/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  SAVE
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Saved on-device
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Bracket and scores persist across sessions automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Score Import ──────────────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-6 ring-1 ring-[#ff4fd8]/20 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-emerald-100 ring-1 ring-emerald-300/20">
                SCORE IMPORT
                <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ALPHA
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Pull your scores from maimai DX NET.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Drag a bookmarklet to your browser, open{" "}
                <span className="font-semibold text-white/90">
                  maimaidx-eng.com
                </span>
                , and run it. Your full play record is sent to{" "}
                <span className="font-semibold text-white">/my-score</span>{" "}
                automatically — no copy-paste, no file downloads.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GlowButton
                  href="/bookmarklets"
                  variant="green"
                  className="w-full sm:w-auto"
                >
                  Get the Bookmarklets
                </GlowButton>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-300/30 bg-[linear-gradient(180deg,rgba(16,185,129,0.2),rgba(8,33,25,0.9))] p-5 ring-1 ring-emerald-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  ONE CLICK
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Run from bookmarks bar
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  No extensions. Works on desktop and mobile.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-300/30 bg-[linear-gradient(180deg,rgba(56,189,248,0.2),rgba(8,19,39,0.9))] p-5 ring-1 ring-sky-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  LIVE TRANSFER
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Direct to your DMMC tab
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Exports your play record as JSON and posts it to the
                  receiver tab.
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/35 bg-[linear-gradient(180deg,rgba(255,79,216,0.22),rgba(40,9,42,0.9))] p-5 ring-1 ring-fuchsia-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  INTL READY
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  Built for maimaidx-eng.com
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Targets the international DX NET site specifically.
                </p>
              </div>
              <div className="rounded-2xl border border-amber-300/35 bg-[linear-gradient(180deg,rgba(251,191,36,0.2),rgba(42,27,6,0.9))] p-5 ring-1 ring-amber-200/20 backdrop-blur-sm">
                <div className="text-xs font-bold tracking-widest text-white/60">
                  FALLBACK
                </div>
                <div className="mt-2 text-sm font-semibold text-white/95">
                  JSON download if needed
                </div>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  If the receiver tab can&apos;t open, a file download kicks in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Locations + Events ───────────────────────────── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="mb-10 rounded-3xl border border-[#ff4fd8]/30 bg-[linear-gradient(180deg,rgba(20,8,32,0.9),rgba(14,7,24,0.9))] p-6 ring-1 ring-[#ff4fd8]/20 sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              maimai DX Locations in Bali
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Tap a location to open directions in Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <a
              href="https://www.google.com/maps/search/?api=1&query=TIMEZONE+GALERIA+BALI"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-sky-300/30 bg-[linear-gradient(180deg,rgba(57,183,255,0.18),rgba(8,19,39,0.88))] p-5 ring-1 ring-sky-200/20 transition hover:translate-y-[-2px]"
            >
              <div className="text-sm font-bold text-white">
                Timezone Galeria Bali
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-white/55">
                <span>Open in Maps</span>
                <span>↗</span>
              </div>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=TIMEZONE+TRANS+STUDIO+MAL+BALI"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-fuchsia-300/35 bg-[linear-gradient(180deg,rgba(255,79,216,0.2),rgba(40,9,42,0.9))] p-5 ring-1 ring-fuchsia-200/20 transition hover:translate-y-[-2px]"
            >
              <div className="text-sm font-bold text-white">
                Timezone Trans Studio Mal Bali
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-white/55">
                <span>Open in Maps</span>
                <span>↗</span>
              </div>
            </a>

            <a
              href="https://www.google.com/maps/search/?api=1&query=TIMEZONE+LEVEL+21"
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-lime-200/35 bg-[linear-gradient(180deg,rgba(213,255,99,0.2),rgba(30,36,8,0.9))] p-5 ring-1 ring-lime-100/20 transition hover:translate-y-[-2px]"
            >
              <div className="text-sm font-bold text-white">
                Timezone Level 21
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-white/55">
                <span>Open in Maps</span>
                <span>↗</span>
              </div>
            </a>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Upcoming Meetups
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
              Highlighted cards are pinned announcements.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white sm:inline-flex"
          >
            All events
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mockEvents.slice(0, 4).map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white"
          >
            All events
          </Link>
        </div>
      </section>
    </main>
  );
}
