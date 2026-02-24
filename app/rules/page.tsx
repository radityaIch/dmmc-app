const rules = [
  {
    title: "Glove Up! 🧤",
    body: "For safety and the cabinet’s health, always wear gloves to prevent friction burns and keep the screen clean.",
    accent: "from-emerald-400/25 to-transparent",
  },
  {
    title: "The 'Antre' (Queue) System",
    body: "Respect local queueing culture. Put your token down to mark your spot. No marathon sessions if others are waiting!",
    accent: "from-sky-400/25 to-transparent",
  },
  {
    title: "Respect the Cab",
    body: "Don’t 'slam' the buttons too hard. Broken buttons mean nobody gets to play.",
    accent: "from-yellow-300/25 to-transparent",
  },
  {
    title: "Good Vibes Only",
    body: "No gatekeeping over scores. Everyone started at Level 1. Celebrate personal bests, big or small!",
    accent: "from-fuchsia-400/25 to-transparent",
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
        DMMC: Golden Rules of the Circular Screen
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
        Keep the arcade fun, fair, and hype for everyone.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {rules.map((r) => (
          <div
            key={r.title}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 ring-1 ring-white/10"
          >
            <div
              className={
                "pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)]"
              }
            />
            <div
              className={
                "pointer-events-none absolute inset-0 bg-gradient-to-b " + r.accent
              }
            />
            <div className="relative">
              <h2 className="text-base font-bold tracking-tight text-white">{r.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">{r.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
