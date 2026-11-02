import { Mail, Phone } from "lucide-react";
import Reveal from "../Reveal";
import { CONTACT_EMAIL, COORDINATORS } from "@/context/E-Summit-27/constants";

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="e27-contact-title"
      className="e27-section px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      style={{
        containIntrinsicSize: "auto 700px",
        background:
          "radial-gradient(55% 60% at 50% 100%, rgba(98,17,191,0.35), transparent 70%)",
      }}
    >
      <div className="mx-auto max-w-5xl text-center">
        <Reveal>
          <p className="e27-label mb-4">Get in touch</p>
          <h2 id="e27-contact-title" className="e27-heading text-4xl sm:text-6xl">
            Contact <span className="text-white">us</span>
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-12">
          <div className="e27-card mx-auto flex max-w-xl flex-col items-center p-8">
            <span className="e27-label">Email</span>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 break-all font-[family-name:var(--e27-font-heading)] text-2xl text-white sm:text-3xl"
            >
              {CONTACT_EMAIL}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="e27-btn e27-btn-primary mt-6">
              <Mail size={16} aria-hidden="true" /> Send an email
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.14} className="mt-6">
          <p className="e27-label mb-5">Overall Coordinators</p>
          <ul className="grid gap-5 sm:grid-cols-2">
            {COORDINATORS.map((c) => (
              <li key={c.name} className="e27-card flex flex-col items-center p-7">
                <h3 className="text-lg font-semibold text-white">{c.name}</h3>
                <p className="mt-1 text-sm text-[var(--e27-muted)]">{c.phoneDisplay}</p>
                <a href={`tel:${c.phoneTel}`} className="e27-btn e27-btn-ghost mt-5" aria-label={`Call ${c.name}`}>
                  <Phone size={16} aria-hidden="true" /> Call
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}