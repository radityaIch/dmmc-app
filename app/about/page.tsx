import { Camera } from "lucide-react";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";
import { ElfsightInstagram } from "../components/ElfsightInstagram";

export default function AboutPage() {
  return (
    <PageWrapper>
      <PageCard color="pink">
        <SectionHeader color="pink">About DMMC</SectionHeader>
        <p className="mx-auto max-w-3xl text-center font-medium leading-relaxed text-slate-500 md:text-lg">
          We are a passionate collective of rhythm game enthusiasts based right here in Denpasar, Bali.
          Brought together by the flashing lights and high-BPM beats of maimai, DMMC was created to
          connect local players of all skill levels. We are an independent community with no official
          partnership. We know that grinding for that SSS+ rank is always better with friends cheering
          you on.
        </p>
      </PageCard>

      <PageCard color="pink" className="mb-12">
        <div className="relative">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 select-none">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-200/60 bg-pink-50/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-pink-400 backdrop-blur-sm">
              <Camera className="h-3.5 w-3.5" /> Instagram
            </span>
          </div>

          <SectionHeader color="pink">Follow Our Journey</SectionHeader>

          <p className="mx-auto mb-8 max-w-xl text-center text-sm font-medium leading-relaxed text-slate-500">
            Catch arcade highlights, tournament brackets, meetup selfies, and the chaos between songs.
            Tag <span className="font-bold text-pink-500">@dmmc.official</span> to get featured on our page.
          </p>

          <div className="mx-auto max-w-2xl">
            <ElfsightInstagram />
          </div>
        </div>
      </PageCard>

      <PageCard color="blue" className="mb-12">
        <SectionHeader color="blue">Notice &amp; Terms</SectionHeader>
        <div className="mx-auto max-w-3xl space-y-3 text-sm font-medium leading-7 text-slate-500">
          <p>
            DMMC is an unofficial, fan-made community project and is not affiliated with or endorsed by
            SEGA.
          </p>
          <p>
            All rights to maimai logos, official artwork, and related assets belong to SEGA and their
            respective owners. We do not claim ownership of official assets used on this site (I do not
            own / credit to official art).
          </p>
          <p>If any rights holder requests edits or takedown, we will comply as soon as possible.</p>
          <p>
            Takedown contact:{" "}
            <a
              href="mailto:ichinomiya.mori@gmail.com"
              className="font-bold text-[#f472b6] hover:underline"
            >
              ichinomiya.mori@gmail.com
            </a>
          </p>
        </div>
      </PageCard>
    </PageWrapper>
  );
}
