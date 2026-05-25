type SectionHeaderColor = "pink" | "yellow" | "blue" | "green";

const accentMap: Record<SectionHeaderColor, string> = {
  pink: "bg-pink-400/30",
  yellow: "bg-amber-400/30",
  blue: "bg-cyan-400/30",
  green: "bg-emerald-400/30",
};

const textMap: Record<SectionHeaderColor, string> = {
  pink: "text-pink-600",
  yellow: "text-amber-600",
  blue: "text-cyan-600",
  green: "text-emerald-600",
};

export function SectionHeader({
  children,
  color = "pink",
  sub,
  className,
}: {
  children: React.ReactNode;
  color?: SectionHeaderColor;
  sub?: string;
  className?: string;
}) {
  const accent = accentMap[color];
  const text = textMap[color];
  return (
    <div className={`flex flex-col items-center gap-3 mb-6${className ? " " + className : ""}`}>
      <div className="flex items-center gap-3 w-full justify-center">
        <div className={`h-1 flex-1 max-w-16 rounded-full ${accent}`} />
        <h2 className={`text-2xl md:text-3xl font-extrabold ${text} tracking-wide text-center`}>
          {children}
        </h2>
        <div className={`h-1 flex-1 max-w-16 rounded-full ${accent}`} />
      </div>
      {sub && (
        <p className="text-slate-500 font-medium text-center max-w-xl">{sub}</p>
      )}
    </div>
  );
}
