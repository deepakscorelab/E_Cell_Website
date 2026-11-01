import AnimatedNumbers from "../AnimatedNumbers";
import { STATS } from "@/context/E-Summit-27/homeData";

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN"); // 2,50,000 style

export default function Stats() {
  return (
    <section
      aria-labelledby="e27-stats-title"
      className="e27-section px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      style={{ containIntrinsicSize: "auto 520px" }}
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="e27-stats-title" className="e27-heading text-center text-3xl sm:text-5xl">
          Our reach in <span className="text-white">all means</span>
        </h2>

        <AnimatedNumbers className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {STATS.map((s, i) => (
            <li
              key={s.label}
              className={`e27-card flex flex-col items-center justify-center px-4 py-8 text-center ${
                i === STATS.length - 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <span className="font-[family-name:var(--e27-font-heading)] text-4xl text-white sm:text-5xl">
                <span className="sr-only">{fmt(s.value)}</span>
                <span data-count-to={s.value} aria-hidden="true">{fmt(s.value)}</span>
                <span className="e27-accent">{s.suffix}</span>
              </span>
              <span className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-[var(--e27-muted)]">
                {s.label}
              </span>
            </li>
          ))}
        </AnimatedNumbers>
      </div>
    </section>
  );
}