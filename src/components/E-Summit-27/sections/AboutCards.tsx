import Reveal from "../Reveal";
import SplitHeading from "../SplitHeading";
import { ABOUT_CARDS } from "@/context/E-Summit-27/homeData";
import { asset } from "@/context/E-Summit-27/constants";
import "./EditorialSections.css";

export default function AboutCards() {
  return (
    <section
      id="about"
      aria-labelledby="e27-about-title"
      className="e27-section e27-section-bg px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      style={{ containIntrinsicSize: "auto 1400px" }}
    >
      <div className="mx-auto max-w-6xl">
        <SplitHeading id="e27-about-title" className="e27-heading text-4xl sm:text-6xl">
          About <span className="text-white">us</span>
        </SplitHeading>

        <div className="e27-institution-list">
          {ABOUT_CARDS.map((card) => (
            <Reveal key={card.title}>
              <article className="e27-card e27-institution">
                <div className="e27-institution-identity">
                  {card.logo === "iitr-emblem.webp" && (
                    <img
                      src={asset(card.logo)}
                      alt={`${card.title} logo`}
                      width={card.logoW}
                      height={card.logoH}
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-auto object-contain"
                    />
                  )}
                  <h3>{card.title}</h3>
                </div>
                <p className="e27-institution-copy">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
