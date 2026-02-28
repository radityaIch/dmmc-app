import Link from "next/link";

import { HomeEventsPreview } from "./components/HomeEventsPreview";
import { MAIMAI_LOCATIONS } from "./lib/locations";

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-gray-100">
      <main className="relative z-10 min-h-screen overflow-x-hidden">

        {/* Hero Section — unified flex column, visuals + text in one frame */}
        <section className="relative z-10 w-full flex flex-col items-center justify-end" style={{ minHeight: '92svh' }}>

          {/* Decorative spinning circle — clipped to hero bounds, doesn't affect section overflow */}
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

          {/* Gradient fade up from page bg, makes text below readable */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none z-[5]"
            style={{ background: 'linear-gradient(to top, #17061f 40%, #17061fcc 75%, transparent 100%)' }}
          />

          {/* Hero text + CTAs */}
          <div className="relative z-10 w-full px-4 pb-20 flex flex-col items-center text-center">
            <h1
              className="text-3xl md:text-5xl font-black text-white tracking-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 0 48px rgba(255,79,216,0.4)' }}
            >
              Bali&apos;s home for maimai players.
            </h1>
            <p
              className="mt-3 text-base md:text-lg font-bold text-gray-200 max-w-xl"
              style={{ textShadow: '0 1px 10px rgba(0,0,0,1)' }}
            >
              DMMC is Denpasar&apos;s main maimai community — 100+ members strong, going for years, and always welcoming new faces. Wherever you play in Bali, you&apos;ll find a DMMC member there.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p"
                className="bg-[#ff4fd8] hover:bg-[#e63bc1] text-white text-xl font-bold py-3 px-8 rounded-full border-4 border-[#ffaad8] shadow-[0_6px_0_#c31f9d] active:shadow-[0_2px_0_#c31f9d] active:translate-y-[4px] transition-all"
              >
                Join the Community
              </Link>
              <Link
                href="/events"
                className="bg-[#4fb8ff] hover:bg-[#3ba0e6] text-white text-xl font-bold py-3 px-8 rounded-full border-4 border-[#add2f7] shadow-[0_6px_0_#1a7abf] active:shadow-[0_2px_0_#1a7abf] active:translate-y-[4px] transition-all"
              >
                Find a Meetup
              </Link>
            </div>
          </div>
        </section>

        {/* Content Columns */}
        <section className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 flex flex-col gap-10">

          {/* About DMMC */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-[0_10px_0_#ff4fd8,0_15px_40px_rgba(255,79,216,0.2)] border-2 border-[#ff4fd8]/40 p-8 md:p-10 w-full">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl text-[#ff4fd8]">{"<<<"}</span>
              <h2 className="text-3xl font-black text-[#2f2461] tracking-widest uppercase">
                Who We Are
              </h2>
              <span className="text-3xl text-[#ff4fd8]">{">>>"}</span>
            </div>

            <div className="text-center md:text-lg font-bold text-[#2f2461]/80 mb-8 max-w-3xl mx-auto border-b-2 border-dashed border-[#ff4fd8]/30 pb-8">
              DMMC (Denpasar Maimai Community) has been Bali&apos;s premier maimai circle for years. Whether you&apos;re a seasoned SSS+ chaser or just hit your first arcade machine last week, you belong here. We hang out at every maimai cabinet in Bali — from malls to arcades — and host regular meetups and tournaments to keep the community buzzing. Come as you are, leave with friends who get it.
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { num: '100+', label: 'Members' },
                { num: 'Years', label: 'Going Strong' },
                { num: 'All', label: 'Skill Levels' },
              ].map(stat => (
                <div key={stat.label} className="text-center bg-white border-2 border-[#ff4fd8]/20 shadow-sm rounded-xl py-4 px-2">
                  <div className="text-2xl md:text-3xl font-black text-[#ff4fd8]">{stat.num}</div>
                  <div className="text-xs md:text-sm font-bold text-[#2f2461]/60 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/rules" className="block text-center border-2 border-[#4fb8ff]/50 rounded-2xl p-4 bg-white hover:bg-[#f0f8ff] transition-colors font-black text-[#4fb8ff] shadow-[0_6px_0_#4fb8ff] active:translate-y-[6px] active:shadow-none">
                Rules & Etiquette
              </Link>
              <Link href="/events" className="block text-center border-2 border-[#ff8e4f]/50 rounded-2xl p-4 bg-white hover:bg-[#fff5f0] transition-colors font-black text-[#ff8e4f] shadow-[0_6px_0_#ff8e4f] active:translate-y-[6px] active:shadow-none">
                Upcoming Meetups
              </Link>
            </div>
          </div>

          {/* Locations & Events Previews */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-[0_10px_0_#ffbb33,0_15px_40px_rgba(255,187,51,0.2)] border-2 border-[#ffbb33]/40 p-8 w-full">
            <div className="flex flex-col items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl text-[#ffbb33]">{"<<<"}</span>
                <h2 className="text-2xl md:text-3xl font-black text-[#2f2461] tracking-widest uppercase text-center">
                  Where We Play
                </h2>
                <span className="text-3xl text-[#ffbb33]">{">>>"}</span>
              </div>
              <p className="text-[#2f2461]/80 font-bold text-center max-w-xl">
                You&apos;ll find DMMC members at every maimai DX cabinet across Bali. Here&apos;s where to look.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {MAIMAI_LOCATIONS.map(loc => (
                <a
                  key={loc.id}
                  href={loc.googleMapURL}
                  target="_blank"
                  rel="noreferrer"
                  className="block bg-white hover:bg-[#f0f8ff] shadow-sm border-2 border-[#4fb8ff]/30 rounded-2xl p-4 transition-transform hover:-translate-y-1"
                >
                  <div className="text-sm font-black text-[#4fb8ff]">{loc.name}</div>
                  <div className="mt-1 text-xs font-bold text-[#2f2461]/60">{loc.address}</div>
                  <div className="mt-3 text-xs font-black text-[#4fb8ff] flex justify-end">
                    Open in Maps ↗
                  </div>
                </a>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-3xl text-[#ff4fd8]">{"<<<"}</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#2f2461] tracking-widest uppercase text-center">
                Next Meetups
              </h2>
              <span className="text-3xl text-[#ff4fd8]">{">>>"}</span>
            </div>

            <div className="bg-white shadow-inner border-2 border-[#ff4fd8]/20 rounded-3xl p-4 sm:p-6 mb-6">
              <HomeEventsPreview />
            </div>

            <div className="flex justify-center">
              <Link href="/events" className="bg-[#ff4fd8] hover:bg-[#e63bc1] text-white text-lg font-bold py-3 px-8 rounded-full border-4 border-[#ffaad8] shadow-[0_6px_0_#c31f9d] active:shadow-[0_2px_0_#c31f9d] active:translate-y-[4px] transition-all">
                See All Events
              </Link>
            </div>
          </div>

          {/* Tournament Info */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-[0_10px_0_#4fb8ff,0_15px_40px_rgba(79,184,255,0.2)] border-2 border-[#4fb8ff]/40 p-8 w-full">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl text-[#4fb8ff]">{"<<<"}</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#2f2461] tracking-widest uppercase text-center">
                Run Tournaments
              </h2>
              <span className="text-3xl text-[#4fb8ff]">{">>>"}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <p className="font-bold text-[#2f2461]/80 text-lg mb-6">
                  DMMC hosts regular in-community tournaments — and we built our own bracket tool for it. Single-elimination, per-match song picks, and score entry down to 4 decimal places. No Challonge, no spreadsheets.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/tournament" className="bg-[#ff4fd8] hover:bg-[#e63bc1] text-white text-lg font-bold py-3 px-6 rounded-full border-4 border-[#ffaad8] shadow-[0_6px_0_#c31f9d] active:shadow-[0_2px_0_#c31f9d] active:translate-y-[4px] transition-all">
                    Open Tournament
                  </Link>
                  <Link href="/songs" className="bg-[#ffbb33] hover:bg-[#e6a82e] text-white text-lg font-bold py-3 px-6 rounded-full border-4 border-[#ffe59e] shadow-[0_6px_0_#c99120] active:shadow-[0_2px_0_#c99120] active:translate-y-[4px] transition-all">
                    Song List
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {[
                  { title: 'BRACKET', text: 'Scrollable rounds', bg: 'bg-[#f0f8ff]', border: 'border-[#4fb8ff]/40', color: 'text-[#4fb8ff]' },
                  { title: 'SONGS', text: 'Search & assign picks', bg: 'bg-[#fff0f8]', border: 'border-[#ff4fd8]/40', color: 'text-[#ff4fd8]' },
                  { title: 'SCORES', text: '4-decimal precision', bg: 'bg-[#f8f0ff]', border: 'border-[#b54fff]/40', color: 'text-[#b54fff]' },
                  { title: 'SAVE', text: 'Saved on-device', bg: 'bg-[#f0fff0]', border: 'border-[#2cb869]/40', color: 'text-[#2cb869]' },
                ].map(item => (
                  <div key={item.title} className={`${item.bg} border-2 ${item.border} rounded-xl p-3 shadow-sm`}>
                    <div className={`text-xs font-black ${item.color} mb-1`}>{item.title}</div>
                    <div className="text-sm font-bold text-[#2f2461]/70 leading-tight">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Import */}
          <div className="bg-white/90 backdrop-blur-xl rounded-[40px] shadow-[0_10px_0_#2cb869,0_15px_40px_rgba(44,184,105,0.2)] border-2 border-[#2cb869]/40 p-8 w-full mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl text-[#2cb869]">{"<<<"}</span>
              <h2 className="text-2xl md:text-3xl font-black text-[#2f2461] tracking-widest uppercase text-center">
                Track Your Scores
              </h2>
              <span className="text-3xl text-[#2cb869]">{">>>"}</span>
            </div>

            <div className="text-center font-bold text-[#2f2461]/80 text-lg mb-6 max-w-3xl mx-auto">
              Import your full play record from <span className="text-[#ff4fd8]">maimai DX NET</span> with one click. Just drag a bookmarklet to your bookmarks bar and run it from the game site — your scores land on DMMC automatically.
            </div>

            <div className="flex justify-center mb-8">
              <Link href="/bookmarklets" className="bg-[#2cb869] hover:bg-[#259e5a] text-white text-xl font-bold py-3 px-8 rounded-full border-4 border-[#bdfcd0] shadow-[0_6px_0_#1c7d45] active:shadow-[0_2px_0_#1c7d45] active:translate-y-[4px] transition-all">
                Get the Bookmarklet
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
              {[
                { title: 'ONE CLICK', text: 'Run from bookmarks bar' },
                { title: 'LIVE TRANSFER', text: 'Direct to your DMMC tab' },
                { title: 'INTL READY', text: 'Works on maimaidx-eng.com' },
                { title: 'FALLBACK', text: 'JSON download if needed' }
              ].map(item => (
                <div key={item.title} className="bg-white shadow-sm border-2 border-[#2cb869]/30 rounded-xl p-3">
                  <div className="text-xs font-black text-[#2cb869] mb-1">{item.title}</div>
                  <div className="text-sm font-bold text-[#2f2461]/70 leading-tight">{item.text}</div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
