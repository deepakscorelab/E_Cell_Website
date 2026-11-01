"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { observeMotionActivity } from "./motionActivity";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  label: string;
};

/**
 * Pure-CSS marquee: the content is rendered twice and the track moves by translateX(-50%).
 * JS only toggles data-paused when the marquee is off-screen (IntersectionObserver).
 * Hover / focus pause is handled in e27.css.
 */
export default function Marquee({ children, duration = 40, reverse = false, className = "", label }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeMotionActivity(el, (active) => {
      el.dataset.paused = String(!active);
    }, "100px");
  }, []);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      data-paused="true"
      className={`e27-marquee ${reverse ? "e27-marquee--reverse" : ""} ${className}`}
      style={{ "--e27-marquee-dur": `${duration}s` } as CSSProperties}
    >
      <div className="e27-marquee-track">
        <div className="flex shrink-0 gap-5 pr-5">{children}</div>
        {/* duplicate for the seamless loop — hidden from assistive tech and focus */}
        <div className="flex shrink-0 gap-5 pr-5" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  );
}