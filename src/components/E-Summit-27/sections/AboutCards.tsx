import Reveal from "../Reveal";
import { ABOUT_CARDS } from "@/context/E-Summit-27/homeData";
import { asset } from "@/context/E-Summit-27/constants";

export default function AboutCards() {
  return (
    <section
      id="about"
      aria-labelledby="e27-about-title"
      className="e27-section e27-section-bg px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      style={{ containIntrinsicSize: "auto 1400px" }}
    >
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <p className="e27-label mb-4">The people behind it</p>
          <h2 id="e27-about-title" className="e27-heading text-4xl sm:text-6xl">
            About <span className="text-white">us</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ABOUT_CARDS.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.08} className={i === 2 ? "md:col-span-2 lg:col-span-1" : ""}>
              <article className="e27-card e27-tilt-card flex h-full flex-col p-7 sm:p-8">
                {card.logo === "iitr-emblem.webp" && <div className="flex h-20 items-center">
                  <img
                    src={asset(card.logo)}
                    alt={`${card.title} logo`}
                    width={card.logoW}
                    height={card.logoH}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-auto object-contain"
                  />
                </div>}
                <h3 className="mt-5 font-[family-name:var(--e27-font-heading)] text-2xl tracking-wide text-[var(--e27-lavender)]">
                  {card.title}
                </h3>
                <div className="mt-3 h-px w-14 bg-gradient-to-r from-[var(--e27-bright)] to-transparent" />
                <p className="mt-4 text-sm leading-7 text-[var(--e27-muted)]">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}