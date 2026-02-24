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
  manifest: "/manifest.json",
  themeColor: "#FF4FD8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-dvh bg-[#05050a] text-white antialiased`}
      >
        <PwaRegister />
        <ArcadeBackground />
        <Navbar />
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(57,183,255,0.18),transparent_70%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
