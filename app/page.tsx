import Link from "next/link";

import { EventCard } from "./components/EventCard";
import { GlowButton } from "./components/GlowButton";
import { HeroBackdrop } from "./components/HeroBackdrop";
import { mockEvents } from "./lib/events";

export default function Home() {
  return (
    <main>
      <section className="relative">
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-20">
          <HeroBackdrop />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(41,255,138,0.6)]" />
              HIGH-BPM COMMUNITY HUB
            </div>

            <h1 className="mt-6 max-w-2xl text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
              Denpasar’s Home for Maimai Players. Let&apos;s Play!
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
              Whether you&apos;re chasing an AP or just survived your first Basic chart, DMMC is your
              local hub for arcade meetups, high scores, and rhythm game vibes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <GlowButton href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p" variant="green" className="w-full sm:w-auto">
                Join the WhatsApp Group 🎮
              </GlowButton>
              <Link
                href="/events"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white/85 hover:bg-white/10 hover:text-white"
              >
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              About DMMC
            </h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              We are a passionate collective of rhythm game enthusiasts based right here in Denpasar,
              Bali. Brought together by the flashing lights and high-BPM beats of Sega&apos;s maimai,
              DMMC was created to connect local players of all skill levels. We know that grinding
              for that SSS+ rank is always better with friends cheering you on.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="text-sm font-bold tracking-widest text-white/80">
              QUICK LINKS
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm font-semibold">
              <Link
                href="/rules"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/80 hover:bg-black/40 hover:text-white"
              >
                Rules & Etiquette
              </Link>
              <Link
                href="/events"
                className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/80 hover:bg-black/40 hover:text-white"
              >
                Upcoming Meetups
              </Link>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Mobile-first, installable, and built for arcade energy.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-fuchsia-100 ring-1 ring-fuchsia-300/20">
                TOURNAMENT MODE
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Run brackets, pick songs, and track scores.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Create a single-elimination bracket, assign songs per match, and enter scores with
                4-decimal precision. Perfect for weekly meetups and friendly rivalries.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GlowButton href="/tournament" variant="pink" className="w-full sm:w-auto">
                  Open Tournament
                </GlowButton>
                <Link
                  href="/songs"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white/85 hover:bg-white/10 hover:text-white"
                >
                  Pick Songs
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">BRACKET</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Scrollable rounds</div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Wide match cards with easy winner selection.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">SONGS</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Search + import picks</div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Searchable selector and per-match song lists.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">SCORES</div>
                <div className="mt-2 text-sm font-semibold text-white/85">4-decimal precision</div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Totals are calculated and shown beside player names.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">SAVE</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Auto-persisted</div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Bracket setup and scores are saved on-device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold tracking-wider text-emerald-100 ring-1 ring-emerald-300/20">
                SCORE IMPORT (Alpha - Not Stable)
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Import your maimai DX NET scores in seconds.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Drag one bookmarklet to your bookmarks bar, open maimaidx-eng.com, then run it. Your scores are sent straight to
                <span className="font-semibold text-white"> /my-score</span> — no copy-paste, no downloads.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GlowButton href="/bookmarklets" variant="green" className="w-full sm:w-auto">
                  Open Bookmarklets
                </GlowButton>
               
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">ONE CLICK</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Run from bookmarks</div>
                <p className="mt-2 text-sm leading-6 text-white/60">No extensions needed — works on desktop and mobile.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">LIVE TRANSFER</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Sends to your DMMC tab</div>
                <p className="mt-2 text-sm leading-6 text-white/60">Exports your play record list and posts JSON securely to the receiver.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">INTL READY</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Made for maimaidx-eng.com</div>
                <p className="mt-2 text-sm leading-6 text-white/60">Built specifically for the international DX NET site.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 ring-1 ring-white/10">
                <div className="text-xs font-bold tracking-widest text-white/60">FALLBACK</div>
                <div className="mt-2 text-sm font-semibold text-white/85">Download if popups are blocked</div>
                <p className="mt-2 text-sm leading-6 text-white/60">If the receiver tab can’t open, you still get a JSON file.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Upcoming Arcade Meetups
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Cards glow brighter when the event is marked as an important announcement.
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
