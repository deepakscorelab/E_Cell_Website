import type { NextConfig } from "next";

const config: NextConfig = {
  // This dedicated preview is hosted at the domain root, without the campus reverse proxy.
  env: { NEXT_PUBLIC_ESUMMIT_PREFIX: "" },
  // The prepare step copies every required source and asset into this app.
  // Keep the legacy site's middleware and backend outside the build boundary.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  images: { unoptimized: true },
};
export default config;
