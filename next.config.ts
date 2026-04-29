import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.BUILD_TARGET === "android" && { output: "export" }),
  allowedDevOrigins: ["192.168.1.124"],
  reactCompiler: true,
  images: {
    unoptimized: process.env.BUILD_TARGET === "android",
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    qualities: [70, 75],
  },
};

export default nextConfig;
