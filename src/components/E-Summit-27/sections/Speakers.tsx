import Reveal from "../Reveal";
import SpeakerCarousel from "../gallery/SpeakerCarousel";

export default function Speakers() {
  return (
    <section id="speakers" aria-labelledby="e27-speakers-title"
      className="e27-section overflow-hidden py-24 lg:py-32"
      style={{ containIntrinsicSize: "auto 850px" }}>
      <Reveal className="px-4 text-center">
        <p className="e27-label mb-4">Voices that inspired</p>
        <h2 id="e27-speakers-title" className="e27-heading text-4xl sm:text-6xl">
          Previous <span className="text-white">speakers</span>
        </h2>
        <p className="mt-5 text-sm text-[var(--e27-muted)]">Drag to rotate · Swipe or use the arrows to explore</p>
      </Reveal>
      <SpeakerCarousel />
    </section>
  );
}
