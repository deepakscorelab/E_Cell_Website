import Reveal from "../Reveal";
import Marquee from "../Marquee";
import { SPEAKERS } from "@/context/E-Summit-27/homeData";
import type { Speaker } from "@/context/E-Summit-27/homeData";
import { asset } from "@/context/E-Summit-27/constants";

function initials(name: string) {
  return name
    .replace(/^(Lt\.|Gen\.|Dr\.)\s*/g, "")
    .replace(/^(Lt\.|Gen\.|Dr\.)\s*/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function SpeakerCard({ s }: { s: Speaker }) {
  return (
    <article className="e27-card flex w-60 shrink-0 flex-col items-center px-5 py-7 text-center sm:w-64">
      <div className="h-28 w-28 overflow-hidden rounded-full border border-[var(--e27-line)] bg-gradient-to-br from-[var(--e27-deep)] to-[#1a0533]">
        {s.imageSrc ? (
          <img
            src={asset(s.imageSrc)}
            alt={s.name}
            width={112}
            height={112}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            className="flex h-full w-full items-center justify-center font-[family-name:var(--e27-font-heading)] text-3xl text-[var(--e27-lavender)]"
            aria-hidden="true"
          >
            {initials(s.name)}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-base font-semibold text-white">{s.name}</h3>
      <p className="mt-1.5 text-xs leading-5 text-[var(--e27-muted)]">{s.position}</p>
    </article>
  );
}

export default function Speakers() {
  return (
    <section
      id="speakers"
      aria-labelledby="e27-speakers-title"
      className="e27-section overflow-hidden py-24 lg:py-32"
      style={{ containIntrinsicSize: "auto 720px" }}
    >
      <div className="relative">
        <Reveal className="px-4 text-center">
          <p className="e27-label mb-4">Voices that inspired</p>
          <h2 id="e27-speakers-title" className="e27-heading text-4xl sm:text-6xl">
            Previous <span className="text-white">speakers</span>
          </h2>
        </Reveal>

        <Marquee label="Previous speakers" duration={45} className="mt-14">
          {SPEAKERS.map((s) => (
            <SpeakerCard key={s.name} s={s} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}