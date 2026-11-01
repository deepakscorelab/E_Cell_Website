import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  // This dedicated preview is hosted at the domain root, without the campus reverse proxy.
  env: { NEXT_PUBLIC_ESUMMIT_PREFIX: "" },
  outputFileTracingRoot: path.join(__dirname, ".."),
  turbopack: { root: path.join(__dirname, "..") },
  images: { unoptimized: true },
};
export default config;
