"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { SPEAKERS } from "@/context/E-Summit-27/homeData";
import { asset } from "@/context/E-Summit-27/constants";
import { observeMotionActivity } from "../motionActivity";
import "./SpeakerCarousel.css";

const CircularCarousel = dynamic(() => import("./CircularCarousel"), { ssr: false });
const items = SPEAKERS.map(s => ({
  src: asset(s.imageSrc).replace("w_240,q_auto,f_auto", "w_640,q_90,f_auto,c_fill,g_face,ar_4:5"),
  alt: s.name, title: s.name, subtitle: s.position,
}));

/** The native photo strip remains usable without JS or with reduced motion. */
export default function SpeakerCarousel() {
  const host = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    return observeMotionActivity(el, active => {
      if (active) setMounted(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMounted(false); setReady(false);
      }
    }, "160px");
  }, []);
  return (
    <div ref={host} className="e27-speaker-gallery" data-ready={ready}>
      {!ready && <ul className="e27-speaker-strip" aria-label="Previous speakers" tabIndex={0}>
        {items.map(item => <li key={item.title}>
          <img src={item.src} alt={item.alt} width={240} height={300} loading="lazy" decoding="async" />
          <h3>{item.title}</h3><p>{item.subtitle}</p>
        </li>)}
      </ul>}
      {mounted && <div className="e27-speaker-ring" aria-hidden={!ready} inert={!ready}>
        <CircularCarousel items={items} preset="cylinder" intro="rise" cardWidth={240}
          aspectRatio={0.8} gap={32} curve={0.25} tilt={-8} autoplay="off"
          parallax={0} stretch={0.08} depthFade={0.35} fadeColor="#10051c"
          cornerRadius={16} captions onReady={onReady} />
      </div>}
    </div>
  );
}
