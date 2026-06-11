"use client";

import Script from "next/script";

export function ElfsightInstagram() {
  return (
    <>
      <Script
        src="https://elfsightcdn.com/platform.js"
        strategy="afterInteractive"
      />
      <div
        className="elfsight-app-bd4ae3bf-1d37-4357-8590-9ae5c3a165e0"
        data-elfsight-app-lazy
      />
    </>
  );
}
