import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components + Auth.js sessions fight each other (crypto during prerender).
  // Keep classic request-time rendering for the authenticated app.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
