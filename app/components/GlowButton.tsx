import Link from "next/link";

type GlowButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "green" | "pink" | "blue";
  className?: string;
  onClick?: () => void;
};

const variantClasses: Record<NonNullable<GlowButtonProps["variant"]>, string> = {
  green:
    "bg-[linear-gradient(180deg,#29ff8a,#0bd66a)] text-black shadow-[0_0_0_1px_rgba(41,255,138,0.5),0_0_24px_rgba(41,255,138,0.35)] hover:shadow-[0_0_0_1px_rgba(41,255,138,0.7),0_0_34px_rgba(41,255,138,0.55)]",
  pink:
    "bg-[linear-gradient(180deg,#ff4fd8,#ff2fb1)] text-black shadow-[0_0_0_1px_rgba(255,79,216,0.5),0_0_24px_rgba(255,79,216,0.35)] hover:shadow-[0_0_0_1px_rgba(255,79,216,0.7),0_0_34px_rgba(255,79,216,0.55)]",
  blue:
    "bg-[linear-gradient(180deg,#39b7ff,#168bff)] text-black shadow-[0_0_0_1px_rgba(57,183,255,0.5),0_0_24px_rgba(57,183,255,0.35)] hover:shadow-[0_0_0_1px_rgba(57,183,255,0.7),0_0_34px_rgba(57,183,255,0.55)]",
};

export function GlowButton({
  href,
  children,
  variant = "green",
  className,
  onClick,
}: GlowButtonProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={
        "inline-flex text-white items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold tracking-wide transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 " +
        variantClasses[variant] +
        (className ? " " + className : "")
      }
    >
      {children}
    </Link>
  );
}
