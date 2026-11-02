"use client";

import { useEffect, useRef } from "react";
import { EVENT_START_DATE, EVENT_END_DATE, VENUE } from "@/context/E-Summit-27/constants";
import SplitHeading from "../SplitHeading";
import "./SummitJourney.css";

const days = [
  { label: "Day 01", date: EVENT_START_DATE, number: "23" },
  { label: "Day 02", date: EVENT_END_DATE, number: "24" },
] as const;

/** The confirmed dates form the journey; session details remain unannounced. */
export default function SummitJourney() {
  const hostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const settle = () => {
      host.dataset.journeyMotion = "static";
      host.dataset.journeyPhase = "complete";
      observer?.disconnect();
    };
    if (reduce.matches || document.hidden) { settle(); return; }

    if (CSS.supports("animation-timeline: view()")) {
      // The browser advances this one line from scroll position; there is no RAF.
      host.dataset.journeyMotion = "scroll";
    } else if (host.getBoundingClientRect().top >= window.innerHeight - 80) {
      host.dataset.journeyMotion = "reveal";
      host.dataset.journeyPhase = "pending";
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        host.dataset.journeyPhase = "complete";
        observer?.disconnect();
      }, { rootMargin: "0px 0px -80px 0px" });
      observer.observe(host);
    }
    const onPreference = () => { if (reduce.matches) settle(); };
    const onVisibility = () => { if (document.hidden) settle(); };
    reduce.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer?.disconnect();
      reduce.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section ref={hostRef} id="journey" aria-labelledby="e27-journey-title"
      className="e27-section e27-journey px-4 sm:px-6 lg:px-8"
      style={{ containIntrinsicSize: "auto 560px" }}>
      <div className="mx-auto max-w-6xl">
        <div className="e27-journey-heading">
          <SplitHeading id="e27-journey-title" className="e27-heading">The summit journey</SplitHeading>
          <p>Session timings will be announced.</p>
        </div>
        <ol className="e27-journey-days" aria-label="E-Summit 2027 dates">
          {days.map((day) => (
            <li key={day.date} className="e27-journey-stop">
              <div className="e27-journey-track" aria-hidden="true">
                <span className="e27-journey-track-base" />
                <span className="e27-journey-track-draw" />
                <span className="e27-journey-node" />
              </div>
              <article className="e27-card e27-journey-card">
                <h3 className="e27-journey-day">{day.label}</h3>
                <time dateTime={day.date} className="e27-journey-date">
                  <span className="e27-journey-number">{day.number}</span>
                  <span className="e27-journey-month">January <span>2027</span></span>
                </time>
                <p className="e27-journey-venue">{VENUE}</p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
