import Reveal from "../Reveal";
import Marquee from "../Marquee";
import { asset } from "@/context/E-Summit-27/constants";
import { PAST_SPONSOR_LOGOS } from "@/context/E-Summit-27/sponsorData";

const half = Math.ceil(PAST_SPONSOR_LOGOS.length / 2);
const ROW_A = PAST_SPONSOR_LOGOS.slice(0, half);
const ROW_B = PAST_SPONSOR_LOGOS.slice(half);

export default function PastSponsors() {
  return (
    <section
      aria-labelledby="e27s-past-title"
      className="e27-section overflow-hidden py-20 lg:py-28"
      style={{ containIntrinsicSize: "auto 1100px" }}
    >
      <Reveal className="px-4 text-center">
        <h2 id="e27s-past-title" className="e27-heading text-3xl sm:text-5xl">
          Brands that <span className="text-white">ignited E-Summit</span>
        </h2>
      </Reveal>

      {/* Moving rows (pure CSS, pause off-screen / on hover) */}
      <div className="mt-12 flex flex-col gap-4">
        <Marquee label="Previous sponsors, moving row 1" duration={60}>
          {ROW_A.map((f, i) => (
            <div key={f} className="e27s-tile h-20 w-40 sm:h-24 sm:w-48">
              <img src={asset(f)} alt={`Previous sponsor ${i + 1}`} width={160} height={80} loading="lazy" decoding="async" />
            </div>
          ))}
        </Marquee>
        <Marquee label="Previous sponsors, moving row 2" duration={60} reverse>
          {ROW_B.map((f, i) => (
            <div key={f} className="e27s-tile h-20 w-40 sm:h-24 sm:w-48">
              <img
                src={asset(f)}
                alt={`Previous sponsor ${i + 1 + half}`}
                width={160}
                height={80}
                loading="lazy"
                decoding="async"
              />
            </div>
          ))}
        </Marquee>
      </div>

      {/* Static wall: every logo visible at once, quiet opacity hover only */}
      <div className="mx-auto mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em] text-white/55">
            All {PAST_SPONSOR_LOGOS.length} partners
          </p>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {PAST_SPONSOR_LOGOS.map((f, i) => (
              <li key={f} className="e27s-tile e27s-tile--fade aspect-[2/1] !p-2">
                <img src={asset(f)} alt={`Previous sponsor ${i + 1}`} width={120} height={60} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}