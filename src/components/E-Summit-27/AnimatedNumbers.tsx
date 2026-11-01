"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { observeMotionActivity } from "./motionActivity";
import { FrameClock } from "./hero/firePerformance";

/** One animation clock for the entire group, with no per-frame React renders. */
export default function AnimatedNumbers({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const numbers = Array.from(el.querySelectorAll<HTMLElement>("[data-count-to]")).map((node) => ({
      node, value: Number(node.dataset.countTo), previous: -1,
    }));
    const format = new Intl.NumberFormat("en-IN");
    const clock = new FrameClock(30);
    let raf = 0;
    let elapsed = 0;
    let done = false;
    const write = (progress: number) => {
      for (const item of numbers) {
        const value = Math.round(item.value * progress);
        if (value !== item.previous) {
          item.node.textContent = format.format(value);
          item.previous = value;
        }
      }
    };
    const finish = () => {
      done = true;
      cancelAnimationFrame(raf);
      raf = 0;
      write(1);
    };
    const frame = (now: number) => {
      const delta = clock.advance(now);
      if (delta !== null) {
        elapsed += Math.min(delta, 100);
        if (elapsed >= 2000) { finish(); return; }
        write(1 - Math.pow(1 - elapsed / 2000, 3));
      }
      raf = requestAnimationFrame(frame);
    };
    write(0);
    const stopObserving = observeMotionActivity(el, (active) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (active && !done) { clock.reset(); raf = requestAnimationFrame(frame); }
    }, "0px 0px -80px 0px");
    const onPreference = () => { if (reduce.matches) finish(); };
    reduce.addEventListener("change", onPreference);
    return () => {
      cancelAnimationFrame(raf);
      stopObserving();
      reduce.removeEventListener("change", onPreference);
    };
  }, []);
  return <ul ref={ref} className={className}>{children}</ul>;
}
