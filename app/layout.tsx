import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "./components/Navbar";
import { ArcadeBackground } from "./components/ArcadeBackground";
import { PwaRegister } from "./components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DMMC — Denpasar Maimai Community",
  description:
    "Denpasar’s home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
  themeColor: "#FF4FD8",
  openGraph: {
    title: "DMMC — Denpasar Maimai Community",
    description:
      "Denpasar’s home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
    images: ["/assets/images/meta-og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DMMC — Denpasar Maimai Community",
    description:
      "Denpasar’s home for maimai players — arcade meetups, high scores, and rhythm game vibes.",
    images: ["/assets/images/meta-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="DMMC" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[#17061f] text-white antialiased`}
      >
        <PwaRegister />
        <ArcadeBackground />
        <Navbar />
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
