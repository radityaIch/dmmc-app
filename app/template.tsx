"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = document.getElementById("page-transition-overlay");
    const overlayLogo = document.getElementById("page-transition-logo");

    if (overlay && overlayLogo) {
      const tl = gsap.timeline();
      tl.to(overlayLogo, { opacity: 0, scale: 0.75, duration: 0.3, ease: "power2.in" })
        .set(overlay, { transformOrigin: "top", top: 0, bottom: "auto" })
        .to(overlay, { height: 0, duration: 0.7, ease: "power4.inOut" }, "-=0.1");
    }

    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, delay: 0.4, ease: "elastic.out(1, 0.8)" }
      );
    }
  }, []);

  return (
    <div ref={containerRef} className="opacity-0">
      {children}
    </div>
  );
}
