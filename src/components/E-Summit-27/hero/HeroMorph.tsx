"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { FrameClock } from "./firePerformance";

type Props = { children: ReactNode; active: boolean; onComplete: () => void };
type Point = { x: number; y: number; color: string };
type Dot = Point & { sx: number; sy: number; phase: number; delay: number };
type Group = { points: Point[]; rect: DOMRect; image: boolean };
const random = (seed: number) => { const n = Math.sin(seed * 12.9898) * 43758.5453; return n - Math.floor(n); };
const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Draw a text-only span using its actual self-hosted font and letter spacing. */
function paintText(context: CanvasRenderingContext2D, element: HTMLElement, width: number, height: number) {
  const text = element.textContent?.trim();
  if (!text) return;
  const style = getComputedStyle(element);
  context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  context.textBaseline = "alphabetic";
  context.fillStyle = style.color;
  // Dark CTA lettering needs a visible particle color until its solid button returns.
  if (element.closest(".e27-btn-primary")) context.fillStyle = "#ddc8ff";
  const metrics = context.measureText(text);
  const ascent = metrics.fontBoundingBoxAscent || metrics.actualBoundingBoxAscent;
  const descent = metrics.fontBoundingBoxDescent || metrics.actualBoundingBoxDescent;
  const baseline = (height - ascent - descent) / 2 + ascent;
  const spacing = Number.parseFloat(style.letterSpacing) || 0;
  const measuredWidth = metrics.width + Math.max(0, text.length - 1) * spacing;
  // Preserve fit at responsive sizes; the source text remains the final rendering.
  const scale = Math.min(1, width / Math.max(1, measuredWidth));
  context.save();
  context.scale(scale, 1);
  if (!spacing) context.fillText(text, 0, baseline);
  else {
    let x = 0;
    for (const character of text) {
      context.fillText(character, x, baseline);
      x += context.measureText(character).width + spacing;
    }
  }
  context.restore();
}

