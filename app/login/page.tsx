"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-black tracking-tight text-white">Admin Login</h1>
          <Link
            href="/"
            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/75 hover:bg-black/40 hover:text-white"
          >
            Back
          </Link>
        </div>

        <p className="mt-2 text-sm leading-6 text-white/70">
          This is a simple UI gate for now. Authentication will be wired later.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/admin/dashboard");
          }}
        >
          <label className="block">
            <span className="text-xs font-bold tracking-widest text-white/70">EMAIL</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="admin@dmmc.local"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none ring-1 ring-transparent focus:ring-sky-400/40"
            />
          </label>

          <label className="block">
            <span className="text-xs font-bold tracking-widest text-white/70">PASSWORD</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none ring-1 ring-transparent focus:ring-fuchsia-400/40"
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
      </div>
    </div>
  );
}
