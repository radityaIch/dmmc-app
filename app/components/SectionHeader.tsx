type SectionHeaderColor = "pink" | "yellow" | "blue" | "green";

const accentMap: Record<SectionHeaderColor, string> = {
  pink: "bg-[#ff4fd8]/30",
  yellow: "bg-[#ffbb33]/30",
  blue: "bg-[#39b7ff]/30",
  green: "bg-[#2cb869]/30",
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
  return (
    <div className={`flex flex-col items-center gap-3 mb-6${className ? " " + className : ""}`}>
      <div className="flex items-center gap-3 w-full justify-center">
        <div className={`h-px flex-1 max-w-12 ${accent}`} />
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#2f2461] tracking-wide text-center">
          {children}
        </h2>
        <div className={`h-px flex-1 max-w-12 ${accent}`} />
      </div>
      {sub && (
        <p className="text-[#2f2461]/70 font-medium text-center max-w-xl">{sub}</p>
      )}
    </div>
  );
}
