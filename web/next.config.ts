import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp"],
  devIndicators: false,
  // lib/chogs.ts reads the metadata snapshot at runtime, which the tracer can't see; ship it with every
  // route. The local image cache is rebuilt on demand and never shipped.
  outputFileTracingIncludes: { "/**": ["./data/chogs.json"] },
  outputFileTracingExcludes: { "/**": ["./.cache/**"] },
};

export default nextConfig;
