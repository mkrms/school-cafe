import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/kitchen/qr-reader",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "localhost:1338",
      },
    ],
  },

  webpack: (config) => {
    // Disable minification
    config.optimization.minimize = false;

    return config;
  },
};

export default nextConfig;
