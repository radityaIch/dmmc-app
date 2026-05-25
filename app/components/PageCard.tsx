type PageCardColor = "pink" | "yellow" | "blue" | "green";

const colorMap: Record<PageCardColor, string> = {
  pink: "border-pink-300/40 shadow-[0_8px_32px_rgba(244,114,182,0.12)]",
  yellow: "border-amber-300/40 shadow-[0_8px_32px_rgba(251,191,36,0.12)]",
  blue: "border-cyan-300/40 shadow-[0_8px_32px_rgba(6,182,212,0.12)]",
  green: "border-emerald-300/40 shadow-[0_8px_32px_rgba(52,211,153,0.12)]",
};

export function PageCard({
  children,
  color = "pink",
  className,
}: {
  children: React.ReactNode;
  color?: PageCardColor;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl rounded-[2.5rem] border-4 ${colorMap[color]} p-8 md:p-10 w-full${className ? " " + className : ""}`}
    >
      {children}
    </div>
  );
}
