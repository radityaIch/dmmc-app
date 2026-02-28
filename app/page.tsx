import Link from "next/link";

import { HomeEventsPreview } from "./components/HomeEventsPreview";
import { MAIMAI_LOCATIONS } from "./lib/locations";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-gray-100">
      <main className="relative z-10 min-h-screen overflow-x-hidden">

        {/* Hero Section */}
        <section className="relative z-10 w-full flex flex-col items-center justify-end" style={{ minHeight: '92svh' }}>

          {/* Decorative spinning circle */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            <img
              src="/assets/images/circle_colorful.png"
              alt=""
              aria-hidden="true"
              className="absolute top-4 left-1/2 w-[480px] md:w-[680px] -translate-x-1/2 opacity-50 animate-[slowSpin_15s_linear_infinite]"
            />
          </div>

          {/* Characters + logo stacked */}
          <div className="absolute inset-0 top-16 flex flex-col items-center pointer-events-none select-none z-0 overflow-hidden">
            <img
              src="/assets/images/chara.png"
              alt="DMMC Characters"
              className="w-[260px] md:w-[420px] drop-shadow-2xl animate-[floaty_5s_ease-in-out_infinite]"
            />
            <img
              src="/assets/images/kv_logo_pc.png"
              alt="maimai DX"
              className="-mt-8 w-[180px] md:w-[280px] drop-shadow-[0_8px_24px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Gradient fade */}
          <div
            className="absolute -bottom-16 left-0 right-0 h-[60%] pointer-events-none z-[5]"
            style={{ background: 'linear-gradient(to top, transparent 0%, #17061f 20%, #17061f 75%, transparent 100%)' }}
          />

          {/* Hero text + CTAs */}
          <div className="relative z-10 w-full px-4 pb-20 flex flex-col items-center text-center">
            <h1
              className="text-3xl md:text-5xl font-extrabold text-white tracking-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 48px rgba(255,79,216,0.4)' }}
            >
              Bali&apos;s home for maimai players.
            </h1>
            <p
              className="mt-3 text-base md:text-lg font-semibold text-gray-200/90 max-w-xl leading-relaxed"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,1)' }}
            >
              DMMC is Denpasar&apos;s main maimai community — 100+ members strong, going for years, and always welcoming new faces. Wherever you play in Bali, you&apos;ll find a DMMC member there.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p"
                className="inline-flex items-center justify-center text-white text-lg font-semibold py-3 px-8 rounded-full bg-[#d63fb5] border border-[#e87fd3]/40 shadow-[0_2px_12px_rgba(214,63,181,0.25)] hover:bg-[#c4379f] hover:shadow-[0_4px_20px_rgba(214,63,181,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Join the Community
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center text-white text-lg font-semibold py-3 px-8 rounded-full bg-[#2a8fd4] border border-[#6eb8e8]/40 shadow-[0_2px_12px_rgba(42,143,212,0.25)] hover:bg-[#2380bf] hover:shadow-[0_4px_20px_rgba(42,143,212,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Find a Meetup
              </Link>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 flex flex-col gap-8">

          {/* About DMMC */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#ff4fd8]/30 shadow-[0_8px_32px_rgba(255,79,216,0.18)] p-8 md:p-10 w-full">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-12 bg-[#ff4fd8]/30" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide">
                Who We Are
              </h2>
              <div className="h-px flex-1 max-w-12 bg-[#ff4fd8]/30" />
            </div>

            <p className="text-center md:text-lg font-medium text-[#2f2461]/75 mb-8 max-w-3xl mx-auto leading-relaxed border-b border-[#ff4fd8]/15 pb-8">
              DMMC (Denpasar Maimai Community) has been Bali&apos;s premier maimai circle for years. Whether you&apos;re a seasoned SSS+ chaser or just hit your first arcade machine last week, you belong here. We hang out at every maimai cabinet in Bali — from malls to arcades — and host regular meetups and tournaments to keep the community buzzing. Come as you are, leave with friends who get it.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { num: '100+', label: 'Members' },
                { num: 'Years', label: 'Going Strong' },
                { num: 'All', label: 'Skill Levels' },
              ].map(stat => (
                <div key={stat.label} className="text-center bg-white/80 border border-[#ff4fd8]/15 shadow-[0_2px_12px_rgba(255,79,216,0.08)] rounded-2xl py-4 px-2">
                  <div className="text-2xl md:text-3xl font-extrabold text-[#ff4fd8]">{stat.num}</div>
                  <div className="text-xs md:text-sm font-semibold text-[#2f2461]/55 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/rules" className="block text-center rounded-2xl border border-[#39b7ff]/30 bg-[#39b7ff]/5 p-4 font-bold text-[#168bff] hover:bg-[#39b7ff]/10 hover:shadow-[0_4px_20px_rgba(57,183,255,0.15)] transition-all">
                Rules & Etiquette
              </Link>
              <Link href="/events" className="block text-center rounded-2xl border border-[#ff8e4f]/30 bg-[#ff8e4f]/5 p-4 font-bold text-[#e67a3a] hover:bg-[#ff8e4f]/10 hover:shadow-[0_4px_20px_rgba(255,142,79,0.15)] transition-all">
                Upcoming Meetups
              </Link>
            </div>
          </div>

          {/* Locations & Events Previews */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#ffbb33]/30 shadow-[0_8px_32px_rgba(255,187,51,0.18)] p-8 w-full">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 max-w-12 bg-[#ffbb33]/30" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide text-center">
                  Where We Play
                </h2>
                <div className="h-px flex-1 max-w-12 bg-[#ffbb33]/30" />
              </div>
              <p className="text-[#2f2461]/70 font-medium text-center max-w-xl">
                You&apos;ll find DMMC members at every maimai DX cabinet across Bali. Here&apos;s where to look.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
              {MAIMAI_LOCATIONS.map(loc => (
                <a
                  key={loc.id}
                  href={loc.googleMapURL}
                  target="_blank"
                  rel="noreferrer"
                  className="group block bg-white/80 border border-[#39b7ff]/20 shadow-[0_2px_12px_rgba(57,183,255,0.06)] rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(57,183,255,0.15)]"
                >
                  <div className="text-sm font-bold text-[#168bff]">{loc.name}</div>
                  <div className="mt-1 text-xs font-medium text-[#2f2461]/55">{loc.address}</div>
                  <div className="mt-3 text-xs font-bold text-[#39b7ff]/70 group-hover:text-[#168bff] flex justify-end transition-colors">
                    Open in Maps ↗
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-12 bg-[#ff4fd8]/30" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide text-center">
                Next Meetups
              </h2>
              <div className="h-px flex-1 max-w-12 bg-[#ff4fd8]/30" />
            </div>

            <div className="bg-white/60 border border-[#ff4fd8]/15 shadow-inner rounded-2xl p-4 sm:p-6 mb-6">
              <HomeEventsPreview />
            </div>

            <div className="flex justify-center">
              <Link
                href="/events"
                className="inline-flex items-center justify-center text-white text-base font-semibold py-3 px-8 rounded-full bg-[#d63fb5] border border-[#e87fd3]/40 shadow-[0_2px_12px_rgba(214,63,181,0.25)] hover:bg-[#c4379f] hover:shadow-[0_4px_20px_rgba(214,63,181,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                See All Events
              </Link>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#39b7ff]/30 shadow-[0_8px_32px_rgba(57,183,255,0.18)] p-8 w-full">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-12 bg-[#39b7ff]/30" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide text-center">
                Run Tournaments
              </h2>
              <div className="h-px flex-1 max-w-12 bg-[#39b7ff]/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <p className="font-medium text-[#2f2461]/75 text-lg mb-6 leading-relaxed">
                  DMMC hosts regular in-community tournaments — and we built our own bracket tool for it. Single-elimination, per-match song picks, and score entry down to 4 decimal places. No Challonge, no spreadsheets.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link
                    href="/tournament"
                    className="inline-flex items-center justify-center text-white text-base font-semibold py-3 px-6 rounded-full bg-[#d63fb5] border border-[#e87fd3]/40 shadow-[0_2px_12px_rgba(214,63,181,0.25)] hover:bg-[#c4379f] hover:shadow-[0_4px_20px_rgba(214,63,181,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Open Tournament
                  </Link>
                  <Link
                    href="/songs"
                    className="inline-flex items-center justify-center text-white text-base font-semibold py-3 px-6 rounded-full bg-[#d4960f] border border-[#e8bf5e]/40 shadow-[0_2px_12px_rgba(212,150,15,0.25)] hover:bg-[#bf870d] hover:shadow-[0_4px_20px_rgba(212,150,15,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Song List
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { title: 'BRACKET', text: 'Scrollable rounds', bg: 'bg-[#39b7ff]/5', border: 'border-[#39b7ff]/20', color: 'text-[#168bff]' },
                  { title: 'SONGS', text: 'Search & assign picks', bg: 'bg-[#ff4fd8]/5', border: 'border-[#ff4fd8]/20', color: 'text-[#ff4fd8]' },
                  { title: 'SCORES', text: '4-decimal precision', bg: 'bg-[#b54fff]/5', border: 'border-[#b54fff]/20', color: 'text-[#b54fff]' },
                  { title: 'SAVE', text: 'Saved on-device', bg: 'bg-[#2cb869]/5', border: 'border-[#2cb869]/20', color: 'text-[#2cb869]' },
                ].map(item => (
                  <div key={item.title} className={`${item.bg} border ${item.border} rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]`}>
                    <div className={`text-xs font-bold ${item.color} mb-1`}>{item.title}</div>
                    <div className="text-sm font-medium text-[#2f2461]/65 leading-tight">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Import */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#2cb869]/30 shadow-[0_8px_32px_rgba(44,184,105,0.18)] p-8 w-full mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-12 bg-[#2cb869]/30" />
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide text-center">
                Track Your Scores
              </h2>
              <div className="h-px flex-1 max-w-12 bg-[#2cb869]/30" />
            </div>

            <p className="text-center font-medium text-[#2f2461]/75 text-lg mb-6 max-w-3xl mx-auto leading-relaxed">
              Import your full play record from <span className="font-bold text-[#ff4fd8]">maimai DX NET</span> with one click. Just drag a bookmarklet to your bookmarks bar and run it from the game site — your scores land on DMMC automatically.
            </p>

            <div className="flex justify-center mb-8">
              <Link
                href="/bookmarklets"
                className="inline-flex items-center justify-center text-white text-lg font-semibold py-3 px-8 rounded-full bg-[#1ea85a] border border-[#5ec98a]/40 shadow-[0_2px_12px_rgba(30,168,90,0.25)] hover:bg-[#1a944f] hover:shadow-[0_4px_20px_rgba(30,168,90,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Get the Bookmarklet
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {[
                { title: 'ONE CLICK', text: 'Run from bookmarks bar' },
                { title: 'LIVE TRANSFER', text: 'Direct to your DMMC tab' },
                { title: 'INTL READY', text: 'Works on maimaidx-eng.com' },
                { title: 'FALLBACK', text: 'JSON download if needed' },
              ].map(item => (
                <div key={item.title} className="bg-[#2cb869]/5 border border-[#2cb869]/20 rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                  <div className="text-xs font-bold text-[#2cb869] mb-1">{item.title}</div>
                  <div className="text-sm font-medium text-[#2f2461]/65 leading-tight">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
