"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";
import Link from "next/link";

interface DashboardClientProps {
    preloadedUser: Preloaded<typeof api.auth.getCurrentUser>;
}

export function DashboardClient({ preloadedUser }: DashboardClientProps) {
    const user = usePreloadedAuthQuery(preloadedUser);

    if (!user) return null;

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={user.image}
                        alt={user.name ?? "Avatar"}
                        className="h-14 w-14 rounded-full border-2 border-[#ff4fd8]/40 object-cover"
                    />
                ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#ff4fd8]/40 bg-white/5 text-xl font-black text-[#ff4fd8]">
                        {(user.name ?? "?")[0].toUpperCase()}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        {user.name ?? "Player"}
                    </h1>
                    <p className="text-sm text-white/50">{user.email ?? ""}</p>
                </div>
            </div>

            {/* Cards grid — add more items here */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashCard title="My Scores" description="View and manage your score history." href="/my-score" />
                <DashCard title="Songs" description="Browse the full song catalogue." href="/songs" />
                <DashCard title="Events" description="Upcoming tournaments and meetups." href="/events" />
            </div>
        </div>
    );
}

function DashCard({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#ff4fd8]/30 hover:bg-white/8 hover:shadow-[0_0_24px_rgba(255,79,216,0.12)]"
        >
            <span className="text-base font-bold text-white transition-colors group-hover:text-[#ff4fd8]">
                {title}
            </span>
            <span className="text-sm text-white/55">{description}</span>
        </Link>
    );
}
