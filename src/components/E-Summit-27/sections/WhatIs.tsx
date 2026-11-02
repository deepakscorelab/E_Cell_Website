import Reveal from "../Reveal";
import { WHAT_IS_TEXT } from "@/context/E-Summit-27/homeData";

export default function WhatIs() {
  return (
    <section
      id="what-is"
      aria-labelledby="e27-whatis-title"
      className="e27-section e27-section-bg px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <h2 id="e27-whatis-title" className="e27-heading text-5xl sm:text-6xl lg:text-7xl">
            What is
            <span className="mt-2 block text-white">
              E-Summit<span className="e27-accent">?</span>
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="max-w-[70ch] text-base leading-relaxed text-[var(--e27-muted)] sm:text-lg sm:leading-8">
            {WHAT_IS_TEXT}
          </p>
        </Reveal>
      </div>
    </section>
  );
}