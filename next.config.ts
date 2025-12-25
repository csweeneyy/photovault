import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // Allow all Supabase project subdomains
      },
    ],
  },
};

export default nextConfig;
