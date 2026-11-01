import AnimatedNumbers from "../AnimatedNumbers";
import { REACH_STATS } from "@/context/E-Summit-27/sponsorData";

const fmt = (n: number) => Math.round(n).toLocaleString("en-IN"); // 2,50,000

export default function ReachStats() {
  return (
    <section
      aria-labelledby="e27s-why-title"
      className="e27-section e27-section-bg px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      style={{ containIntrinsicSize: "auto 560px" }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="e27-label mb-4">Why partner with us</p>
          <h2 id="e27s-why-title" className="e27-heading text-3xl sm:text-5xl">
            Reach that <span className="text-white">burns bright</span>
          </h2>
        </div>

        <AnimatedNumbers className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {REACH_STATS.map((s) => (
            <li key={s.label} className="e27-card flex flex-col items-center justify-center px-3 py-8 text-center">
              <span className="font-[family-name:var(--e27-font-heading)] text-3xl text-white sm:text-4xl">
                <span className="sr-only">{fmt(s.value)}</span>
                <span data-count-to={s.value} aria-hidden="true">{fmt(s.value)}</span>
                <span className="e27-accent">{s.suffix}</span>
              </span>
              <span className="mt-3 text-[11px] font-medium uppercase leading-5 tracking-[0.18em] text-[var(--e27-muted)]">
                {s.label}
              </span>
            </li>
          ))}
        </AnimatedNumbers>
      </div>
    </section>
  );
}