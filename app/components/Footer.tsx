import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/songs", label: "Songs" },
  { href: "/tournament", label: "Tournament" },
];

const menuLinks = [
  { href: "/about", label: "About" },
  { href: "/rules", label: "Rules" },
  { href: "/import-scores", label: "Import Scores" },
  { href: "/my-score", label: "My Score" },
];

const thanksLinks = [
  { href: "https://maimai.sega.com/", label: "SEGA" },
];

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-[#ff4fd8]/20 bg-white/80 backdrop-blur-xl">
      {/* Decorative star */}
      <div className="pointer-events-none absolute left-5 top-5 opacity-50 select-none">
        <img
          src="/assets/images/3d_star_small.png"
          alt=""
          width={40}
          height={40}
        />
      </div>

      {/* Main grid */}
      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:px-8">
        {/* Brand column */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <img
              src="/assets/images/Logo 04.png"
              alt="DMMC community logo"
              className="h-auto w-28 sm:w-32"
            />
            <img
              src="/assets/images/kv_logo_pc.png"
              alt="maimai DX logo"
              className="h-auto w-32 sm:w-40"
            />
          </div>
          <p className="max-w-md text-sm font-medium text-[#2f2461]/65 leading-relaxed">
            Denpasar Maimai Community is your local rhythm game circle for
            events, score sharing, and arcade vibes.
          </p>
          <p className="text-xs font-semibold text-[#2f2461]/40">
            © {new Date().getFullYear()} DMMC
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#ff4fd8]">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[#2f2461]/70 hover:text-[#ff4fd8] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Menu */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#39b7ff]">
            Menu
          </h3>
          <ul className="mt-4 space-y-2">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-[#2f2461]/70 hover:text-[#ff4fd8] transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Thanks */}
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#2cb869]">
            Thanks To
          </h3>
          <ul className="mt-4 space-y-2">
            {thanksLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-[#2f2461]/70 hover:text-[#ff4fd8] transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="text-sm font-medium text-[#2f2461]/70">DMMC</li>
            <li className="text-sm font-medium text-[#2f2461]/70">DMMC Scammers</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#ff4fd8]/15 bg-[#fdf0fb]/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-4 py-4 text-center text-xs text-[#2f2461]/50 sm:px-6 lg:px-8">
          <p>
            DMMC is an unofficial, fan-made community project and is not
            affiliated with or endorsed by SEGA.
          </p>
        </div>
      </div>
    </footer>
  );
}
