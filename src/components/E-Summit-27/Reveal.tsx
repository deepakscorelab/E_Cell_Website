"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Native reveal-once; server-rendered content stays readable without JavaScript. */
export default function Reveal({ children, className = "", delay = 0, y = 24 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || el.getBoundingClientRect().top < window.innerHeight - 80) return;
    el.dataset.revealPending = "true";
    const show = () => {
      delete el.dataset.revealPending;
      observer.disconnect();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) show();
    }, { rootMargin: "0px 0px -80px 0px" });
    const onPreference = () => { if (reduce.matches) show(); };
    observer.observe(el);
    reduce.addEventListener("change", onPreference);
    // Keyboard navigation must never land inside visually hidden content.
    el.addEventListener("focusin", show);
    return () => {
      observer.disconnect();
      reduce.removeEventListener("change", onPreference);
      el.removeEventListener("focusin", show);
      delete el.dataset.revealPending;
    };
  }, []);
  return (
    <div ref={ref} className={`e27-reveal ${className}`} style={{
      "--e27-reveal-y": `${y}px`, "--e27-reveal-delay": `${delay}s`,
    } as CSSProperties}>
      {children}
    </div>
  );
}
