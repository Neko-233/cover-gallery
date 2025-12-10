import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // allow all local images
    unoptimized: false,
  },
};

export default nextConfig;
