
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./e27.css";
import NavBar27 from "@/components/E-Summit-27/NavBar27";
import Footer27 from "@/components/E-Summit-27/Footer27";
import SiteBackground from "@/components/E-Summit-27/SiteBackground";
import ScrollProgress from "@/components/E-Summit-27/ScrollProgress";
import { EVENT_DATES } from "@/context/E-Summit-27/constants";

// One self-hosted Fontsource family for consistent, professional typography.
const manrope = localFont({
  src: "../../../public/E-Summit-27/fonts/manrope-latin-wght-normal.woff2",
  weight: "200 800",
  style: "normal",
  display: "swap",
  variable: "--e27-font-body",
});

const devanagari = localFont({
  src: "../../../public/E-Summit-27/fonts/noto-sans-devanagari-devanagari-500-normal.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--e27-font-hindi",
});

export const metadata: Metadata = {
  title: "E-Summit'27 | Igniting the Unwritten | IIT Ropar",
  description:
    `Join E-Summit'27 on ${EVENT_DATES} at IIT Ropar — keynotes, workshops, competitions and startup showcases at E-Cell's flagship entrepreneurship summit.`,
};

export const viewport: Viewport = {
  themeColor: "#050008",
  colorScheme: "dark",
};

export default function ESummit27Layout({ children }: { children: React.ReactNode }) {
  return (
    // Providers (AuthProvider, data context) go here later, wrapping this div.
    <div className={`e27-root dark ${manrope.variable} ${devanagari.variable}`}>
      <SiteBackground />
      <NavBar27 />
      <ScrollProgress />
      <div className="e27-site-content">
        {children}
        <Footer27 />
      </div>
    </div>
  );
}
