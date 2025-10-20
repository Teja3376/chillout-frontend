import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // ✅ ensures predictable serverless output for Vercel
  experimental: {
    turbo: {}, // ✅ disable Turbopack for production stability
  },
};

export default nextConfig;