"use client";

import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import Link, { LinkProps } from "next/link";
import React from "react";

interface TransitionLinkProps extends React.PropsWithChildren<LinkProps> {
  className?: string;
  href: string;
}

export function TransitionLink({ children, href, className, ...props }: TransitionLinkProps) {
  const router = useRouter();
  const currentPath = usePathname();

  const handleTransition = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (currentPath === href) return;
    e.preventDefault();

    const overlay = document.getElementById("page-transition-overlay");
    const overlayLogo = document.getElementById("page-transition-logo");

    if (overlay && overlayLogo) {
      const tl = gsap.timeline({
        onComplete: () => {
          router.push(href);
        }
      });

      tl.set(overlay, { transformOrigin: "bottom", top: "auto", bottom: 0 })
        .to(overlay, { height: "100%", duration: 0.6, ease: "power4.inOut" })
        .to(overlayLogo, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, "-=0.2");

    } else {
      router.push(href);
    }
  };

  return (
    <Link {...props} href={href} onClick={handleTransition} className={className}>
      {children}
    </Link>
  );
}
