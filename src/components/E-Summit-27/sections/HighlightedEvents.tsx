import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Reveal from "../Reveal";
import { highlightedEvents } from "@/context/E-Summit-27/homeData";
import { BASE } from "@/context/E-Summit-27/constants";

export default function HighlightedEvents() {
  return (
    <section
      id="events"
      aria-labelledby="e27-events-title"
      className="e27-section e27-section-bg px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      style={{ containIntrinsicSize: "auto 1100px" }}
    >
      <div className="mx-auto max-w-7xl">
        <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 id="e27-events-title" className="e27-heading text-4xl sm:text-6xl">
              Highlighted <span className="text-white">events</span>
            </h2>
          </div>
          <Link href={`${BASE}/events`} className="e27-btn e27-btn-ghost">
            View all events <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Reveal>

        <ul className="e27-event-grid">
          {highlightedEvents.map((ev, i) => (
            <li key={ev.title}>
              <Reveal delay={(i % 3) * 0.07} className="h-full">
                <Link
                  href={`${BASE}${ev.href}`}
                  className="e27-card e27-event-card group"
                >
                  <div className="flex items-center justify-between">
                    <span className="e27-event-category">
                      {ev.tag}
                    </span>
                  </div>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                  <span className="e27-event-link">
                    Learn more
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}