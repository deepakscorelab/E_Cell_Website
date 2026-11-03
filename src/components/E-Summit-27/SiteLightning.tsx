"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { observeMotionActivity } from "./motionActivity";
import { useSiteIntro } from "./SiteIntro";

const Lightning = dynamic(() => import("./hero/Lightning"), { ssr: false });

/** One transparent renderer behind the campus artwork, shared by all 2027 routes. */
export default function SiteLightning() {
  const { ambientEnabled, ambientDelay } = useSiteIntro();
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element || !ambientEnabled || mounted) return;
    const deadline = performance.now() + ambientDelay;
    let timer = 0;
    let idle = 0;
    let disposed = false;
    const cancel = () => {
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
    };
    const stop = observeMotionActivity(element, active => {
      cancel();
      if (!active) return;
      timer = window.setTimeout(() => {
        const mount = () => { if (!disposed) setMounted(true); };
        if (window.requestIdleCallback) idle = window.requestIdleCallback(mount, { timeout: 300 });
        else mount();
      }, Math.max(0, deadline - performance.now()));
    });
    return () => { disposed = true; cancel(); stop(); };
  }, [ambientEnabled, ambientDelay, mounted]);

  return (
    <div ref={host} className="e27-site-lightning" aria-hidden="true">
      <svg className="e27-lightning-fallback" viewBox="0 0 1600 1000" preserveAspectRatio="none" focusable="false">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path className="e27-lightning-fallback-glow" d="M430 0 390 155 438 220 370 350 415 430 350 585 395 650 328 805 375 1000 M1170 0 1210 155 1162 220 1230 350 1185 430 1250 585 1205 650 1272 805 1225 1000" />
          <path d="M430 0 390 155 438 220 370 350 415 430 350 585 395 650 328 805 375 1000 M1170 0 1210 155 1162 220 1230 350 1185 430 1250 585 1205 650 1272 805 1225 1000" />
          <path opacity=".45" d="M370 350 300 410 320 480 255 550 M395 650 470 710 445 755 510 820 M1230 350 1300 410 1280 480 1345 550 M1205 650 1130 710 1155 755 1090 820" />
        </g>
      </svg>
      {mounted && <Lightning color="#b840f9" bolts={2} spread={1.2} branches={0.35}
        thickness={0.65} glow={0.65} intensity={0.8} speed={0.45} flicker={0.12}
        opacity={0.7} clickStrike className="e27-lightning-field" />}
    </div>
  );
}
