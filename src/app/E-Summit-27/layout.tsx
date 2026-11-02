
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./e27.css";
import NavBar27 from "@/components/E-Summit-27/NavBar27";
import Footer27 from "@/components/E-Summit-27/Footer27";
import SiteCubes from "@/components/E-Summit-27/SiteCubes";

// Only the weights actually used on the page.
const lora = localFont({
  src: [
    { path: "../../../public/E-Summit-27/fonts/lora-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../public/E-Summit-27/fonts/lora-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--e27-font-heading",
});

const poppins = localFont({
  src: [
    { path: "../../../public/E-Summit-27/fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../../public/E-Summit-27/fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../../public/E-Summit-27/fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--e27-font-body",
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
    <div className={`e27-root dark ${lora.variable} ${poppins.variable}`}>
      <SiteCubes />
      <NavBar27 />
      <div className="e27-site-content">
        {children}
        <Footer27 />
      </div>
    </div>
  );
}
