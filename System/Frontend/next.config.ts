import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'https://makerspace-system-backend.onrender.com/api',
  },
};

export default nextConfig;