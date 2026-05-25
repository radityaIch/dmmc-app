import Link from "next/link";

import { GlowButton } from "./components/GlowButton";
import { HomeEventsPreview } from "./components/HomeEventsPreview";
import { PageCard } from "./components/PageCard";
import { PageWrapper } from "./components/PageWrapper";
import { SectionHeader } from "./components/SectionHeader";
import { MAIMAI_LOCATIONS } from "./lib/locations";

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center" style={{ minHeight: '92svh' }}>

        {/* Decorative floating clouds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <div className="absolute top-12 left-[5%] text-6xl md:text-8xl opacity-20 animate-[floaty_8s_ease-in-out_infinite]">&#x2601;</div>
          <div className="absolute top-32 right-[8%] text-5xl md:text-7xl opacity-15 animate-[floaty_9s_ease-in-out_infinite_1s]">&#x2601;</div>
          <div className="absolute top-56 left-[15%] text-4xl md:text-6xl opacity-15 animate-[floaty_7.5s_ease-in-out_infinite_0.5s]">&#x2B50;</div>
          <div className="absolute top-48 right-[12%] text-3xl md:text-5xl opacity-20 animate-[floaty_6.5s_ease-in-out_infinite_2s]">&#x2B50;</div>
        </div>

        {/* Spinning circle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src="/assets/images/circle_colorful.png"
            alt=""
            aria-hidden="true"
            className="absolute top-4 left-1/2 w-[480px] md:w-[680px] -translate-x-1/2 opacity-30 animate-[slowSpin_15s_linear_infinite]"
          />
        </div>

        {/* Characters + logo stacked */}
        <div className="absolute inset-0 top-12 flex flex-col items-center pointer-events-none select-none z-0 overflow-hidden">
          <img
            src="/assets/images/chara.png"
            alt="DMMC Characters"
            className="w-[260px] md:w-[420px] drop-shadow-2xl animate-[floaty_5s_ease-in-out_infinite]"
          />
          <img
            src="/assets/images/kv_logo_pc.png"
            alt="maimai DX"
            className="-mt-8 w-[180px] md:w-[280px] drop-shadow-lg"
          />
        </div>

        {/* Gradient fade at bottom */}
        <div
          className="absolute -bottom-16 left-0 right-0 h-[60%] pointer-events-none z-[5]"
          style={{ background: 'linear-gradient(to top, transparent 0%, #fff0f5 20%, #fff0f5 75%, transparent 100%)' }}
        />

        {/* Hero text + CTAs */}
        <div className="relative z-10 w-full px-4 pb-20 flex flex-col items-center text-center mt-auto">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold text-pink-600 tracking-tight drop-shadow-sm">
            Bali&apos;s home for maimai players.
          </h1>
          <p className="mt-4 text-base md:text-lg font-semibold text-slate-600 max-w-xl leading-relaxed">
            DMMC is Denpasar&apos;s main maimai community — 100+ members strong, going for years, and always welcoming new faces. Wherever you play in Bali, you&apos;ll find a DMMC member there.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p"
              className="inline-flex items-center justify-center text-white text-lg font-bold py-3 px-8 rounded-full bg-gradient-to-b from-pink-400 to-pink-500 shadow-[0_4px_16px_rgba(244,114,182,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(244,114,182,0.4)] active:translate-y-0 transition-all"
            >
              Join the Community
            </a>
            <Link
              href="/events"
              className="inline-flex items-center justify-center text-white text-lg font-bold py-3 px-8 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(6,182,212,0.4)] active:translate-y-0 transition-all"
            >
              Find a Meetup
            </Link>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <PageWrapper>

        {/* About DMMC */}
        <PageCard color="pink">
          <SectionHeader color="pink">Who We Are</SectionHeader>

          <p className="text-center md:text-lg font-medium text-slate-500 mb-8 max-w-3xl mx-auto leading-relaxed border-b border-pink-300/30 pb-8">
            DMMC (Denpasar Maimai Community) has been Bali&apos;s premier maimai circle for years. Whether you&apos;re a seasoned SSS+ chaser or just hit your first arcade machine last week, you belong here. We hang out at every maimai cabinet in Bali — from malls to arcades — and host regular meetups and tournaments to keep the community buzzing. Come as you are, leave with friends who get it.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { num: '100+', label: 'Members' },
              { num: 'Years', label: 'Going Strong' },
              { num: 'All', label: 'Skill Levels' },
            ].map(stat => (
              <div key={stat.label} className="text-center bg-white/90 border-2 border-pink-300/30 shadow-[0_2px_12px_rgba(244,114,182,0.08)] rounded-2xl py-4 px-2">
                <div className="text-2xl md:text-3xl font-extrabold text-pink-500">{stat.num}</div>
                <div className="text-xs md:text-sm font-semibold text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/rules" className="block text-center rounded-2xl border-2 border-cyan-300/30 bg-cyan-50/50 p-4 font-bold text-cyan-600 hover:bg-cyan-100/50 hover:shadow-[0_4px_20px_rgba(6,182,212,0.12)] transition-all">
              Rules & Etiquette
            </Link>
            <Link href="/events" className="block text-center rounded-2xl border-2 border-amber-300/30 bg-amber-50/50 p-4 font-bold text-amber-600 hover:bg-amber-100/50 hover:shadow-[0_4px_20px_rgba(251,191,36,0.12)] transition-all">
              Upcoming Meetups
            </Link>
          </div>
        </PageCard>

        {/* Locations & Events */}
        <PageCard color="yellow">
          <SectionHeader
            color="yellow"
            sub="You'll find DMMC members at every maimai DX cabinet across Bali. Here's where to look."
          >
            Where We Play
          </SectionHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
            {MAIMAI_LOCATIONS.map(loc => (
              <a
                key={loc.id}
                href={loc.googleMapURL}
                target="_blank"
                rel="noreferrer"
                className="group block bg-white/90 border-2 border-cyan-300/30 shadow-[0_2px_12px_rgba(6,182,212,0.06)] rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(6,182,212,0.12)]"
              >
                <div className="text-sm font-bold text-cyan-600">{loc.name}</div>
                <div className="mt-1 text-xs font-medium text-slate-400">{loc.address}</div>
                <div className="mt-3 text-xs font-bold text-cyan-400/70 group-hover:text-cyan-600 flex justify-end transition-colors">
                  Open in Maps &rarr;
                </div>
              </a>
            ))}
          </div>

          <SectionHeader color="pink">Next Meetups</SectionHeader>

          <div className="bg-white/60 border-2 border-pink-300/20 shadow-inner rounded-2xl p-4 sm:p-6 mb-6">
            <HomeEventsPreview />
          </div>

          <div className="flex justify-center">
            <GlowButton variant="pink" href="/events">
              See All Events
            </GlowButton>
          </div>
        </PageCard>

        {/* Tournament Info */}
        <PageCard color="blue">
          <SectionHeader color="blue">Run Tournaments</SectionHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <p className="font-medium text-slate-500 text-lg mb-6 leading-relaxed">
                DMMC hosts regular in-community tournaments — and we built our own bracket tool for it. Single-elimination, per-match song picks, and score entry down to 4 decimal places. No Challonge, no spreadsheets.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <GlowButton variant="pink" href="/tournament">
                  Open Tournament
                </GlowButton>
                <GlowButton variant="gold" href="/songs">
                  Song List
                </GlowButton>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { title: 'BRACKET', text: 'Scrollable rounds', bg: 'bg-cyan-50', border: 'border-cyan-300/30', color: 'text-cyan-600' },
                { title: 'SONGS', text: 'Search & assign picks', bg: 'bg-pink-50', border: 'border-pink-300/30', color: 'text-pink-500' },
                { title: 'SCORES', text: '4-decimal precision', bg: 'bg-purple-50', border: 'border-purple-300/30', color: 'text-purple-500' },
                { title: 'SAVE', text: 'Saved on-device', bg: 'bg-emerald-50', border: 'border-emerald-300/30', color: 'text-emerald-600' },
              ].map(item => (
                <div key={item.title} className={`${item.bg} border-2 ${item.border} rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}>
                  <div className={`text-xs font-bold ${item.color} mb-1`}>{item.title}</div>
                  <div className="text-sm font-medium text-slate-500 leading-tight">{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </PageCard>

        {/* Score Import */}
        <PageCard color="green" className="mb-12">
          <SectionHeader color="green">Track Your Scores</SectionHeader>

          <p className="text-center font-medium text-slate-500 text-lg mb-6 max-w-3xl mx-auto leading-relaxed">
            Import your full play record from <span className="font-bold text-pink-500">maimai DX NET</span> with one click. Just drag a bookmarklet to your bookmarks bar and run it from the game site — your scores land on DMMC automatically.
          </p>

          <div className="flex justify-center mb-8">
            <GlowButton variant="green" href="/bookmarklets">
              Get the Bookmarklet
            </GlowButton>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
            {[
              { title: 'ONE CLICK', text: 'Run from bookmarks bar' },
              { title: 'LIVE TRANSFER', text: 'Direct to your DMMC tab' },
              { title: 'INTL READY', text: 'Works on maimaidx-eng.com' },
              { title: 'FALLBACK', text: 'JSON download if needed' },
            ].map(item => (
              <div key={item.title} className="bg-emerald-50 border-2 border-emerald-300/30 rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                <div className="text-xs font-bold text-emerald-600 mb-1">{item.title}</div>
                <div className="text-sm font-medium text-slate-500 leading-tight">{item.text}</div>
              </div>
            ))}
          </div>
        </PageCard>

      </PageWrapper>
    </main>
  );
}
