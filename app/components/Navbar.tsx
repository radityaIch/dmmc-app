"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

import { TransitionLink } from "@/components/transition-link";
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

  const AuthButton = user ? (
    <Link
      href="/dashboard"
      className="rounded-full border border-pink-400/30 bg-pink-400/10 px-4 py-1.5 text-sm font-bold text-pink-500 hover:bg-pink-400/20 transition-colors"
    >
      Dashboard
    </Link>
  ) : (
    <Link
      href="/auth"
      className="rounded-full border border-slate-300/50 bg-slate-100/50 px-4 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200/50 transition-colors"
    >
      Sign In
    </Link>
  );

  const MobileAuthBlock = user ? (
    <Link
      href="/dashboard"
      onClick={() => setOpen(false)}
      className="block rounded-xl border border-pink-400/30 bg-pink-400/10 px-4 py-3 text-sm font-semibold text-pink-500 hover:bg-pink-400/20"
    >
      Dashboard
    </Link>
  ) : (
    <Link
      href="/auth"
      onClick={() => setOpen(false)}
      className="block rounded-xl border border-slate-300/30 bg-slate-100/30 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200/40"
    >
      Sign In
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 px-2 pt-3 sm:px-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border-4 border-white/60 bg-white/80 px-4 py-3 shadow-[0_10px_28px_rgba(244,114,182,0.2)] backdrop-blur-lg">
        <TransitionLink href="/" className="group inline-flex items-center gap-3">
          <Image src="/assets/images/Logo 04.png" alt="DMMC" width={200} height={78} className="h-12 w-auto md:h-9" />
          <span className="hidden text-sm font-semibold tracking-wide text-slate-600 group-hover:text-pink-500 sm:block transition-colors">
            Denpasar Maimai Community
          </span>
        </TransitionLink>

        <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 lg:flex">
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/">Home</TransitionLink>
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/events">Events</TransitionLink>
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/songs">Songs</TransitionLink>
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/tournament">Tournament</TransitionLink>
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/about">About</TransitionLink>
          <TransitionLink className="hover:text-pink-500 transition-colors" href="/rules">Rules</TransitionLink>
          {AuthButton}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-pink-400/30 bg-white text-slate-600 hover:bg-pink-100 hover:text-pink-500 lg:hidden transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="block h-4 w-5">
              <span className="block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.5 block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.5 block h-0.5 w-full rounded bg-current" />
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

          <div className="relative flex h-dvh w-full flex-col bg-white/95 shadow-[0_0_0_1px_rgba(244,114,182,0.25),0_0_50px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between gap-3 border-b border-pink-200/50 px-5 py-4">
              <div className="text-sm font-black tracking-widest text-pink-500">DMMC</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-pink-300/50 bg-pink-50 px-3 py-2 text-xs font-semibold text-pink-500 hover:bg-pink-100"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 overflow-auto px-5 py-4">
              <div className="space-y-2">
                <TransitionLink href="/" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">Home</TransitionLink>
                <TransitionLink href="/events" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">Events</TransitionLink>
                <TransitionLink href="/songs" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">Songs</TransitionLink>
                <TransitionLink href="/tournament" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">Tournament</TransitionLink>
                <TransitionLink href="/about" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">About</TransitionLink>
                <TransitionLink href="/rules" onClick={() => setOpen(false)} className="block rounded-xl border border-pink-200/50 bg-pink-50/50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-pink-100/50">Rules</TransitionLink>
                {MobileAuthBlock}
              </div>
            </nav>

            <div className="border-t border-pink-200/50 px-5 py-4">
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
