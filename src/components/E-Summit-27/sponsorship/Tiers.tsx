import { Check, Mail } from "lucide-react";
import Reveal from "../Reveal";
import { CONTACT_EMAIL } from "@/context/E-Summit-27/constants";
import { SPONSOR_TIERS } from "@/context/E-Summit-27/sponsorData";
import type { SponsorTier } from "@/context/E-Summit-27/sponsorData";

const enquireHref = (tier: string) =>
  `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`E-Summit'27 Sponsorship Enquiry: ${tier}`)}`;

function TierCard({ tier }: { tier: SponsorTier }) {
  const featured = !!tier.featured;
  return (
    <article
      className={`relative flex h-full flex-col p-7 sm:p-8 ${featured ? "e27-card e27s-featured" : "e27-card e27-tilt-card"}`}
    >
      {featured && <span className="e27s-ribbon">Most visibility</span>}

      <h3
        className={`font-[family-name:var(--e27-font-heading)] text-white ${featured ? "pr-28 text-3xl sm:text-4xl" : "text-2xl"}`}
      >
        {tier.name}
      </h3>
      <p className="mt-2 text-sm text-[var(--e27-lavender)]/85">{tier.tagline}</p>

      <div className="my-6 h-px bg-gradient-to-r from-[var(--e27-line)] to-transparent" aria-hidden="true" />

      <ul className={`flex-1 space-y-3 ${featured ? "sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 sm:space-y-0" : ""}`}>
        {tier.benefits.map((b) => (
          <li key={b} className="flex gap-3 text-sm leading-6 text-[var(--e27-muted)]">
            <Check size={18} className="mt-0.5 shrink-0 text-[var(--e27-bright)]" aria-hidden="true" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <a
        href={enquireHref(tier.name)}
        className={`e27-btn mt-8 self-start ${featured ? "e27-btn-primary" : "e27-btn-ghost"}`}
        aria-label={`Enquire about ${tier.name}`}
      >
        <Mail size={16} aria-hidden="true" /> Enquire
      </a>
    </article>
  );
}

export default function Tiers() {
  const featured = SPONSOR_TIERS.filter((t) => t.featured);
  const others = SPONSOR_TIERS.filter((t) => !t.featured);
  // With an odd number of other tiers, the last one spans the full row on tablets (no orphan card).
  const oddOthers = others.length % 2 === 1;

  return (
    <section
      aria-labelledby="e27s-tiers-title"
      className="e27-section px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      style={{ containIntrinsicSize: "auto 1400px" }}
    >
      <div className="mx-auto max-w-7xl">
        <Reveal className="text-center">
          <h2 id="e27s-tiers-title" className="e27-heading text-3xl sm:text-5xl">
            Choose your <span className="text-white">flame</span>
          </h2>
        </Reveal>

        {/* Featured tier on its own full-width row, the rest in a readable 3-column row below.
            (A single 5-column row made every card ~120–170px wide at laptop sizes.) */}
        <Reveal delay={0.06} className="mt-12 space-y-5">
          {featured.length > 0 && (
            <ul className="grid gap-5">
              {featured.map((t) => (
                <li key={t.id}>
                  <TierCard tier={t} />
                </li>
              ))}
            </ul>
          )}

          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {others.map((t, i) => (
              <li key={t.id} className={oddOthers && i === others.length - 1 ? "md:col-span-2 lg:col-span-1" : ""}>
                <TierCard tier={t} />
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-8 text-center text-sm text-white/65">Packages are customised. Reach out for the full deck.</p>
      </div>
    </section>
  );
}