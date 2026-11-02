"use client";

import { useRef, type MouseEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import "./RegistrationSpark.css";

/** A short body-level effect can finish after the route changes. It owns its cleanup. */
function ignite(x: number, y: number): () => void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || document.hidden || typeof Element.prototype.animate !== "function") return () => {};

  const layer = document.createElement("div");
  layer.className = "e27-registration-spark";
  layer.setAttribute("aria-hidden", "true");
  layer.style.left = `${x}px`;
  layer.style.top = `${y}px`;
  const animations: Animation[] = [];
  let timer = 0, disposed = false;
  const clean = () => {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(timer);
    animations.forEach(animation => animation.cancel());
    layer.remove();
    document.removeEventListener("visibilitychange", onVisibility);
    reduce.removeEventListener("change", onPreference);
    window.removeEventListener("pagehide", clean);
  };
  const onVisibility = () => { if (document.hidden) clean(); };
  const onPreference = () => { if (reduce.matches) clean(); };

  try {
    const sparks = Array.from({ length: 10 }, (_, index) => {
      const ember = document.createElement("span");
      ember.className = "e27-registration-ember";
      ember.style.backgroundColor = index % 3 === 0 ? "#f1eaf9" : index % 2 === 0 ? "#b58bff" : "#9030f0";
      layer.appendChild(ember);
      return ember;
    });
    document.body.appendChild(layer);
    sparks.forEach((ember, index) => {
      const angle = (index / sparks.length) * Math.PI * 2 - Math.PI / 2;
      const distance = 34 + (index % 4) * 12;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 12;
      const rotation = angle * 180 / Math.PI + 90;
      animations.push(ember.animate([
        { transform: `translate3d(-50%, -50%, 0) rotate(${rotation}deg) scale(.35)`, opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.08 },
        { transform: `translate3d(calc(-50% + ${endX}px), calc(-50% + ${endY}px), 0) rotate(${rotation + 35}deg) scale(.15)`, opacity: 0, offset: 1 },
      ], { duration: 560, easing: "cubic-bezier(.12,.55,.35,1)", fill: "both" }));
    });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onPreference);
    window.addEventListener("pagehide", clean, { once: true });
    timer = window.setTimeout(clean, 650);
    void Promise.allSettled(animations.map(animation => animation.finished)).then(clean);
  } catch {
    // Decorative failure must never interfere with the actual link activation.
    clean();
  }
  return clean;
}

export default function RegistrationSpark({ href }: { href: string }) {
  const cancelPrevious = useRef<(() => void) | null>(null);
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try {
      cancelPrevious.current?.();
      const rect = event.currentTarget.getBoundingClientRect();
      // Keyboard and assistive-technology clicks use the same effect, once, at the center.
      const x = event.detail ? event.clientX : rect.left + rect.width / 2;
      const y = event.detail ? event.clientY : rect.top + rect.height / 2;
      cancelPrevious.current = ignite(x, y);
    } catch { /* The native link still navigates if decoration is unavailable. */ }
  };

  return <Link href={href} onClick={onClick} data-morph-control data-registration-spark
    className="e27-btn e27-btn-primary">
    <span data-morph-text>Register Now</span> <ArrowRight size={16} aria-hidden="true" />
  </Link>;
}
