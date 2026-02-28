type PageCardColor = "pink" | "yellow" | "blue" | "green";

const colorMap: Record<PageCardColor, string> = {
  pink: "border-[#ff4fd8]/30 shadow-[0_8px_32px_rgba(255,79,216,0.18)]",
  yellow: "border-[#ffbb33]/30 shadow-[0_8px_32px_rgba(255,187,51,0.18)]",
  blue: "border-[#39b7ff]/30 shadow-[0_8px_32px_rgba(57,183,255,0.18)]",
  green: "border-[#2cb869]/30 shadow-[0_8px_32px_rgba(44,184,105,0.18)]",
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
      className={`bg-white/90 backdrop-blur-xl rounded-3xl border ${colorMap[color]} p-8 md:p-10 w-full${className ? " " + className : ""}`}
    >
      {children}
    </div>
  );
}
