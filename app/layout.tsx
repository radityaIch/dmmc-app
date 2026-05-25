import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

import { Navbar } from "./components/Navbar";
import { ArcadeBackground } from "./components/ArcadeBackground";
import { Footer } from "./components/Footer";
import { PwaRegister } from "./components/PwaRegister";
import { ConvexClientProvider } from "@/app/components/ConvexClientProvider";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getToken, preloadAuthQuery } from "./lib/auth/server";
import { api } from "@/convex/_generated/api";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const viewport = {
  themeColor: "#f472b6",
};

export const metadata: Metadata = {
  title: "DMMC — Denpasar Maimai Community",
  description:
    "Denpasar's home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
  metadataBase: new URL("https://dmmc.app"),
  openGraph: {
    title: "DMMC — Denpasar Maimai Community",
    description:
      "Denpasar's home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
    images: ["/assets/images/meta-og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMMC — Denpasar Maimai Community",
    description:
      "Denpasar's home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
    images: ["/assets/images/meta-og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  const preloadedUser = await preloadAuthQuery(api.handlers.auth.getCurrentUser);
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="DMMC" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-sans bg-gradient-to-br from-pink-100 via-[#fff0f5] to-cyan-100 min-h-screen text-slate-700 antialiased selection:bg-pink-300 selection:text-white" suppressHydrationWarning>
        <ConvexClientProvider initialToken={token}>
          <PwaRegister />
          <ArcadeBackground />
          <SmoothScroll>
            <div
              id="page-transition-overlay"
              className="fixed inset-x-0 bottom-0 h-0 bg-pink-400 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
            >
              <img
                id="page-transition-logo"
                src="/assets/images/Logo 04.png"
                alt="DMMC"
                className="h-16 md:h-20 w-auto opacity-0 scale-75 drop-shadow-lg"
              />
            </div>
            <Navbar preloadedUser={preloadedUser} />
            <div className="relative">
              {children}
            </div>
            <Footer />
          </SmoothScroll>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
