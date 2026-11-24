import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The docs live under /components (shareable, stable URLs); the root is the catalogue.
  async redirects() {
    return [{ source: "/", destination: "/components", permanent: false }];
  },
};

export default nextConfig;
