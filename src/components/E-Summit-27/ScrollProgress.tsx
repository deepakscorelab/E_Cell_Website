"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Decorative reading progress, with no scrolling interception or idle loop. */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports("animation-timeline: scroll(root block)")) return;
    const element = ref.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.hidden || reduce.matches) return;
      const root = document.documentElement;
      const range = root.scrollHeight - root.clientHeight;
      const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
      element.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame && !document.hidden && !reduce.matches) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.documentElement);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    reduce.addEventListener("change", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      reduce.removeEventListener("change", schedule);
    };
  }, [pathname]);

  return <div ref={ref} className="e27-scroll-progress" aria-hidden="true" />;
}
