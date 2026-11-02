import { Mail, Phone } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";
import Reveal from "../Reveal";
import { CONTACT_EMAILS, COORDINATORS } from "@/context/E-Summit-27/constants";
import { headMembers } from "@/context/E-Summit-27/TeamData";

// The Sponsorship Heads from the team data (currently two).
const SPONSOR_HEADS = headMembers.filter((m) => m.position.toLowerCase().includes("sponsorship"));

export default function BecomeSponsor() {
  return (
    // Not e27-section: this is an anchor target, so it should never be content-visibility-skipped.
    <section
      id="become-a-sponsor"
      aria-labelledby="e27s-cta-title"
      className="scroll-mt-20 px-4 pb-24 pt-8 sm:px-6 lg:px-8"
    >
      <Reveal>
        <div className="e27-card relative mx-auto max-w-6xl overflow-hidden px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h2
                id="e27s-cta-title"
                className="font-[family-name:var(--e27-font-heading)] text-4xl leading-tight text-white sm:text-5xl"
              >
                Let&apos;s light the <span className="e27-accent">fire</span> together.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-[var(--e27-muted)]">
                Tell us what your brand wants to achieve and we&apos;ll shape a package around it.
              </p>
              <div className="mt-8 flex flex-col items-start gap-3">
                {CONTACT_EMAILS.map((email, index) => (
                  <a
                    key={email}
                    href={`mailto:${email}?subject=${encodeURIComponent("E-Summit'27 Sponsorship")}`}
                    className={`e27-btn max-w-full text-left ${index === 0 ? "e27-btn-primary" : "e27-btn-ghost"}`}
                  >
                    <Mail size={16} className="shrink-0" aria-hidden="true" />
                    <span className="break-all">{email}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[var(--e27-lavender)]">
                  Your points of contact
                </h3>
                <ul className="space-y-3">
                  {SPONSOR_HEADS.map((m) => (
                    <li
                      key={m.email || m.name}
                      className="flex items-center justify-between gap-4 e27-glass e27-glass-inset rounded-2xl px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{m.name}</p>
                        <p className="text-xs text-white/65">{m.position}</p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {m.linkedin && (
                          <a
                            href={m.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${m.name} on LinkedIn`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(245,212,254,0.35)] text-[var(--e27-lavender)] transition-transform hover:-translate-y-0.5"
                          >
                            <FaLinkedinIn size={15} aria-hidden="true" />
                          </a>
                        )}
                        {m.email && (
                          <a
                            href={`mailto:${m.email}`}
                            aria-label={`Email ${m.name}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(245,212,254,0.35)] text-[var(--e27-lavender)] transition-transform hover:-translate-y-0.5"
                          >
                            <Mail size={16} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[var(--e27-lavender)]">
                  Overall Coordinators
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {COORDINATORS.map((c) => (
                    <li key={c.name}>
                      <a
                        href={`tel:${c.phoneTel}`}
                        aria-label={`Call ${c.name}, ${c.phoneDisplay}`}
                        className="flex items-center gap-3 e27-glass e27-glass-inset rounded-2xl px-4 py-3 transition-transform hover:-translate-y-0.5"
                      >
                        <Phone size={16} className="shrink-0 text-[var(--e27-bright)]" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white">{c.name}</span>
                          <span className="block text-xs text-white/65">{c.phoneDisplay}</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
