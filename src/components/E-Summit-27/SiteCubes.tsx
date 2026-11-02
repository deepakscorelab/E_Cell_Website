"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { observeMotionActivity } from "./motionActivity";
import { useSiteIntro } from "./SiteIntro";

const Cubes = dynamic(() => import("./hero/Cubes"), { ssr: false });

/** One persistent, viewport-sized renderer shared by every 2027 page. */
export default function SiteCubes() {
  const { ambientEnabled, ambientDelay } = useSiteIntro();
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = host.current;
    if (!el || !ambientEnabled) return;
    const deadline = performance.now() + ambientDelay;
    let timer = 0;
    let idle = 0;
    const cancel = () => {
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
    };
    const stop = observeMotionActivity(el, (active) => {
      cancel();
      if (!active) return;
      timer = window.setTimeout(() => {
        const mount = () => setMounted(true);
        if (window.requestIdleCallback) idle = window.requestIdleCallback(mount, { timeout: 300 });
        else mount();
      }, Math.max(0, deadline - performance.now()));
    });
    return () => { cancel(); stop(); };
  }, [ambientEnabled, ambientDelay]);
  return (
    <div ref={host} className="e27-site-cubes" aria-hidden="true">
      <div className="e27-cubes-fallback" />
      {mounted && <Cubes gridSize={14} gap={0.22} faceColor="#170728" edgeColor="#9030f0"
        rippleColor="#d070f0" edgeWidth={0.9} shading={0.8} radius={3.5} maxAngle={24}
        speed={0.7} bounce={0.25} brush={0.45} className="e27-cubes-field" />}
    </div>
  );
}
