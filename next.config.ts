import type { NextConfig } from "next";

// public storage images are served through next/image from Step 22 on.
const remotePatterns: {
  protocol: "https";
  hostname: string;
  pathname: string;
}[] = [];

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  try {
    const parsed = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    remotePatterns.push({
      protocol: "https",
      hostname: parsed.hostname,
      pathname: "/storage/v1/object/public/**",
    });
  } catch {
    // Falls back to no pattern if URL is invalid
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75, 90],
    ...(remotePatterns.length > 0 ? { remotePatterns } : {}),
  },
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
