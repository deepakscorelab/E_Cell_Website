"use client";

import { useEffect, useRef } from "react";
import { observeMotionActivity } from "../motionActivity";
import { asset } from "@/context/E-Summit-27/constants";

export default function TeamHero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeMotionActivity(el, (active) => { el.dataset.motionPaused = String(!active); });
  }, []);
  return (
    <section ref={ref} aria-labelledby="e27t-hero-title" className="e27t-hero px-4 pb-20 pt-28 sm:px-6 sm:pb-28 lg:px-8">
      {/* static CSS composition — no canvas */}
      <div className="e27t-hero-glow" aria-hidden="true" />
      <img
        src={asset("flame-logo.webp")}
        alt=""
        aria-hidden="true"
        width={347}
        height={551}
        decoding="async"
        className="e27t-hero-flame"
      />

      <div className="mx-auto flex min-h-[62vh] max-w-4xl flex-col items-center justify-center text-center">
        <p className="e27-label e27-rise">Meet the team behind E-Summit&apos;27</p>

        <h1
          id="e27t-hero-title"
          className="e27-heading e27-rise e27-delay-1 mt-6 text-[3.4rem] min-[400px]:text-6xl sm:text-8xl lg:text-9xl"
        >
          Our <span className="text-white">Team</span>
        </h1>

        <p className="e27-rise e27-delay-2 mt-6">
          <span className="e27-accent text-sm font-medium uppercase tracking-[0.4em] sm:text-base">
            Igniting the unwritten
          </span>
        </p>

        <p className="e27-rise e27-delay-3 mt-6 max-w-xl text-base leading-7 text-[var(--e27-muted)] sm:text-lg">
          A student-led team that turns a campus into a launchpad, bringing founders, investors and bold ideas into one
          room. Every talk, stall and late-night pitch you see is built by the people below.
        </p>
      </div>
    </section>
  );
}