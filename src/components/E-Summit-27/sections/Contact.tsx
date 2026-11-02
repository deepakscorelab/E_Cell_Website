import { Mail, Phone } from "lucide-react";
import Reveal from "../Reveal";
import { CONTACT_EMAIL, CONTACT_EMAILS, COORDINATORS } from "@/context/E-Summit-27/constants";
import "./EditorialSections.css";

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="e27-contact-title"
      className="e27-section px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
      style={{ containIntrinsicSize: "auto 650px" }}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 id="e27-contact-title" className="e27-heading text-4xl sm:text-6xl">
            Contact <span className="text-white">us</span>
          </h2>
        </Reveal>

        <Reveal className="mt-10 sm:mt-12">
          <div className="e27-card e27-contact-panel">
            <div className="e27-contact-email">
              <p className="text-sm text-[var(--e27-muted)]">Email</p>
              {CONTACT_EMAILS.map((email) => (
                <a key={email} href={`mailto:${email}`} className="e27-contact-address">
                  {email}
                </a>
              ))}
              <a href={`mailto:${CONTACT_EMAIL}`} className="e27-btn e27-btn-primary mt-6">
                <Mail size={16} aria-hidden="true" /> Send an email
              </a>
            </div>

            <div className="e27-contact-coordinators">
              <h3 className="text-lg text-white">Overall Coordinators</h3>
              <ul className="e27-contact-list">
                {COORDINATORS.map((c) => (
                  <li key={c.name}>
                    <div>
                      <h4 className="font-semibold text-white">{c.name}</h4>
                      <p className="mt-1 text-sm text-[var(--e27-muted)]">{c.phoneDisplay}</p>
                    </div>
                    <a href={`tel:${c.phoneTel}`} className="e27-contact-call" aria-label={`Call ${c.name}`}>
                      <Phone size={16} aria-hidden="true" /><span>Call</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
