"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BASE } from "@/context/E-Summit-27/constants";

type Phase = "prepare" | "pillars" | "morph" | "background" | "complete";
const IntroContext = createContext({
  phase: "complete" as Phase,
  ambientEnabled: true,
  ambientDelay: 1900,
  completeMorph: () => {},
});
export const useSiteIntro = () => useContext(IntroContext);

/** A single finite entrance owns timing; routes and all controls remain usable. */
export default function SiteIntro({ children, className }: { children: ReactNode; className: string }) {
  const pathname = usePathname();
  const hostRef = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);
  const completed = useRef(pathname !== BASE);
  const [phase, setPhase] = useState<Phase>(pathname === BASE ? "prepare" : "complete");
  const finishMorphRef = useRef(() => {});
  const completeMorph = useCallback(() => finishMorphRef.current(), []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (completed.current || firstPath.current !== BASE || pathname !== BASE) {
      completed.current = true;
      host.dataset.intro = "complete";
      setPhase("complete");
      return;
    }

    let disposed = false;
    let current: Phase = "prepare";
    const isPhase = (value: Phase) => current === value;
    let drop: Animation | undefined;
    const timers = new Set<number>();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const later = (callback: () => void, delay: number) => {
      const id = window.setTimeout(() => { timers.delete(id); if (!disposed) callback(); }, delay);
      timers.add(id);
      return id;
    };
    const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };
    const show = (next: Phase) => {
      if (disposed) return;
      current = next;
      host.dataset.intro = next;
      setPhase(next);
    };
    const finish = () => {
      if (disposed || current === "complete") return;
      completed.current = true;
      clearTimers();
      drop?.cancel();
      show("complete");
    };
    const onScroll = () => { if (window.scrollY > 24) finish(); };
    const onVisibility = () => { if (document.hidden) finish(); };
    const onPreference = () => { if (reduce.matches) finish(); };
    const onInteraction = (event: Event) => {
      if ((event.target as Element | null)?.closest("a, button, input, select, textarea")) finish();
    };
    const onResize = () => finish();
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) finish(); };
    finishMorphRef.current = () => {
      if (current !== "morph" || disposed) return;
      show("background");
      later(finish, 650);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("hashchange", finish);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onPreference);
    host.addEventListener("focusin", onInteraction);
    host.addEventListener("pointerdown", onInteraction);

    const start = async () => {
      if (reduce.matches || document.hidden || window.scrollY > 24 || window.location.hash) {
        finish();
        return;
      }
      // A slow/missing asset never leaves content behind an indefinite intro.
      later(finish, 5500);
      const artwork = host.querySelector<HTMLElement>(".e27-site-artwork");
      const images = Array.from(host.querySelectorAll<HTMLImageElement>(".e27-site-artwork img, .e27-hero [data-morph-image]"));
      const ready = Promise.allSettled([document.fonts.ready, ...images.map(image => image.decode())]);
      let readyDeadline = 0;
      await Promise.race([ready, new Promise<void>(resolve => { readyDeadline = later(resolve, 1200); })]);
      clearTimeout(readyDeadline);
      timers.delete(readyDeadline);
      if (disposed || !isPhase("prepare")) return;
      if (!artwork || !images.length || images.some(image => !image.complete || !image.naturalWidth)) {
        finish();
        return;
      }
      show("pillars");
      try {
        // Transform the artwork only; its image keeps the existing bottom/center anchor.
        drop = artwork.animate([
          { transform: "translate3d(0, -105vh, 0)", offset: 0, easing: "cubic-bezier(.42,0,.8,.5)" },
          { transform: "translate3d(0, 0, 0)", offset: 0.60, easing: "cubic-bezier(.2,.65,.35,1)" },
          { transform: "translate3d(0, -42px, 0)", offset: 0.76, easing: "cubic-bezier(.5,0,.8,.4)" },
          { transform: "translate3d(0, 0, 0)", offset: 0.89, easing: "ease-out" },
          { transform: "translate3d(0, -10px, 0)", offset: 0.95, easing: "ease-in" },
          { transform: "translate3d(0, 0, 0)", offset: 1 },
        ], { duration: 1200, fill: "both" });
        await drop.finished;
        if (!disposed && isPhase("pillars")) {
          drop.cancel();
          show("morph");
        }
      } catch { if (!disposed) finish(); }
    };
    void start();
    return () => {
      disposed = true;
      clearTimers();
      drop?.cancel();
      finishMorphRef.current = () => {};
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("hashchange", finish);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onPreference);
      host.removeEventListener("focusin", onInteraction);
      host.removeEventListener("pointerdown", onInteraction);
    };
  }, [pathname]);

  const ambientEnabled = phase === "background" || phase === "complete";
  return <IntroContext.Provider value={{ phase, ambientEnabled, ambientDelay: firstPath.current === BASE ? 0 : 1900, completeMorph }}>
    <div ref={hostRef} className={className} data-intro={phase}>
      <noscript><style>{`.e27-root[data-intro] .e27-site-artwork,.e27-root[data-intro] .e27-hero-morph-content,.e27-root[data-intro] .e27-ambient-layer,.e27-root[data-intro] .e27-site-lightning,.e27-root[data-intro] .e27-fire-panel{opacity:1!important}.e27-root[data-intro] .e27-site-artwork{transform:none!important}.e27-hero-morph-canvas{display:none!important}@media(max-width:640px){.e27-root[data-intro] .e27-fire-panel{opacity:.75!important}}`}</style></noscript>
      {children}
    </div>
  </IntroContext.Provider>;
}
