export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(57,183,255,0.18),transparent_55%),radial-gradient(circle_at_30%_70%,rgba(255,79,216,0.16),transparent_50%),radial-gradient(circle_at_80%_65%,rgba(41,255,138,0.12),transparent_52%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[22px_22px] opacity-40" />
      <div className="absolute -top-24 left-1/2 h-130 w-130 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(57,183,255,0.20),0_0_55px_rgba(57,183,255,0.10)]" />
      <div className="absolute -top-10 left-1/2 h-90 w-90 -translate-x-1/2 rounded-full border border-fuchsia-300/10 shadow-[0_0_0_1px_rgba(255,79,216,0.18),0_0_55px_rgba(255,79,216,0.10)]" />
      <div className="absolute -top-2 left-1/2 h-55 w-55 -translate-x-1/2 rounded-full border border-emerald-300/10 shadow-[0_0_0_1px_rgba(41,255,138,0.18),0_0_45px_rgba(41,255,138,0.10)]" />
    </div>
  );
}
