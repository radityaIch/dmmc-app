export function ArcadeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#05050a]" />

      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full border border-white/5" />
        <div className="absolute -top-24 left-1/2 h-[720px] w-[720px] -translate-x-1/2 rounded-full border border-white/5" />
        <div className="absolute -top-10 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/5" />
      </div>

      <div className="absolute inset-0 opacity-80">
        <div className="absolute -top-64 left-1/2 h-[980px] w-[980px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_180deg,rgba(57,183,255,0.20),rgba(255,79,216,0.16),rgba(255,230,90,0.12),rgba(41,255,138,0.14),rgba(57,183,255,0.20))] blur-2xl animate-[spin_18s_linear_infinite]" />
        <div className="absolute -top-40 left-1/2 h-[760px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(57,183,255,0.18),transparent_62%)] blur-xl animate-[pulse_5s_ease-in-out_infinite]" />
        <div className="absolute top-20 left-[8%] h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,79,216,0.22),transparent_60%)] blur-xl animate-[floaty_6s_ease-in-out_infinite]" />
        <div className="absolute top-44 right-[10%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(41,255,138,0.18),transparent_60%)] blur-xl animate-[floaty_7.5s_ease-in-out_infinite]" />
      </div>

      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(rgba(255,255,255,0.10)_1px,transparent_1px)] bg-size-[24px_24px]" />
    </div>
  );
}
