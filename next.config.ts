import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The catalogue lives at the root; docs pages stay under /components/<slug>.
  // The old /components index URL redirects home.
  async redirects() {
    return [{ source: "/components", destination: "/", permanent: true }];
  },
};

export default nextConfig;
