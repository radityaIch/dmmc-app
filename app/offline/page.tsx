import Link from "next/link";

import { GlowButton } from "../components/GlowButton";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

export default function OfflinePage() {
  return (
    <PageWrapper>
      <PageCard color="yellow" className="mx-auto max-w-xl mb-12">
        <SectionHeader color="yellow">You&apos;re Offline</SectionHeader>

        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-[#fbbf24]/10 px-4 py-2 text-xs font-semibold tracking-wider text-slate-500">
            <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_16px_rgba(255,230,90,0.55)]" />
            OFFLINE MODE
          </div>
        </div>

        <p className="text-center font-medium text-slate-500 mb-8 leading-relaxed">
          Some pages may be available from cache. Reconnect to refresh events and content.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <GlowButton href="/" variant="green" className="sm:w-auto">
            Back to Home
          </GlowButton>
          <Link
            href="/events"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-200/50 hover:text-slate-700"
          >
            Try Events
          </Link>
        </div>
      </PageCard>
    </PageWrapper>
  );
}
