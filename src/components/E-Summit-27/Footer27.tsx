"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { CONTACT_EMAILS, INSTITUTE_EN, NAV_LINKS, asset } from "@/context/E-Summit-27/constants";

export default function Footer27() {
  const isHome = usePathname().replace(/\/$/, "").endsWith("/E-Summit-27");
  return (
    <footer className="e27-footer border-t border-[var(--e27-line)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-5">
            <img src={asset("flame-logo.webp")} alt="" width={26} height={42} loading="lazy" decoding="async" className="h-10 w-auto" />
            {!isHome && <img src={asset("ecell-logo.webp")} alt="E-Cell IIT Ropar" width={110} height={44} loading="lazy" decoding="async" className="h-9 w-auto" />}
            {!isHome && <img src={asset("tbif-logo.webp")} alt="TBIF IIT Ropar" width={110} height={44} loading="lazy" decoding="async" className="h-9 w-auto" />}
            <img src={asset("iitr-emblem.webp")} alt="IIT Ropar" width={44} height={44} loading="lazy" decoding="async" className="h-10 w-auto" />
          </div>
          <p className="mt-5 text-sm font-medium tracking-[0.22em] text-white">
            E-SUMMIT <span className="e27-accent">27</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--e27-muted)]">{INSTITUTE_EN}</p>
          <ul className="mt-3 space-y-2">
            {CONTACT_EMAILS.map((email) => (
              <li key={email}>
                <a href={`mailto:${email}`} className="break-all text-sm text-[var(--e27-lavender)]">
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <p className="e27-label mb-4">Quick links</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-white/70 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs text-white/55">
        © {new Date().getFullYear()} E-Cell IIT Ropar. All rights reserved.
      </p>
    </footer>
  );
}
