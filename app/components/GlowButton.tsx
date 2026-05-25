import Link from "next/link";

type GlowButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "green" | "pink" | "blue" | "gold";
  className?: string;
  onClick?: () => void;
};

const variantClasses: Record<NonNullable<GlowButtonProps["variant"]>, string> = {
  green:
    "bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.4),0_4px_16px_rgba(52,211,153,0.25)] hover:shadow-[0_0_0_1px_rgba(52,211,153,0.6),0_4px_24px_rgba(52,211,153,0.35)]",
  pink:
    "bg-gradient-to-b from-pink-400 to-pink-500 text-white shadow-[0_0_0_1px_rgba(244,114,182,0.4),0_4px_16px_rgba(244,114,182,0.25)] hover:shadow-[0_0_0_1px_rgba(244,114,182,0.6),0_4px_24px_rgba(244,114,182,0.35)]",
  blue:
    "bg-gradient-to-b from-cyan-400 to-cyan-500 text-white shadow-[0_0_0_1px_rgba(6,182,212,0.4),0_4px_16px_rgba(6,182,212,0.25)] hover:shadow-[0_0_0_1px_rgba(6,182,212,0.6),0_4px_24px_rgba(6,182,212,0.35)]",
  gold:
    "bg-gradient-to-b from-amber-400 to-amber-500 text-white shadow-[0_0_0_1px_rgba(251,191,36,0.4),0_4px_16px_rgba(251,191,36,0.25)] hover:shadow-[0_0_0_1px_rgba(251,191,36,0.6),0_4px_24px_rgba(251,191,36,0.35)]",
};

export function GlowButton({
  href,
  children,
  variant = "pink",
  className,
  onClick,
}: GlowButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-bold tracking-wide transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 " +
        variantClasses[variant] +
        (className ? " " + className : "")
      }
    >
      {children}
    </Link>
  );
}
