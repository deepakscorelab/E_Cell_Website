"use client";

import { useEffect, useRef } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { observeMotionActivity } from "../motionActivity";
import HeroMorph from "./HeroMorph";
import RegistrationSpark from "./RegistrationSpark";
import { useSiteIntro } from "../SiteIntro";
import {
  BASE,
  EVENT_DATES,
  REGISTER_URL,
  VENUE,
  asset,
} from "@/context/E-Summit-27/constants";

export default function Hero() {
  const { phase, completeMorph } = useSiteIntro();
  const heroRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    return observeMotionActivity(hero, active => { hero.dataset.motionPaused = String(!active); });
  }, []);

  return (
    <section ref={heroRef} className="e27-hero" aria-labelledby="e27-hero-title">
      {/* ---------- content ---------- */}
      <HeroMorph active={phase === "morph"} onComplete={completeMorph}>
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 pb-44 pt-32 text-center sm:pb-40 lg:pb-36">

        <div className="e27-hero-flame mb-6" aria-hidden="true">
          <div>
            <div className="e27-flame-glow">
              <img
                data-morph-image
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

        {/* Original artwork remains the final sharp, accessible content. */}
        <div className="mt-2 e27-dot-wordmark">
          <img data-morph-image src={asset("esummit27-wordmark.webp")}
            alt="E-Summit 27 — Igniting the Unwritten" width={1218} height={219}
            fetchPriority="high" decoding="async" />
        </div>

        <div className="mt-7 e27-hero-meta">
          <span>
            <CalendarDays size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            <span data-morph-text>{EVENT_DATES}</span>
          </span>
          <span>
            <MapPin size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            <span data-morph-text>{VENUE}</span>
          </span>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <RegistrationSpark href={REGISTER_URL} />
          <a data-morph-control href={`${BASE}#events`} className="e27-btn e27-btn-ghost">
            <span data-morph-text>Explore Events</span>
          </a>
        </div>

      </div>
      </HeroMorph>
    </section>
  );
}
