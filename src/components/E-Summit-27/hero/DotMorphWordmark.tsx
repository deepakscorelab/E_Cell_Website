"use client";

import { useEffect, useRef } from "react";
import { FrameClock } from "./firePerformance";

type Props = { src: string; alt: string };
type Dot = { x: number; y: number; sx: number; sy: number; color: string; phase: number };
const random = (seed: number) => { const n = Math.sin(seed * 12.9898) * 43758.5453; return n - Math.floor(n); };

/** A finite particle intro resolves into the original artwork, never a replacement logo. */
export default function DotMorphWordmark({ src, alt }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current, image = imageRef.current, canvas = canvasRef.current;
    if (!host || !image || !canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clock = new FrameClock(60);
    let raf = 0, timer = 0, attempted = false, failed = false, disposed = false;
    let visible = false;
    let lastWidth = host.clientWidth, lastHeight = host.clientHeight;

    const reveal = (phase = "complete") => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      raf = timer = 0;
      clock.reset();
      image.style.opacity = "";
      canvas.style.opacity = "0";
      host.dataset.phase = phase;
    };

    const start = () => {
      reveal("static");
      if (disposed || failed || !visible || document.hidden || reduce.matches || !image.complete || !image.naturalWidth) return;
      attempted = true;
      try {
        const width = host.clientWidth, height = host.clientHeight;
        if (!width || !height) return;
        clock.interval = 1000 / (width <= 480 ? 30 : 60);
        const sample = document.createElement("canvas");
        sample.width = Math.min(620, image.naturalWidth);
        sample.height = Math.max(1, Math.round(sample.width * image.naturalHeight / image.naturalWidth));
        const sampler = sample.getContext("2d", { willReadFrequently: true });
        if (!sampler) return;
        sampler.drawImage(image, 0, 0, sample.width, sample.height);
        const pixels = sampler.getImageData(0, 0, sample.width, sample.height).data;
        const candidates: { x: number; y: number; color: string }[] = [];
        for (let y = 0; y < sample.height; y += 2) {
          for (let x = 0; x < sample.width; x += 2) {
            const i = (y * sample.width + x) * 4;
            if (pixels[i + 3] < 70) continue;
            candidates.push({ x: x / sample.width * width, y: y / sample.height * height,
              color: `rgba(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]},${pixels[i + 3] / 255})` });
          }
        }
        const count = Math.min(candidates.length, width <= 480 ? 650 : 1100);
        if (!count) return;
        const dots: Dot[] = Array.from({ length: count }, (_, i) => ({
          ...candidates[Math.floor(i * candidates.length / count)],
          sx: random(i + 1) * width, sy: random(i + 101) * height, phase: random(i + 201) * Math.PI * 2,
        }));
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        const draw = (progress: number) => {
          context.clearRect(0, 0, width, height);
          const p = Math.min(1, Math.max(0, (progress - 0.06) / 0.79));
          const ease = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
          const drift = (1 - ease) * Math.sin(p * Math.PI) * Math.min(18, height * 0.2);
          const radius = (width <= 480 ? 1.2 : 1.6) * (1 - ease * 0.2);
          for (const dot of dots) {
            const x = dot.sx + (dot.x - dot.sx) * ease + Math.sin(dot.phase + p * 4) * drift;
            const y = dot.sy + (dot.y - dot.sy) * ease + Math.cos(dot.phase + p * 4) * drift;
            context.fillStyle = dot.color;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
          }
          const blend = Math.max(0, Math.min(1, (progress - 0.82) / 0.18));
          canvas.style.opacity = String(1 - blend);
          image.style.opacity = String(blend);
        };
        draw(0); // The fallback is hidden only after a valid canvas frame exists.
        host.dataset.phase = "animating";
        host.dataset.dotCount = String(count);
        const started = performance.now();
        const frame = (now: number) => {
          raf = 0;
          if (disposed || !visible || document.hidden || reduce.matches) { reveal(); return; }
          if (clock.advance(now) === null) { raf = requestAnimationFrame(frame); return; }
          const progress = Math.min(1, (now - started) / 2200);
          draw(progress);
          if (progress < 1) raf = requestAnimationFrame(frame);
          else reveal();
        };
        raf = requestAnimationFrame(frame);
      } catch {
        failed = true;
        reveal("static");
      }
    };

    const queue = () => {
      if (!visible || document.hidden || failed || reduce.matches || !image.complete || !image.naturalWidth || attempted || disposed) return;
      attempted = true;
      timer = window.setTimeout(start, 300);
    };
    const onVisibility = () => { if (document.hidden || reduce.matches) reveal(); else queue(); };
    const onError = () => { failed = true; reveal("static"); };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reveal(); else queue();
    });
    const resize = new ResizeObserver(() => {
      const width = host.clientWidth, height = host.clientHeight;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width; lastHeight = height;
      reveal(); // Keep the original artwork crisp after a viewport resize.
    });
    image.addEventListener("load", queue);
    image.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onVisibility);
    intersection.observe(host);
    resize.observe(host);
    queue();
    return () => {
      disposed = true;
      reveal("static");
      intersection.disconnect(); resize.disconnect();
      image.removeEventListener("load", queue);
      image.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onVisibility);
    };
  }, [src]);

  return <div ref={hostRef} className="e27-dot-wordmark" data-phase="static">
      <img ref={imageRef} src={src} alt={alt} width={1218} height={219}
        fetchPriority="high" decoding="async" />
      <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: 0 }} />
    </div>;
}
