"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageCard } from "../components/PageCard";
import { PageWrapper } from "../components/PageWrapper";
import { SectionHeader } from "../components/SectionHeader";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <PageWrapper>
      <PageCard color="blue" className="mx-auto max-w-md mb-12">
        <div className="mb-4 flex items-center justify-between gap-4">
          <SectionHeader color="blue" className="mb-0 flex-1">Admin Login</SectionHeader>
          <Link
            href="/"
            className="shrink-0 rounded-full border border-[#2f2461]/20 bg-[#2f2461]/5 px-3 py-1 text-xs font-semibold text-[#2f2461]/70 hover:bg-[#2f2461]/10 hover:text-[#2f2461]"
          >
            Back
          </Link>
        </div>

        <p className="mb-6 text-center text-sm font-medium leading-6 text-[#2f2461]/70">
          This is a simple UI gate for now. Authentication will be wired later.
        </p>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/admin/dashboard");
          }}
        >
          <label className="block">
            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">EMAIL</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@dmmc.local"
              className="mt-2 w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-[#39b7ff]/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold tracking-widest text-[#2f2461]/60">PASSWORD</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-[#2f2461]/20 bg-white/80 px-4 py-3 text-sm text-[#2f2461] placeholder:text-[#2f2461]/30 outline-none ring-1 ring-transparent focus:ring-[#ff4fd8]/40"
            />
          </label>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full rounded-full bg-[linear-gradient(180deg,#39b7ff,#168bff)] px-6 py-3 text-base font-semibold text-black shadow-[0_0_0_1px_rgba(57,183,255,0.55),0_0_24px_rgba(57,183,255,0.25)] transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(57,183,255,0.75),0_0_34px_rgba(57,183,255,0.45)] active:translate-y-0"
            >
              Sign In
            </button>
          </div>
        </form>
      </PageCard>
    </PageWrapper>
  );
}
