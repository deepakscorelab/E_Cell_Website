"use client";

/** Adapted from React Bits Staggered Menu (David Haz).
 * Source: https://github.com/DavidHDev/react-bits/tree/main/src/ts-default/Components/StaggeredMenu
 * License: ../hero/REACT-BITS-LICENSE.md
 * Keeps the layered GSAP entrance, tilted staggered labels and rotating plus.
 * Adds Next links, focus containment, Escape, scroll lock and reduced motion.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { BASE, NAV_LINKS, asset } from "@/context/E-Summit-27/constants";
import "./StaggeredMenu.css";

export default function StaggeredMenu() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reduced, setReduced] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const close = useCallback(() => {
    setOpen(false);
    toggle.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    let raf = 0;
    const check = () => { raf = 0; setScrolled(window.scrollY > 24); };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      preference.removeEventListener("change", update);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Initialize once. Later timelines reverse from current positions on rapid toggles.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".e27-sm-prelayer, .e27-sm-panel", { x: 0, xPercent: 100 });
      gsap.set(".e27-sm-item-label", { yPercent: 140, rotate: 10 });
    }, root);
    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const layers = host.querySelectorAll(".e27-sm-prelayer");
    const labels = host.querySelectorAll(".e27-sm-item-label");
    const numbers = host.querySelectorAll(".e27-sm-number");
    const icon = host.querySelector(".e27-sm-icon");
    const text = host.querySelector(".e27-sm-toggle-inner");
    const reduce = reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tl = gsap.timeline();
    if (reduce) {
      tl.set([...layers, panel.current], { xPercent: open ? 0 : 100 })
        .set(labels, { yPercent: 0, rotate: 0 }).set(numbers, { opacity: 1 })
        .set(icon, { rotate: open ? 225 : 0 }).set(text, { yPercent: open ? -50 : 0 });
    } else if (open) {
      tl.set(labels, { yPercent: 140, rotate: 10 }).set(numbers, { opacity: 0 })
        .to(layers, { xPercent: 0, duration: 0.5, ease: "power4.out", stagger: 0.07 }, 0)
        .to(panel.current, { xPercent: 0, duration: 0.65, ease: "power4.out" }, 0.15)
        .to(labels, { yPercent: 0, rotate: 0, duration: 0.7, ease: "power4.out", stagger: 0.055 }, 0.24)
        .to(numbers, { opacity: 1, duration: 0.4, stagger: 0.055 }, 0.32)
        .to(icon, { rotate: 225, duration: 0.65, ease: "power4.out" }, 0)
        .to(text, { yPercent: -50, duration: 0.45, ease: "power4.out" }, 0);
    } else {
      tl.to([panel.current, ...Array.from(layers).reverse()], {
        xPercent: 100, duration: 0.32, ease: "power3.in", stagger: 0.035,
      }, 0).to(icon, { rotate: 0, duration: 0.35, ease: "power3.inOut" }, 0)
        .to(text, { yPercent: 0, duration: 0.35, ease: "power3.inOut" }, 0);
    }
    return () => { tl.kill(); };
  }, [open, reduced]);

  useEffect(() => {
    if (!open) return;
    const content = document.querySelector<HTMLElement>(".e27-site-content");
    const wasInert = content?.inert ?? false;
    if (content) content.inert = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key !== "Tab") return;
      const focusable = Array.from(root.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      if (content) content.inert = wasInert;
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div ref={root} className="e27-staggered-menu" data-open={open}
      role={open ? "dialog" : undefined} aria-modal={open || undefined}
      aria-label={open ? "Site navigation" : undefined}>
      <div className="e27-sm-scrim" aria-hidden="true" onClick={close} />
      <div className="e27-sm-prelayers" aria-hidden="true">
        <div className="e27-sm-prelayer" /><div className="e27-sm-prelayer" />
      </div>
      <header className={`e27-sm-header ${scrolled ? "e27-sm-header--scrolled" : ""}`}>
        <div className="e27-sm-header-inner">
          <Link href={BASE} onClick={() => setOpen(false)} className="e27-sm-logo" aria-label="E-Summit 27 home">
            <img src={asset("esummit27-wordmark.webp")} alt="" width={1218} height={219} decoding="async" />
          </Link>
          <button ref={toggle} className="e27-sm-toggle" type="button" onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="e27-staggered-panel">
            <span className="e27-sm-toggle-text" aria-hidden="true">
              <span className="e27-sm-toggle-inner"><span>Menu</span><span>Close</span></span>
            </span>
            <span className="e27-sm-icon" aria-hidden="true"><span /><span /></span>
          </button>
        </div>
      </header>
      <nav ref={panel} id="e27-staggered-panel" className="e27-sm-panel" aria-label="Main" aria-hidden={!open} inert={!open}>
        <p className="e27-sm-eyebrow">Explore E-Summit’27</p>
        <ul className="e27-sm-list">
          {NAV_LINKS.map((item, index) => (
            <li key={item.label} className="e27-sm-item-wrap">
              <Link href={item.href} className="e27-sm-item" onClick={close}
                aria-current={item.href === pathname ? "page" : undefined}>
                <span className="e27-sm-item-label">{item.label}</span>
                <span className="e27-sm-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="e27-sm-footer">Igniting the unwritten<br /><span>IIT Ropar · E-Summit 2027</span></p>
      </nav>
    </div>
  );
}
