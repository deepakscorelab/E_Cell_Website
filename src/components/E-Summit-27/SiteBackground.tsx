"use client";

import { useEffect, useRef } from "react";
import SiteCubes from "./SiteCubes";
import { observeMotionActivity } from "./motionActivity";
import { asset } from "@/context/E-Summit-27/constants";

/** One fixed backdrop persists behind every section and every 2027 route. */
export default function SiteBackground() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    return observeMotionActivity(element, active => {
      element.dataset.motionPaused = String(!active);
    });
  }, []);

  return (
    <div ref={host} className="e27-site-background" aria-hidden="true">
      <div className="e27-ambient-layer">
        <SiteCubes />
        <div className="e27-floor-wrap">
          <div className="e27-floor"><div className="e27-floor-track" /></div>
        </div>
        <div className="e27-horizon" />
      </div>
      <div className="e27-site-artwork">
        <img
          src={asset("campus-transparent-v2.webp")}
          alt=""
          width={1672}
          height={941}
          decoding="async"
          fetchPriority="high"
        />
      </div>
    </div>
  );
}
