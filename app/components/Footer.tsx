import Image from "next/image";
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
  // { href: "https://github.com/myjian/", label: "Ming-yuen Jien (bookmarklets)" },
  // { href: "https://arcade-songs.zetaraku.dev/maimai/", label: "zetaraku.dev (arcade song list)" },
  // { href: "https://github.com/rama-adi", label: "Rama Adi (motivates)" },
];

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-[#12051a]/80">
      <Image
        src="/assets/images/3d_star_small.png"
        alt=""
        width={48}
        height={48}
        className="pointer-events-none absolute left-5 top-5 opacity-75"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Image
              src="/assets/images/Logo 04.png"
              alt="DMMC community logo"
              width={180}
              height={70}
              className="h-auto w-32 sm:w-36"
            />
            <Image
              src="/assets/images/kv_logo_pc.png"
              alt="maimai game logo"
              width={300}
              height={150}
              className="h-auto w-36 sm:w-44"
            />
          </div>
          <p className="max-w-md text-sm text-white/70">
            Denpasar Maimai Community is your local rhythm game circle for
            events, score sharing, and arcade vibes.
          </p>
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} DMMC
          </p>
        </div>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#ffb6ef]">
            Quick Link
          </h3>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 hover:text-[#ff4fd8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#9ce4ff]">
            Menu
          </h3>
          <ul className="mt-4 space-y-2">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/80 hover:text-[#ff4fd8]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#c8ffd7]">
            Thanks To
          </h3>
          <ul className="mt-4 space-y-2">
            {thanksLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-white/80 hover:text-[#ff4fd8]"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="text-sm text-white/80">DMMC</li>
            <li className="text-sm text-white/80">DMMC Scammers</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/25">
        <div className="mx-auto flex w-full max-w-6xl text-center flex-col gap-4 px-4 py-5 text-xs text-white/70 sm:px-6 lg:px-8">
          <p>
            {/* Author of This Project:{" "}
            <a
              href="https://github.com/radityaIch/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white/90 hover:text-[#ff4fd8]"
            >
              JW:5173(Vite)
            </a> */}
            DMMC is an unofficial, fan-made community project and is not
            affiliated with or endorsed by SEGA.
          </p>
        </div>
      </div>
    </footer>
  );
}
