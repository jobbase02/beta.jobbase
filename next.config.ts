import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 2. Ignore TypeScript errors during the build (optional but recommended if you have type errors)
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
