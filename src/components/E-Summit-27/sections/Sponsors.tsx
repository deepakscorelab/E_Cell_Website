import Reveal from "../Reveal";
import Marquee from "../Marquee";
import { SPONSOR_LOGOS } from "@/context/E-Summit-27/homeData";
import { asset } from "@/context/E-Summit-27/constants";

const half = Math.ceil(SPONSOR_LOGOS.length / 2);
const ROW_A = SPONSOR_LOGOS.slice(0, half);
const ROW_B = SPONSOR_LOGOS.slice(half);

function Tile({ file, index }: { file: string; index: number }) {
  return (
    <div className="flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl bg-white p-3 sm:h-24 sm:w-48">
      <img
        src={asset(file)}
        alt={`Previous sponsor ${index + 1}`}
        width={160}
        height={80}
        loading="lazy"
        decoding="async"
        className="max-h-full w-auto max-w-full object-contain"
      />
    </div>
  );
}

export default function Sponsors() {
  return (
    <section
      id="sponsors"
      aria-labelledby="e27-sponsors-title"
      className="e27-section e27-section-bg overflow-hidden py-24 lg:py-32"
      style={{ containIntrinsicSize: "auto 640px" }}
    >
      <Reveal className="px-4 text-center">
        <h2 id="e27-sponsors-title" className="e27-heading text-4xl sm:text-6xl">
          Previous <span className="text-white">sponsors</span>
        </h2>
      </Reveal>

      <div className="mt-14 flex flex-col gap-5">
        <Marquee label="Previous sponsors, row 1" duration={55}>
          {ROW_A.map((f, i) => (
            <Tile key={f} file={f} index={i} />
          ))}
        </Marquee>
        <Marquee label="Previous sponsors, row 2" duration={55} reverse>
          {ROW_B.map((f, i) => (
            <Tile key={f} file={f} index={i + half} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}