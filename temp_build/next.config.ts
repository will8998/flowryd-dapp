import type { NextConfig } from "next";

// Use default Next.js output directory (".next") for Vercel compatibility
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
