"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";
import Link from "next/link";
import { PageCard } from "@/app/components/PageCard";
import { PageWrapper } from "@/app/components/PageWrapper";
import { SectionHeader } from "@/app/components/SectionHeader";

interface DashboardClientProps {
    preloadedUser: Preloaded<typeof api.handlers.auth.getCurrentUser>;
}

export function DashboardClient({ preloadedUser }: DashboardClientProps) {
    const user = usePreloadedAuthQuery(preloadedUser);

    if (!user) return null;

    return (
        <PageWrapper>
            <PageCard color="pink">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4 justify-center">
                    {user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={user.image}
                            alt={user.name ?? "Avatar"}
                            className="h-14 w-14 rounded-full border-2 border-[#f472b6]/40 object-cover"
                        />
                    ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-pink-300/40 bg-pink-50 text-xl font-black text-[#e11d79]">
                            {(user.name ?? "?")[0].toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-700">
                            {user.name ?? "Player"}
                        </h1>
                        <p className="text-sm text-slate-400">{user.email ?? ""}</p>
                    </div>
                </div>

                <SectionHeader color="pink">My Dashboard</SectionHeader>

                {/* Cards grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <DashCard title="My Scores" description="View and manage your score history." href="/my-score" />
                    <DashCard title="Songs" description="Browse the full song catalogue." href="/songs" />
                    <DashCard title="Events" description="Upcoming tournaments and meetups." href="/events" />
                    <DashCard title="My Events" description="Create and manage your own community events." href="/dashboard/events" />
                </div>
            </PageCard>
        </PageWrapper>
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
            className="group flex flex-col gap-2 rounded-2xl border border-pink-200/30 bg-white/80 p-5 shadow-[0_2px_8px_rgba(244,114,182,0.06)] transition-all duration-150 hover:-translate-y-0.5 hover:border-pink-300/40 hover:shadow-[0_6px_20px_rgba(244,114,182,0.12)]"
        >
            <span className="text-base font-bold text-slate-700 transition-colors group-hover:text-[#e11d79]">
                {title}
            </span>
            <span className="text-sm text-slate-400">{description}</span>
        </Link>
    );
}
