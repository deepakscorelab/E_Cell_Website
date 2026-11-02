"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BASE, NAV_LINKS, asset } from "@/context/E-Summit-27/constants";

export default function NavBar27() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // rAF-throttled passive scroll listener; setState only when the boolean flips.
  useEffect(() => {
    let raf = 0;
    let last = false;
    const check = () => {
      raf = 0;
      const next = window.scrollY > 24;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Close the mobile panel on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className={`e27-nav fixed inset-x-0 top-0 z-50 ${solid ? "e27-nav--scrolled" : ""}`}>
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link href={BASE} className="flex items-center gap-2.5" aria-label="E-Summit 27 home">
          <img
            src={asset("esummit27-wordmark.webp")}
            alt=""
            width={1218}
            height={219}
            decoding="async"
            className="h-auto w-[154px] sm:w-[178px]"
          />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="rounded-full px-3 py-2 text-[13px] font-medium tracking-wide text-white/75 transition-opacity hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="e27-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        id="e27-mobile-menu"
        data-open={open}
        className="e27-mobile-panel absolute inset-x-0 top-16 border-b border-[var(--e27-line)] bg-[#050008]/95 lg:hidden"
      >
        <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base text-white/85 hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
