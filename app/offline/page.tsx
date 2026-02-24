import Link from "next/link";

import { GlowButton } from "../components/GlowButton";

export default function OfflinePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 ring-1 ring-white/10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold tracking-wider text-white/80">
          <span className="h-2 w-2 rounded-full bg-yellow-300 shadow-[0_0_16px_rgba(255,230,90,0.55)]" />
          OFFLINE MODE
        </div>

        <h1 className="mt-6 text-balance text-3xl font-black leading-tight tracking-tight text-white">
          You&apos;re offline — but the vibe is still on.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/70">
          Some pages may be available from cache. Reconnect to refresh events and content.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <GlowButton href="/" variant="green" className="w-full sm:w-auto">
            Back to Home
          </GlowButton>
          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Try Events
          </Link>
        </div>
      </div>
    </div>
  );
}
