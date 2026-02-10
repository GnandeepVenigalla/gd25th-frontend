import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com', // Allow all Amazon S3 buckets
      },
    ],
  },
};

export default nextConfig;
