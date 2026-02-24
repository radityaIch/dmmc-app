"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

import { GlowButton } from "./GlowButton";

const InstallAppButton = dynamic(
  () => import("./InstallAppButton").then((m) => m.InstallAppButton),
  { ssr: false },
);

export function Navbar() {
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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="relative grid h-10 w-10 place-items-center rounded-full bg-white/5 ring-1 ring-white/10">
            <div className="absolute inset-0 rounded-full shadow-[0_0_0_1px_rgba(57,183,255,0.35),0_0_18px_rgba(255,79,216,0.22)]" />
            <span className="relative text-sm font-black tracking-widest text-white">
              DMMC
            </span>
          </div>
          <span className="hidden text-sm font-semibold tracking-wide text-white/80 group-hover:text-white sm:block">
            Denpasar Maimai Community
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-white/75 md:flex">
          <Link className="hover:text-white" href="/">
            Home
          </Link>
          <Link className="hover:text-white" href="/events">
            Events
          </Link>
          <Link className="hover:text-white" href="/songs">
            Songs
          </Link>
          <Link className="hover:text-white" href="/tournament">
            Tournament
          </Link>
          <Link className="hover:text-white" href="/about">
            About
          </Link>
          <Link className="hover:text-white" href="/rules">
            Rules
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span className="block h-4 w-5">
              <span className="block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.25 block h-0.5 w-full rounded bg-current" />
              <span className="mt-1.25 block h-0.5 w-full rounded bg-current" />
            </span>
          </button>
          <InstallAppButton />
          <GlowButton href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p" variant="green" className="px-4 py-2 text-sm">
            Join WhatsApp
          </GlowButton>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />

          <div className="relative flex h-dvh w-full flex-col bg-[#05050a]/95 shadow-[0_0_0_1px_rgba(57,183,255,0.18),0_0_50px_rgba(0,0,0,0.75)]">
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
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Home
                </Link>
                <Link
                  href="/events"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Events
                </Link>
                <Link
                  href="/songs"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Songs
                </Link>
                <Link
                  href="/tournament"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Tournament
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  About
                </Link>
                <Link
                  href="/rules"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                >
                  Rules
                </Link>
              </div>
            </nav>

            <div className="border-t border-white/10 px-5 py-4">
              <div className="flex flex-col gap-2">
                <InstallAppButton />
                <GlowButton href="https://chat.whatsapp.com/KuYiYLO2OxgIY3EEQLCt7p" variant="green" className="w-full">
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
