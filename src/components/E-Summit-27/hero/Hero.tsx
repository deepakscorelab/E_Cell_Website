"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { observeMotionActivity } from "../motionActivity";
import {
  BASE,
  EVENT_DATES,
  INSTITUTE_EN,
  INSTITUTE_HI,
  REGISTER_URL,
  VENUE,
  asset,
} from "@/context/E-Summit-27/constants";

const Cubes = dynamic(() => import("./Cubes"), { ssr: false });

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [cubesOn, setCubesOn] = useState(false);

  // Keep GPU initialization out of the entrance animation's critical path.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const deadline = performance.now() + 1900;
    let timeout = 0;
    let idle = 0;
    const cancel = () => {
      clearTimeout(timeout);
      if (idle) window.cancelIdleCallback?.(idle);
      timeout = idle = 0;
    };
    const stop = observeMotionActivity(hero, (active) => {
      hero.dataset.motionPaused = String(!active);
      cancel();
      if (!active) return;
      timeout = window.setTimeout(() => {
        const mount = () => setCubesOn(true);
        if (window.requestIdleCallback) idle = window.requestIdleCallback(mount, { timeout: 1000 });
        else mount();
      }, Math.max(0, deadline - performance.now()));
    });
    return () => { cancel(); stop(); };
  }, []);

  return (
    <section ref={heroRef} className="e27-hero" aria-labelledby="e27-hero-title">
      <div className="e27-cubes-stage" aria-hidden="true">
        <div className="e27-cubes-fallback" />
        {cubesOn && <Cubes
          gridSize={14}
          gap={0.22}
          faceColor="#170728"
          edgeColor="#9030f0"
          rippleColor="#d070f0"
          edgeWidth={1.2}
          shading={0.8}
          radius={3.5}
          maxAngle={35}
          speed={0.7}
          bounce={0.25}
          brush={0.45}
          intro={true}
          className="e27-cubes-field"
        />}
        <div className="e27-cubes-vignette" />
      </div>

      {/* ---------- corner logos (like the brochure cover) ---------- */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 mx-auto flex max-w-7xl items-start justify-between px-4 sm:px-6 lg:px-8">
        <img
          src={asset("ecell-logo.webp")}
          alt="E-Cell IIT Ropar"
          width={140}
          height={56}
          decoding="async"
          className="e27-rise h-9 w-auto opacity-90 sm:h-12"
        />
        <img
          src={asset("tbif-logo.webp")}
          alt="TBIF IIT Ropar"
          width={140}
          height={56}
          decoding="async"
          className="e27-rise h-9 w-auto opacity-90 sm:h-12"
        />
      </div>

      {/* ---------- content ---------- */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 pb-10 pt-40 text-center">

        <h1 id="e27-hero-title" className="sr-only">
          E-Summit&apos;27 — Igniting the Unwritten
        </h1>

        {/* The wordmark image already contains the "IGNITING THE UNWRITTEN" tagline. */}
        <div className="mt-2">
          <div className="e27-sweep e27-rise e27-delay-1">
            <img
              src={asset("esummit27-wordmark.webp")}
              alt="E-Summit 27 — Igniting the Unwritten"
              width={1218}
              height={219}
              fetchPriority="high"
              decoding="async"
              className="h-auto w-[min(88vw,620px)]"
            />
          </div>
        </div>

        <p className="e27-rise e27-delay-2 mt-6 text-[11px] font-medium tracking-[0.22em] text-white/70 sm:text-xs">
          {INSTITUTE_EN}
          <span className="mt-1 block tracking-[0.1em]">{INSTITUTE_HI}</span>
        </p>

        <div className="e27-rise e27-delay-3 mt-7 flex flex-wrap items-center justify-center gap-3 text-sm text-white/85">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--e27-line)] bg-[#050008]/60 px-4 py-2">
            <CalendarDays size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            {EVENT_DATES}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--e27-line)] bg-[#050008]/60 px-4 py-2">
            <MapPin size={16} className="text-[var(--e27-magenta)]" aria-hidden="true" />
            {VENUE}
          </span>
        </div>

        <div className="e27-rise e27-delay-4 mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={REGISTER_URL} className="e27-btn e27-btn-primary">
            Register Now <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href={`${BASE}/events`} className="e27-btn e27-btn-ghost">
            Explore Events
          </Link>
        </div>
        <div className="e27-hero-flame mt-8" aria-hidden="true">
          <div className="e27-ignite">
            <div className="e27-flame-glow">
              <img
                src={asset("flame-logo.webp")}
                alt=""
                width={347}
                height={551}
                decoding="async"
                className="e27-flame-float h-[22svh] max-h-[200px] min-h-[120px] w-auto"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}