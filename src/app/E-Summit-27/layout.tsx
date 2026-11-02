
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./e27.css";
import NavBar27 from "@/components/E-Summit-27/NavBar27";
import Footer27 from "@/components/E-Summit-27/Footer27";
import SiteCubes from "@/components/E-Summit-27/SiteCubes";

// Fontsource WOFF2 subsets: self-hosted, one file per active family.
const spaceGrotesk = localFont({
  src: "../../../public/E-Summit-27/fonts/space-grotesk-latin-wght-normal.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--e27-font-heading",
});

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
    "E-Summit'27, the flagship entrepreneurship summit of E-Cell IIT Ropar — keynotes, workshops, competitions and startup showcases.",
};

export const viewport: Viewport = {
  themeColor: "#050008",
  colorScheme: "dark",
};

export default function ESummit27Layout({ children }: { children: React.ReactNode }) {
  return (
    // Providers (AuthProvider, data context) go here later, wrapping this div.
    <div className={`e27-root dark ${spaceGrotesk.variable} ${manrope.variable} ${devanagari.variable}`}>
      <SiteCubes />
      <NavBar27 />
      <div className="e27-site-content">
        {children}
        <Footer27 />
      </div>
    </div>
  );
}
