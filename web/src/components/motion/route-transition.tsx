"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "@/lib/gsap";

const COLS = 10;

/**
 * Sondaven-style route transition: a staggered column curtain wipes up over
 * the page, the route changes underneath, then the columns wipe away.
 *
 * Works by intercepting clicks on internal links (the site uses plain <a>
 * tags) and driving the navigation through router.push. Reduced-motion users
 * and modified clicks (cmd/ctrl/middle) keep native navigation.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);

  // wipe in on internal link clicks, then push the route
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/") || href.includes("#")) return;
      if (a.target && a.target !== "_self") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const url = new URL(href, location.origin);
      if (url.pathname === location.pathname) return;

      e.preventDefault();
      if (navigating.current) return;
      navigating.current = true;

      const overlay = overlayRef.current;
      if (!overlay) {
        router.push(href);
        return;
      }
      const cols = Array.from(overlay.children);
      overlay.style.display = "flex";
      overlay.style.pointerEvents = "all";
      gsap.fromTo(
        cols,
        { scaleY: 0, transformOrigin: "bottom" },
        {
          scaleY: 1,
          duration: 0.42,
          stagger: 0.028,
          ease: "power3.inOut",
          onComplete: () => router.push(href),
        }
      );
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // wipe out once the new route has committed
  useEffect(() => {
    if (!navigating.current) return;
    navigating.current = false;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const cols = Array.from(overlay.children);
    gsap.to(cols, {
      scaleY: 0,
      transformOrigin: "top",
      duration: 0.5,
      stagger: 0.028,
      ease: "power3.inOut",
      delay: 0.15,
      onComplete: () => {
        overlay.style.display = "none";
        overlay.style.pointerEvents = "none";
      },
    });
  }, [pathname]);

  return (
    <>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[150] hidden"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        {Array.from({ length: COLS }).map((_, i) => (
          <div
            key={i}
            className="h-full flex-1 bg-[oklch(0.068_0.008_27)]"
            // slight overlap hides subpixel seams between columns
            style={{ marginRight: i < COLS - 1 ? -1 : 0, transform: "scaleY(0)" }}
          />
        ))}
      </div>
    </>
  );
}
