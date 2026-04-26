import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
// import withPWA from "next-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "development",
  },
  webpack: (config) => {
    config.cache = {
      type: "filesystem",
      buildDependencies: {
        config: [resolve(__dirname, "next.config.mjs")],
      },
      cacheDirectory: resolve(__dirname, ".next/cache/webpack"),
    };
    return config;
  },
  async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "no-cache, no-store, must-revalidate",
            },
          ],
        },
        {
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
      ];
    },
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};