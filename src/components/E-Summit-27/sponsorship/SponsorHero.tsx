import { ArrowDown, Download } from "lucide-react";
import { BROCHURE_URL } from "@/context/E-Summit-27/sponsorData";

export default function SponsorHero() {
  return (
    <section aria-labelledby="e27s-hero-title" className="e27s-hero px-4 pb-24 pt-28 sm:px-6 sm:pb-32 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center text-center">
        <p className="e27-label e27-rise">Partner with E-Summit&apos;27</p>

        <h1
          id="e27s-hero-title"
          className="e27-heading e27-rise e27-delay-1 mt-6 text-[3.2rem] min-[400px]:text-6xl sm:text-8xl lg:text-9xl"
        >
          Our <span className="text-white">Sponsors</span>
        </h1>

        <p className="e27-rise e27-delay-2 mt-6">
          <span className="e27-accent text-sm font-medium uppercase tracking-[0.4em] sm:text-base">
            Light the fire with us
          </span>
        </p>

        <p className="e27-rise e27-delay-3 mt-6 max-w-2xl text-base leading-7 text-[var(--e27-muted)] sm:text-lg">
          E-Summit at IIT Ropar brings students, founders and investors from across India into one arena. Partner with us
          to put your brand where the next generation of builders is deciding what to create, and who to create it with.
        </p>

        <div className="e27-rise e27-delay-4 mt-9 flex flex-wrap items-center justify-center gap-3">
          <a href="#become-a-sponsor" className="e27-btn e27-btn-primary">
            Become a Sponsor <ArrowDown size={16} aria-hidden="true" />
          </a>
          {BROCHURE_URL && (
            <a
              href={BROCHURE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="e27-btn e27-btn-ghost"
              aria-label="Download the sponsorship brochure (PDF)"
            >
              <Download size={16} aria-hidden="true" /> Download Brochure
            </a>
          )}
        </div>
      </div>
    </section>
  );
}