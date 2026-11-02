import Reveal from "../Reveal";
import { HOW_IT_WORKS } from "@/context/E-Summit-27/sponsorData";

export default function HowItWorks() {
  return (
    <section
      aria-labelledby="e27s-how-title"
      className="e27-section e27-section-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      style={{ containIntrinsicSize: "auto 560px" }}
    >
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <h2 id="e27s-how-title" className="e27-heading text-3xl sm:text-5xl">
            Three steps <span className="text-white">to ignition</span>
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          {/* Line + circles drawn in sponsor.css (vertical on mobile, horizontal from md) */}
          <ol className="e27s-stepper mt-14">
            {HOW_IT_WORKS.map((s, i) => (
              <li key={s.title} className="e27s-step">
                <span className="e27s-step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="md:mt-5">
                  <h3 className="font-[family-name:var(--e27-font-heading)] text-xl text-white sm:text-2xl">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--e27-muted)]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}