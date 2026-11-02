import AnimatedNumbers from "../AnimatedNumbers";
import { STATS } from "@/context/E-Summit-27/homeData";
import "./EditorialSections.css";

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

export default function Stats() {
  return (
    <section
      aria-labelledby="e27-stats-title"
      className="e27-section px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      style={{ containIntrinsicSize: "auto 360px" }}
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="e27-stats-title" className="e27-heading text-3xl sm:text-4xl">
          Our reach in <span className="text-white">all means</span>
        </h2>

        <AnimatedNumbers className="e27-reach-band">
          {STATS.map((s) => (
            <li key={s.label} className="e27-reach-item">
              <span className="e27-reach-value">
                <span className="sr-only">{fmt(s.value)}</span>
                <span data-count-to={s.value} aria-hidden="true">{fmt(s.value)}</span>
                <span className="e27-reach-suffix">{s.suffix}</span>
              </span>
              <span className="e27-reach-label">{s.label}</span>
            </li>
          ))}
        </AnimatedNumbers>
      </div>
    </section>
  );
}