/** One finite canvas morphs the brand, metadata and native controls together. */
export default function HeroMorph({ children, active, onComplete }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  useLayoutEffect(() => {
    const host = hostRef.current, content = contentRef.current, canvas = canvasRef.current;
    if (!host || !content || !canvas) return;
    let raf = 0, finished = false;
    const restore = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      content.style.opacity = "";
      canvas.style.opacity = "0";
    };
    if (!active) { restore(); return; }
    const finish = () => {
      if (finished) return;
      finished = true;
      restore();
      host.dataset.morphPhase = "complete";
      completeRef.current();
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hostRect = host.getBoundingClientRect();
    const width = host.clientWidth, height = host.clientHeight;
    if (reduce.matches || document.hidden || !width || !height || hostRect.bottom <= 0 || hostRect.top >= window.innerHeight) {
      finish();
      return restore;
    }
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) { finish(); return restore; }
    const mobile = width <= 600;
    const clock = new FrameClock(mobile ? 30 : 60);
    const sample = document.createElement("canvas");
    const sampler = sample.getContext("2d", { willReadFrequently: true });
    if (!sampler) { finish(); return restore; }

    try {
      const groups: Group[] = [];
      const targets = content.querySelectorAll<HTMLElement>("[data-morph-image], [data-morph-text], [data-morph-control]");
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const isImage = target instanceof HTMLImageElement;
        // Cap temporary image sampling independently of screen density.
        const sampleScale = Math.min(1, 640 / rect.width);
        sample.width = Math.max(1, Math.ceil(rect.width * sampleScale));
        sample.height = Math.max(1, Math.ceil(rect.height * sampleScale));
        sampler.setTransform(sampleScale, 0, 0, sampleScale, 0, 0);
        if (isImage) {
          if (!target.complete || !target.naturalWidth) continue;
          sampler.drawImage(target, 0, 0, rect.width, rect.height);
        } else if (target.hasAttribute("data-morph-control")) {
          // The outline assembles with the label; the native fill crossfades at the end.
          const radius = Number.parseFloat(getComputedStyle(target).borderRadius) || 10;
          sampler.strokeStyle = "#ba91ff";
          sampler.lineWidth = 1.5;
          sampler.beginPath();
          sampler.roundRect(1, 1, Math.max(1, rect.width - 2), Math.max(1, rect.height - 2), radius);
          sampler.stroke();
        } else {
          paintText(sampler, target, rect.width, rect.height);
        }
        const pixels = sampler.getImageData(0, 0, sample.width, sample.height).data;
        const points: Point[] = [];
        const step = isImage ? 2 : 1;
        for (let y = 0; y < sample.height; y += step) {
          for (let x = 0; x < sample.width; x += step) {
            const i = (y * sample.width + x) * 4;
            if (pixels[i + 3] < 65) continue;
            points.push({
              x: rect.left - hostRect.left + x / sampleScale,
              y: rect.top - hostRect.top + y / sampleScale,
              color: `rgba(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3] / 255})`,
            });
          }
        }
        if (points.length) groups.push({ points, rect, image: isImage });
      }
      if (!groups.length) { finish(); return restore; }
      const budget = mobile ? 1300 : 2200;
      const minimum = Math.min(mobile ? 85 : 120, Math.floor(budget / groups.length));
      const available = Math.max(0, budget - minimum * groups.length);
      const totalWeight = groups.reduce((sum, group) => sum + Math.sqrt(group.points.length), 0);
      const dots: Dot[] = [];
      for (const group of groups) {
        const count = Math.min(group.points.length, minimum + Math.floor(available * Math.sqrt(group.points.length) / totalWeight));
        const delay = clamp((group.rect.top - hostRect.top) / height) * 0.13;
        for (let i = 0; i < count; i++) {
          const target = group.points[Math.floor(i * group.points.length / count)];
          const seed = dots.length + 1;
          // Keep each cloud near its intended element rather than crossing the entire page.
          const spreadX = group.image ? Math.min(170, width * 0.25) : 48;
          const spreadY = group.image ? 65 : 28;
          dots.push({ ...target,
            sx: Math.max(2, Math.min(width - 2, target.x + (random(seed) - 0.5) * spreadX * 2)),
            sy: Math.max(2, Math.min(height - 2, target.y + (random(seed + 100) - 0.5) * spreadY * 2)),
            phase: random(seed + 200) * Math.PI * 2, delay,
          });
        }
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(1_600_000 / (width * height)));
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const draw = (progress: number) => {
        context.clearRect(0, 0, width, height);
        for (const dot of dots) {
          const p = clamp((progress - dot.delay) / 0.68);
          const ease = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
          const drift = (1 - ease) * Math.sin(p * Math.PI) * 8;
          const x = dot.sx + (dot.x - dot.sx) * ease + Math.sin(dot.phase + p * 3) * drift;
          const y = dot.sy + (dot.y - dot.sy) * ease + Math.cos(dot.phase + p * 3) * drift;
          context.fillStyle = dot.color;
          context.globalAlpha = clamp((progress - dot.delay) / 0.1);
          context.beginPath();
          context.arc(x, y, (mobile ? 1.1 : 1.3) - ease * 0.15, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = 1;
        const blend = clamp((progress - 0.81) / 0.19);
        canvas.style.opacity = String(1 - blend);
        content.style.opacity = String(blend);
      };
      host.dataset.morphPhase = "animating";
      host.dataset.morphDots = String(dots.length);
      draw(0);
      const start = performance.now();
      const frame = (now: number) => {
        raf = 0;
        if (finished) return;
        if (document.hidden || reduce.matches) { finish(); return; }
        if (clock.advance(now) === null) { raf = requestAnimationFrame(frame); return; }
        const progress = clamp((now - start) / 1700);
        draw(progress);
        if (progress < 1) raf = requestAnimationFrame(frame);
        else finish();
      };
      raf = requestAnimationFrame(frame);
    } catch {
      finish();
      return restore;
    }

    const onPreference = () => { if (reduce.matches) finish(); };
    const onVisibility = () => { if (document.hidden) finish(); };
    const intersection = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) finish(); });
    const resize = new ResizeObserver(() => { if (host.clientWidth !== width || host.clientHeight !== height) finish(); });
    intersection.observe(host);
    resize.observe(host);
    reduce.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      finished = true;
      restore();
      intersection.disconnect();
      resize.disconnect();
      reduce.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);

  return <div ref={hostRef} className="e27-hero-morph" data-morph-phase="idle">
    <div ref={contentRef} className="e27-hero-morph-content">{children}</div>
    <canvas ref={canvasRef} className="e27-hero-morph-canvas" aria-hidden="true" style={{ opacity: 0 }} />
  </div>;
}
