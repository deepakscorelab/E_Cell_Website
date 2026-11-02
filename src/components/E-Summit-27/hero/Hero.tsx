"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { observeMotionActivity } from "../motionActivity";
import FlamePanel from "./FlamePanel";
import DotMorphWordmark from "./DotMorphWordmark";
import {
  BASE,
  EVENT_DATES,
  REGISTER_URL,
  VENUE,
  asset,
} from "@/context/E-Summit-27/constants";

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    return observeMotionActivity(hero, active => { hero.dataset.motionPaused = String(!active); });
  }, []);

  return (
    <section ref={heroRef} className="e27-hero" aria-labelledby="e27-hero-title">
      {/* Original moving tile floor, layered over the shared cube background. */}
      <div className="e27-floor-wrap" aria-hidden="true">
        <div className="e27-floor"><div className="e27-floor-track" /></div>
      </div>
      <div className="e27-horizon" aria-hidden="true" />
      <FlamePanel side="left" />
      <FlamePanel side="right" />
      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 pb-44 pt-32 text-center sm:pb-40 lg:pb-36">

        <div className="e27-hero-flame mb-6" aria-hidden="true">
          <div className="e27-ignite">
            <div className="e27-flame-glow">
              <img
                src={asset("flame-logo.webp")}
                alt=""
                width={347}
                height={551}
                decoding="async"
                className="e27-flame-float h-[24vh] max-h-[280px] min-h-[150px] w-auto"
              />
            </div>
          </div>
        </div>

        <h1 id="e27-hero-title" className="sr-only">
          E-Summit&apos;27 — Igniting the Unwritten
        </h1>

        {/* Dots form the original wordmark, then the sharp source artwork takes over. */}
        <div className="mt-2">
          <DotMorphWordmark
            src={asset("esummit27-wordmark.webp")}
            alt="E-Summit 27 — Igniting the Unwritten"
          />
        </div>

        <div className="e27-rise e27-delay-3 mt-7 e27-hero-meta">
          <span>
            <CalendarDays size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            {EVENT_DATES}
          </span>
          <span>
            <MapPin size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            {VENUE}
          </span>
        </div>

        <div className="e27-rise e27-delay-4 mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={REGISTER_URL} className="e27-btn e27-btn-primary">
            Register Now <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a href={`${BASE}#events`} className="e27-btn e27-btn-ghost">
            Explore Events
          </a>
        </div>

      </div>
    </section>
  );
}
