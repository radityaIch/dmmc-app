import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

export default function AboutPage() {
  return (
    <PageWrapper>
      <PageCard color="pink">
        <SectionHeader color="pink">About DMMC</SectionHeader>
        <p className="mx-auto max-w-3xl text-center font-medium leading-relaxed text-[#2f2461]/75 md:text-lg">
          We are a passionate collective of rhythm game enthusiasts based right here in Denpasar, Bali.
          Brought together by the flashing lights and high-BPM beats of maimai, DMMC was created to
          connect local players of all skill levels. We are an independent community with no official
          partnership. We know that grinding for that SSS+ rank is always better with friends cheering
          you on.
        </p>
      </PageCard>

      <PageCard color="blue" className="mb-12">
        <SectionHeader color="blue">Notice &amp; Terms</SectionHeader>
        <div className="mx-auto max-w-3xl space-y-3 text-sm font-medium leading-7 text-[#2f2461]/75">
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
              className="font-bold text-[#ff4fd8] hover:underline"
            >
              ichinomiya.mori@gmail.com
            </a>
          </p>
        </div>
      </PageCard>
    </PageWrapper>
  );
}
