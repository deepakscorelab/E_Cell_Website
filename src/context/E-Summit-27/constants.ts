/**
 * E-Summit'27 — single source of truth for paths and event constants.
 * Change PREFIX here and every link + image follows.
 */

/**
 * Production is served behind /e-cell/ (same as the old E-Summit site).
 * `npm run dev` serves the page at /E-Summit-27, so no prefix there.
 * Dedicated preview builds set NEXT_PUBLIC_ESUMMIT_PREFIX to an empty string.
 */
const PREFIX = process.env.NEXT_PUBLIC_ESUMMIT_PREFIX ?? (process.env.NODE_ENV === "production" ? "/e-cell" : "");

/** Internal route base used for all links. */
export const BASE = `${PREFIX}/E-Summit-27`;

/** Public folder base for static images in public/E-Summit-27/. */
export const ASSET_BASE = `${PREFIX}/E-Summit-27`;

/**
 * Returns the public URL of a file inside public/E-Summit-27/.
 * Full http(s) URLs (e.g. Cloudinary) are returned unchanged.
 */
export function asset(name: string): string {
  if (/^https?:\/\//.test(name)) return name;
  return `${ASSET_BASE}/${name.replace(/^\/+/, "")}`;
}

export const EVENT_NAME = "E-Summit'27";
export const TAGLINE = "IGNITING THE UNWRITTEN";

export const EVENT_DATES = "23–24 January 2027";
export const VENUE = "IIT Ropar";

// TODO: replace with the real registration route / form URL.
export const REGISTER_URL = `${BASE}/register`;

export const INSTITUTE_EN = "INDIAN INSTITUTE OF TECHNOLOGY, ROPAR";
export const INSTITUTE_HI = "भारतीय प्रौद्योगिकी संस्थान, रोपड़";

export type NavLink = { label: string; href: string };

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: `${BASE}` },
  { label: "Events", href: `${BASE}/events` },
  { label: "Merchandise", href: `${BASE}/merchandise` },
  { label: "Team", href: `${BASE}/team` },
  { label: "Sponsorship", href: `${BASE}/sponsorship` },
  { label: "Accommodation", href: `${BASE}/accommodation` },
  { label: "CA", href: `${BASE}/ca` },
  { label: "Contact", href: `${BASE}#contact` },
];

export const CONTACT_EMAILS = ["e-summit@iitrpr.ac.in", "ecell@iitrpr.ac.in"] as const;
export const CONTACT_EMAIL = CONTACT_EMAILS[0];

export type Coordinator = {
  name: string;
  phoneDisplay: string;
  phoneTel: string;
  image: string;
  linkedin: string;
  email: string;
};

// 2027 coordinator contacts; profiles from the existing E-Cell team directory.
// Team badges, homepage contacts and sponsorship contacts use this same roster.
export const COORDINATORS: Coordinator[] = [
  {
    name: "Chaitanya Kalme", phoneDisplay: "9098862300", phoneTel: "+919098862300",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1762323022/Chaitanya_-_Chaitanya_Kalme_abw78x.jpg",
    linkedin: "https://www.linkedin.com/in/chaitanya-kalme-1a610a346",
    email: "2023csb1112@iitrpr.ac.in",
  },
  {
    name: "Akash Muhal", phoneDisplay: "70231 01516", phoneTel: "+917023101516",
    image: "https://res.cloudinary.com/doxe1rjaj/image/upload/v1762323041/IMG-20250925-WA0026_-_Akash_Muhal_auu5pf.jpg",
    linkedin: "https://www.linkedin.com/in/akash-muhal-6aa074329?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    email: "2024mcb1286@iitrpr.ac.in",
  },
];
