import Image, { StaticImageData } from "next/image";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

import gloveImg from "./imgs/rule-glove.png";
import hitImg from "./imgs/rule-hit.png";
import queueImg from "./imgs/rule-queue.png";
import vibeImg from "./imgs/rule-vibe.png";

const rules: {
  title: string;
  tag: string;
  img: StaticImageData;
  body: string;
  gradient: string;
  border: string;
  tag_color: string;
}[] = [
    {
      title: "Wear Gloves",
      tag: "Equipment",
      img: gloveImg,
      body: "The touchscreen is sensitive to oils and friction. Playing bare-handed not only leaves smudges that affect touch accuracy — it also gets genuinely uncomfortable and hot from the friction, especially mid-session. Gloves keep your hands cool and your inputs clean. We keep extras at the counter if you don't have a pair.",
      gradient: "from-emerald-400/10",
      border: "border-emerald-400/30",
      tag_color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Follow the Queue System (Antre)",
      tag: "Fairness",
      img: queueImg,
      body: "Place your token or card on the designated spot to hold your turn. If the cabinet is occupied and others are waiting, keep your run to 1–2 credits before making way. This keeps wait times reasonable and ensures everyone gets their fair share of playtime.",
      gradient: "from-sky-400/10",
      border: "border-sky-400/30",
      tag_color: "text-sky-600 bg-sky-50",
    },
    {
      title: "Handle the Cabinet With Care",
      tag: "Equipment",
      img: hitImg,
      body: "The buttons and slider are precision components built for responsiveness — not force. Slamming wears them down, leads to missed inputs, and shortens the cabinet's lifespan. A well-maintained machine means fewer technical issues and a consistently good experience for the whole community.",
      gradient: "from-yellow-300/10",
      border: "border-yellow-400/30",
      tag_color: "text-yellow-700 bg-yellow-50",
    },
    {
      title: "Keep the Vibe Positive",
      tag: "Community",
      img: vibeImg,
      body: "This community spans a wide range of skill levels, from complete beginners to veterans. Avoid unsolicited criticism or score commentary. If you want to share tips, ask first — not everyone wants coaching mid-session. Being encouraging costs nothing and makes the space better for everyone, yourself included.",
      gradient: "from-fuchsia-400/10",
      border: "border-fuchsia-400/30",
      tag_color: "text-fuchsia-600 bg-fuchsia-50",
    },
  ];

export default function RulesPage() {
  return (
    <PageWrapper>
      <PageCard color="pink" className="mb-12">
        <SectionHeader
          color="pink"
          sub="These guidelines are here to keep the cabinet in good shape and the community welcoming — for regulars and first-timers alike."
        >
          Arcade Guidelines
        </SectionHeader>

        <div className="mt-10 flex flex-col gap-10">
          {rules.map((r) => (
            <div
              key={r.title}
              className={`relative overflow-hidden rounded-2xl border ${r.border} bg-white/80`}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${r.gradient} to-transparent`}
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center">
                {/* Image — left side, full aspect ratio preserved (784×642) */}
                <div className="sm:w-[30%] flex-shrink-0 p-4 sm:p-5">
                  <Image
                    src={r.img}
                    alt={r.title}
                    width={784}
                    height={642}
                    className="w-full h-auto rounded-xl"
                  />
                </div>

                {/* Content — right side */}
                <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-8">
                  <span
                    className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${r.tag_color} mb-3 w-fit`}
                  >
                    {r.tag}
                  </span>
                  <h2 className="text-2xl font-bold tracking-tight text-[#2f2461]">
                    {r.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#2f2461]/60">
                    {r.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-[#2f2461]/40 leading-6">
          Questions or concerns? Reach out to any organizer or drop a message in
          the community group.
        </p>
      </PageCard>
    </PageWrapper>
  );
}
