"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { useSiteIntro } from "./SiteIntro";
import "./SplitHeading.css";

// Adapted from React Bits SplitText by David Haz; see SplitHeading.LICENSE.md.
// Keep its GSAP SplitText/fromTo core, without looping, hover springs or ScrollTrigger.
const importMotion = () => Promise.all([import("gsap"), import("gsap/SplitText")]);
let modules: ReturnType<typeof importMotion> | undefined;
const loadMotion = () => modules ??= importMotion();

type Props = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h2" | "h3" | "h4";
  children: ReactNode;
};

/** One short character assembly; canonical typography/markup returns on completion. */
export default function SplitHeading({ as: Tag = "h2", children, className = "", ...props }: Props) {
  const { ambientEnabled } = useSiteIntro();
  const ref = useRef<HTMLHeadingElement>(null);
  const completed = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || completed.current || !ambientEnabled) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, loading = false, running = false, inView = false;
    let cleanupMotion = () => {};
    let enteredAt = 0;
    const finish = () => {
      cleanupMotion();
      cleanupMotion = () => {};
      running = false;
      completed.current = true;
      element.dataset.splitPhase = "complete";
      nearby.disconnect();
      visible.disconnect();
    };
    const begin = async () => {
      if (disposed || loading || running || completed.current || !inView || document.hidden) return;
      if (reduce.matches) { finish(); return; }
      loading = true;
      element.dataset.splitPhase = "loading";
      try {
        const [[{ gsap }, { SplitText }]] = await Promise.all([loadMotion(), document.fonts.ready]);
        loading = false;
        if (disposed || completed.current) return;
        if (reduce.matches) { finish(); return; }
        if (!inView || document.hidden) { element.dataset.splitPhase = "idle"; return; }
        // On a slow connection keep already-read text steady instead of hiding it late.
        if (performance.now() - enteredAt > 500) { finish(); return; }
        gsap.registerPlugin(SplitText);
        let split: { revert: () => void } | undefined;
        const spokenText = element.innerText.replace(/\s+/g, " ").trim();
        const context = gsap.context(() => {
          const instance = new SplitText(element, {
            type: "words,chars", smartWrap: true, autoSplit: false,
            wordsClass: "e27-split-word", charsClass: "e27-split-char",
            reduceWhiteSpace: false, aria: "auto",
          });
          split = instance;
          cleanupMotion = () => instance.revert();
          // Preserve the natural pause between styled/block fragments, e.g. What is / E-Summit.
          if (spokenText) element.setAttribute("aria-label", spokenText);
          running = true;
          element.dataset.splitPhase = "assembling";
          gsap.fromTo(instance.chars,
            { opacity: 0, y: 18, x: 4, rotation: 1.5, willChange: "transform, opacity" },
            { opacity: 1, y: 0, x: 0, rotation: 0, duration: 0.5,
              ease: "power3.out", stagger: { amount: 0.22 }, onComplete: finish },
          );
        }, element);
        cleanupMotion = () => { context.revert(); split?.revert(); };
      } catch {
        loading = false;
        if (!disposed) finish();
      }
    };

    const nearby = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || reduce.matches) return;
      // Prepare near the title, after the hero entrance, outside the initial bundle.
      void loadMotion().catch(() => {});
      nearby.disconnect();
    }, { rootMargin: "250px 0px" });
    const visible = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { enteredAt = performance.now(); void begin(); }
      else if (running) finish();
    }, { rootMargin: "0px 0px -28px 0px", threshold: 0.15 });
    const onPreference = () => { if (reduce.matches) finish(); };
    const onVisibility = () => {
      if (document.hidden && running) finish();
      else if (!document.hidden) void begin();
    };
    const onResize = () => { if (running) finish(); };
    if (reduce.matches) finish();
    else { nearby.observe(element); visible.observe(element); }
    reduce.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });
    element.addEventListener("focusin", finish);
    return () => {
      disposed = true;
      cleanupMotion();
      nearby.disconnect();
      visible.disconnect();
      reduce.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      element.removeEventListener("focusin", finish);
    };
  }, [ambientEnabled]);

  return <Tag {...props} ref={ref} className={`e27-split-heading ${className}`} data-split-phase="idle">
    {children}
  </Tag>;
}
