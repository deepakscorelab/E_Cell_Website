"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import FireCanvasLoader from "./FireCanvasLoader";
import { observeMotionActivity } from "../motionActivity";

/** The original moving fire, separate from the E-shaped brand logo above. */
export default function FlamePanel() {
  const host = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const failed = useRef(false);
  const onReady = useCallback(() => setReady(true), []);
  const onDisable = useCallback(() => {
    failed.current = true;
    setMounted(false);
    setReady(false);
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const deadline = performance.now() + 2000;
    let timer = 0;
    let idle = 0;
    const cancel = () => {
      clearTimeout(timer);
      if (idle) window.cancelIdleCallback?.(idle);
      timer = idle = 0;
    };
    const stop = observeMotionActivity(element, (active) => {
      cancel();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMounted(false);
        setReady(false);
      }
      if (!active || failed.current) return;
      timer = window.setTimeout(() => {
        const mount = () => setMounted(true);
        if (window.requestIdleCallback) idle = window.requestIdleCallback(mount, { timeout: 1000 });
        else mount();
      }, Math.max(0, deadline - performance.now()));
    });
    return () => { cancel(); stop(); };
  }, []);

  return (
    <div ref={host} className="e27-fire-panel" aria-hidden="true">
      <div className="e27-fire-poster" />
      <div className="e27-fire-scene" data-ready={ready}>
        {/* Use the existing compact 30 fps / 350k-pixel tier alongside Cubes. */}
        {mounted && <FireCanvasLoader pointer={pointer} mobile={true} onReady={onReady} onDisable={onDisable} />}
      </div>
    </div>
  );
}
