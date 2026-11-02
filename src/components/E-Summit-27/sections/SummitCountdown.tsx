"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EVENT_DATES, EVENT_START_DATE, EVENT_END_DATE } from "@/context/E-Summit-27/constants";
import HeroMorph from "../hero/HeroMorph";
import { useSiteIntro } from "../SiteIntro";
import { summitCountdown, untilNextIndiaDay } from "./countdownTime";
import "./SummitCountdown.css";

type Countdown = ReturnType<typeof summitCountdown>;

export default function SummitCountdown() {
  const host = useRef<HTMLElement>(null);
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const animatedValue = useRef("");
  const { ambientEnabled } = useSiteIntro();
  const complete = useCallback(() => setActive(false), []);
  const value = countdown?.phase === "upcoming" ? String(countdown.days).padStart(2, "0")
    : countdown?.phase === "live" ? "Live" : countdown?.phase === "finished" ? "Thank you" : "—";

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let inView = false, timer = 0;
    const update = () => {
      clearTimeout(timer);
      const showing = inView && !document.hidden;
      setVisible(showing);
      if (!showing) return;
      const now = Date.now();
      setCountdown(summitCountdown(now, EVENT_START_DATE, EVENT_END_DATE));
      // The label is calendar-day based: no ticking seconds or perpetual render loop.
      timer = window.setTimeout(update, untilNextIndiaDay(now));
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.25 });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => { clearTimeout(timer); observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);

  useLayoutEffect(() => {
    if (!visible || !ambientEnabled || !countdown || animatedValue.current === value) return;
    animatedValue.current = value;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setActive(true);
  }, [visible, ambientEnabled, countdown, value]);

  return <section ref={host} id="countdown" className="e27-section e27-countdown-section px-4 sm:px-6 lg:px-8" aria-labelledby="e27-countdown-title"
    data-countdown-status={countdown?.phase ?? "loading"}>
    <div className="e27-card e27-countdown-panel mx-auto max-w-6xl">
      <div className="e27-countdown-copy">
        <p className="e27-label">Save the dates</p>
        <h2 id="e27-countdown-title" className="e27-heading">Counting down to E-Summit.</h2>
        <p className="e27-countdown-date"><time dateTime={EVENT_START_DATE}>{EVENT_DATES}</time><span aria-hidden="true"> · </span>IIT Ropar</p>
      </div>
      <div className="e27-countdown-number">
        <HeroMorph active={active} onComplete={complete} duration={1100} maxDots={720} mobileMaxDots={420}>
          <span data-morph-text className={`e27-countdown-value${countdown?.phase === "finished" ? " e27-countdown-thanks" : ""}`}>{value}</span>
        </HeroMorph>
        <p className="e27-countdown-caption">{countdown?.phase === "upcoming" ? (countdown.days === 1 ? "day to go" : "days to go")
          : countdown?.phase === "live" ? "E-Summit is here" : countdown?.phase === "finished" ? "for being part of E-Summit" : "23 January 2027"}</p>
      </div>
    </div>
  </section>;
}
