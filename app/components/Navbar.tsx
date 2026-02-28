"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

import { GlowButton } from "./GlowButton";

const InstallAppButton = dynamic(
  () => import("./InstallAppButton").then((m) => m.InstallAppButton),
  { ssr: false },
);

interface NavbarProps {
  preloadedUser: Preloaded<typeof api.handlers.auth.getCurrentUser>;
}

export function Navbar({ preloadedUser }: NavbarProps) {
  const user = usePreloadedAuthQuery(preloadedUser);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Desktop auth button
  const AuthButton = user ? (
    <Link
      href="/dashboard"
      className="rounded-full border border-[#ff4fd8]/40 bg-[#ff4fd8]/10 px-4 py-1.5 text-sm font-bold text-[#ff4fd8] hover:bg-[#ff4fd8]/20 transition-colors"
    >
      Dashboard
    </Link>
  ) : (
    <Link
      href="/auth"
      className="rounded-full border border-[#2f2461]/30 bg-[#2f2461]/5 px-4 py-1.5 text-sm font-bold text-[#2f2461]/80 hover:bg-[#2f2461]/10 hover:text-[#2f2461] transition-colors"
    >
      Sign In
    </Link>
  );

  // Mobile auth block
  const MobileAuthBlock = user ? (
    <Link
      href="/dashboard"
      onClick={() => setOpen(false)}
      className="block rounded-xl border border-[#ff4fd8]/30 bg-[#ff4fd8]/10 px-4 py-3 text-sm font-semibold text-[#ff4fd8] hover:bg-[#ff4fd8]/20"
    >
      Dashboard
    </Link>
  ) : (
    <Link
      href="/auth"
      onClick={() => setOpen(false)}
      className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
    >
      Sign In
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 px-2 pt-3 sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-[#ff4fd8]/35 bg-white/88 px-4 py-3 shadow-[0_10px_28px_rgba(255,79,216,0.25)] backdrop-blur">
        <Link href="/" className="group inline-flex items-center gap-3">
          <Image src="/assets/images/Logo 04.png" alt="DMMC" width={280} height={109} className="lg:h-10 w-auto h-20" />
          <span className="hidden text-sm font-semibold tracking-wide text-[#2f2461]/85 group-hover:text-[#2f2461] sm:block">
            Denpasar Maimai Community
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-bold text-[#2f2461]/75 lg:flex">
          <Link className="hover:text-[#ff4fd8]" href="/">Home</Link>
          <Link className="hover:text-[#ff4fd8]" href="/events">Events</Link>
          <Link className="hover:text-[#ff4fd8]" href="/songs">Songs</Link>
          <Link className="hover:text-[#ff4fd8]" href="/tournament">Tournament</Link>
          <Link className="hover:text-[#ff4fd8]" href="/about">About</Link>
          <Link className="hover:text-[#ff4fd8]" href="/rules">Rules</Link>
          {AuthButton}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ff4fd8]/35 bg-white text-[#2f2461]/80 hover:bg-[#ffd8f3] hover:text-[#2f2461] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="block h-4 w-5">
              <span className="block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.25 block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.25 block h-0.5 w-full rounded bg-current" />
            </span>
          </button>
          <InstallAppButton />
          <GlowButton href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p" variant="pink" className="px-4 py-2 text-sm">
            Join WhatsApp
          </GlowButton>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex h-dvh w-full flex-col bg-[#17061f]/95 shadow-[0_0_0_1px_rgba(255,79,216,0.25),0_0_50px_rgba(0,0,0,0.75)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="text-sm font-black tracking-widest text-white">DMMC</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 overflow-auto px-5 py-4">
              <div className="space-y-2">
                <Link href="/" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">Home</Link>
                <Link href="/events" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">Events</Link>
                <Link href="/songs" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">Songs</Link>
                <Link href="/tournament" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">Tournament</Link>
                <Link href="/about" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">About</Link>
                <Link href="/rules" onClick={() => setOpen(false)} className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10">Rules</Link>
                {MobileAuthBlock}
              </div>
            </nav>

            <div className="border-t border-white/10 px-5 py-4">
              <div className="flex flex-col gap-2">
                <InstallAppButton />
                <GlowButton href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p" variant="pink" className="w-full">
                  Join WhatsApp
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
