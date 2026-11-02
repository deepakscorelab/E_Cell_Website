"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import "./EventConstellation.css";

type Point = readonly [number, number];
type Symbol = { name: string; paths: string[]; points: Point[] };

const SYMBOLS: Record<string, Symbol> = {
  Flagship: {
    name: "rocket",
    paths: ["M40 6L51 20V36L40 46L29 36V20Z", "M29 28L18 41L29 38M51 28L62 41L51 38", "M35 49L40 58L45 49", "M35 24H45"],
    points: [[40, 6], [51, 20], [51, 36], [40, 46], [29, 36], [29, 20], [18, 41], [62, 41], [40, 58]],
  },
  Pitching: {
    name: "microphone",
    paths: ["M32 10H48V29L40 37L32 29Z", "M23 27V34L32 43H48L57 34V27", "M40 43V55M29 55H51"],
    points: [[32, 10], [48, 10], [48, 29], [40, 37], [32, 29], [23, 27], [57, 27], [40, 43], [40, 55], [29, 55], [51, 55]],
  },
  Build: {
    name: "code",
    paths: ["M27 15L14 32L27 49", "M53 15L66 32L53 49", "M45 12L35 52"],
    points: [[27, 15], [14, 32], [27, 49], [53, 15], [66, 32], [53, 49], [45, 12], [35, 52]],
  },
  Talks: {
    name: "conversation",
    paths: ["M16 12H64V42H39L27 53V42H16Z", "M26 24H54", "M26 32H43"],
    points: [[16, 12], [64, 12], [64, 42], [39, 42], [27, 53], [27, 42], [16, 42], [26, 24], [54, 24], [43, 32]],
  },
  Learn: {
    name: "pencil",
    paths: ["M22 44L17 57L30 52L63 19L55 11Z", "M22 44L30 52M49 17L57 25", "M39 52H64M39 58H53"],
    points: [[22, 44], [17, 57], [30, 52], [63, 19], [55, 11], [49, 17], [57, 25], [39, 52], [64, 52], [53, 58]],
  },
  Showcase: {
    name: "exhibition",
    paths: ["M14 8H33V27H14Z", "M47 8H66V27H47Z", "M14 37H33V56H14Z", "M47 37H66V56H47Z", "M33 17H47M33 46H47M23 27V37M57 27V37"],
    points: [[14, 8], [33, 8], [47, 8], [66, 8], [14, 27], [66, 27], [14, 37], [66, 37], [14, 56], [33, 56], [47, 56], [66, 56]],
  },
};

/** A small, finite SVG constellation; native event links remain the interaction. */
export default function EventConstellation({ category }: { category: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const symbol = SYMBOLS[category] ?? SYMBOLS.Showcase;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    let visible = false, played = false, timer = 0;
    const settle = () => {
      clearTimeout(timer);
      element.dataset.constellationPhase = "complete";
      played = true;
      observer.disconnect();
    };
    const begin = () => {
      if (played || !visible || document.hidden || reduce.matches) return;
      played = true;
      element.dataset.constellationPhase = "drawing";
      timer = window.setTimeout(settle, 1200);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) begin();
      else if (played) settle();
    }, { threshold: 0.2 });
    const onVisibility = () => {
      if (document.hidden && played) settle();
      else begin();
    };
    const onPreference = () => { if (reduce.matches) settle(); };
    // SSR and no-JS show the complete symbol. Only enhanced, offscreen icons wait.
    element.dataset.constellationPhase = "waiting";
    observer.observe(element.closest(".e27-event-card") ?? element);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onPreference);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onPreference);
      element.dataset.constellationPhase = "complete";
    };
  }, [category]);

  return <svg ref={ref} className="e27-event-constellation" viewBox="0 0 80 64"
    width="80" height="64" aria-hidden="true" focusable="false"
    data-constellation={symbol.name} data-constellation-phase="complete">
    {symbol.paths.map((path, i) => <path key={path} d={path} pathLength={1}
      className="e27-constellation-line" style={{ "--e27-constellation-delay": `${i * 42}ms` } as CSSProperties} />)}
    {symbol.points.map(([x, y], i) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2.1}
      className="e27-constellation-point" style={{ "--e27-constellation-delay": `${i * 28}ms` } as CSSProperties} />)}
  </svg>;
}
