"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import FireCanvasLoader from "./FireCanvasLoader";
import { observeMotionActivity } from "../motionActivity";
import { FrameClock } from "./firePerformance";
import type { PointerTarget } from "./FireCanvas";
import {
  BASE,
  EVENT_DATES,
  INSTITUTE_EN,
  INSTITUTE_HI,
  REGISTER_URL,
  VENUE,
  asset,
} from "@/context/E-Summit-27/constants";

/** Decide once, on the client, whether the WebGL canvas may run at all. */
function canRunCanvas(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((navigator.hardwareConcurrency ?? 4) <= 2) return false;
  return true;
}

const depth = (d: number) => ({ "--d": d }) as CSSProperties;

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const pointer = useRef<PointerTarget>({ x: 0, y: 0 });
  const [canvasOn, setCanvasOn] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const canvasFailed = useRef(false);

  /* Let the CSS entry sequence finish before downloading / compiling WebGL. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const deadline = performance.now() + 2000;
    let idleId = 0;
    let timeoutId = 0;
    let active = false;
    let mounted = false;
    const cancel = () => {
      clearTimeout(timeoutId);
      if (idleId) window.cancelIdleCallback?.(idleId);
      timeoutId = idleId = 0;
    };
    const mount = () => {
      idleId = 0;
      if (!active || mounted || canvasFailed.current || !canRunCanvas()) return;
      mounted = true;
      setMobile(window.matchMedia("(pointer: coarse), (max-width: 767px)").matches);
      setCanvasOn(true);
    };
    const stopObserving = observeMotionActivity(hero, (next) => {
      active = next;
      cancel();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        mounted = false;
        setCanvasOn(false);
        setCanvasReady(false);
      }
      if (!active || mounted || canvasFailed.current || !canRunCanvas()) return;
      timeoutId = window.setTimeout(() => {
        timeoutId = 0;
        if (window.requestIdleCallback) idleId = window.requestIdleCallback(mount, { timeout: 1000 });
        else mount();
      }, Math.max(0, deadline - performance.now()));
    });
    return () => { cancel(); stopObserving(); };
  }, []);

  /* Sleep completely off-screen; pointer events only record the latest position. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const clock = new FrameClock(coarse ? 30 : 60);
    const cur = { x: 0, y: 0 };
    let raf = 0;
    let active = false;
    let time = 0;
    let pending: { x: number; y: number } | null = null;
    const write = () => {
      hero.style.setProperty("--px", cur.x.toFixed(3));
      hero.style.setProperty("--py", cur.y.toFixed(3));
    };
    const step = (now: number) => {
      raf = 0;
      if (!active) return;
      const raw = clock.advance(now);
      if (raw === null) { raf = requestAnimationFrame(step); return; }
      const dt = Math.min(raw, 50);
      if (coarse) {
        time += dt / 1000;
        cur.x = Math.sin(time * 0.35) * 0.5;
        cur.y = Math.cos(time * 0.27) * 0.35;
        pointer.current.x = cur.x;
        pointer.current.y = cur.y;
      } else {
        if (pending) {
          const r = hero.getBoundingClientRect();
          pointer.current.x = ((pending.x - r.left) / Math.max(1, r.width)) * 2 - 1;
          pointer.current.y = ((pending.y - r.top) / Math.max(1, r.height)) * 2 - 1;
          pending = null;
        }
        const k = 1 - Math.exp(-dt / 200);
        cur.x += (pointer.current.x - cur.x) * k;
        cur.y += (pointer.current.y - cur.y) * k;
      }
      write();
      if (coarse || Math.abs(pointer.current.x - cur.x) > 0.001 || Math.abs(pointer.current.y - cur.y) > 0.001) {
        raf = requestAnimationFrame(step);
      }
    };
    const wake = () => {
      if (active && !raf) { clock.reset(); raf = requestAnimationFrame(step); }
    };
    const stopObserving = observeMotionActivity(hero, (next) => {
      active = next;
      hero.dataset.motionPaused = String(!active);
      if (active) wake();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
        pending = null;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          pointer.current.x = pointer.current.y = cur.x = cur.y = 0;
          write();
        }
      }
    });
    const onMove = (event: PointerEvent) => {
      if (coarse || !active) return;
      pending = { x: event.clientX, y: event.clientY };
      wake();
    };
    const onLeave = () => {
      if (coarse) return;
      pending = null;
      pointer.current.x = pointer.current.y = 0;
      wake();
    };
    hero.addEventListener("pointermove", onMove, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      stopObserving();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleReady = useCallback(() => setCanvasReady(true), []);
  const handleDisable = useCallback(() => {
    canvasFailed.current = true;
    setCanvasReady(false);
    setCanvasOn(false); // unmount → full dispose; static poster remains
  }, []);

  return (
    <section ref={heroRef} className="e27-hero" aria-labelledby="e27-hero-title">
      {/* ---------- 3D stage (decorative) ---------- */}
      <div className="e27-stage" aria-hidden="true">
        <div className="e27-tilt">
          <div className="e27-glow" />

          <div className="e27-floor-wrap">
            <div className="e27-floor">
              <div className="e27-floor-track" />
            </div>
            <div className="e27-floor-fade" />
          </div>
          <div className="e27-horizon" />

          <div className="e27-canvas-layer" data-ready={canvasReady}>
            {canvasOn && (
              <FireCanvasLoader
                pointer={pointer}
                mobile={mobile}
                onReady={handleReady}
                onDisable={handleDisable}
              />
            )}
          </div>

          <div className="e27-bloom" />
        </div>
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
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-4 pb-16 pt-32 text-center">
        <div className="e27-depth" style={depth(14)}>
          <div className="e27-ignite">
            <div className="e27-flame-glow">
              <img
                src={asset("flame-logo.webp")}
                alt=""
                width={347}
                height={551}
                fetchPriority="high"
                decoding="async"
                className="e27-flame-float h-[24vh] max-h-[280px] min-h-[150px] w-auto"
              />
            </div>
          </div>
        </div>

        <h1 id="e27-hero-title" className="sr-only">
          E-Summit&apos;27 — Igniting the Unwritten
        </h1>

        {/* The wordmark image already contains the "IGNITING THE UNWRITTEN" tagline. */}
        <div className="e27-depth mt-6" style={depth(8)}>
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
      </div>
    </section>
  );
}