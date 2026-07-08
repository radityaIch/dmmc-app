"use client";

import Link from "next/link";
import { authClient } from "@/app/lib/auth/client";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

export default function AuthPage() {
    const signIn = async () => {
        await authClient.signIn.oauth2({
            providerId: "whatsapp",
        });
    };

    return (
        <PageWrapper>
            <PageCard color="blue" className="mx-auto max-w-md mb-12">
                <div className="flex items-center justify-between gap-4 mb-4">
                    <SectionHeader color="blue" className="mb-0 flex-1">Sign In</SectionHeader>
                    <Link
                        href="/"
                        className="shrink-0 rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-3 py-1 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
                    >
                        Back
                    </Link>
                </div>

                <p className="mb-6 text-center text-sm font-medium leading-6 text-[#2f2461]/70">
                    Sign in with WhatsApp to continue.
                </p>

                <button
                    id="whatsapp-signin-btn"
                    type="button"
                    onClick={signIn}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-3 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(37,211,102,0.55),0_0_24px_rgba(37,211,102,0.25)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(37,211,102,0.75),0_0_34px_rgba(37,211,102,0.45)] active:translate-y-0"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-5 w-5"
                        aria-hidden="true"
                    >
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.34 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.46 17.51 2 12.04 2Zm0 18.16h-.01a8.22 8.22 0 0 1-4.19-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.18 8.18 0 0 1-1.25-4.38c0-4.54 3.7-8.24 8.25-8.24a8.25 8.25 0 0 1 0 16.49Zm4.52-6.17c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.96-.14.17-.29.19-.53.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
                    </svg>
                    Sign in with WhatsApp
                </button>
            </PageCard>
        </PageWrapper>
    );
}
