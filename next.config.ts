import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// Wrap analyzer first, then Sentry
const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true, // required for Sentry
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.iran.liara.run",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withSentryConfig(
  withAnalyzer(nextConfig),
  {
    org: "get-noticed",
    project: "optisage-staging",
    silent: !process.env.CI,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    disableLogger: true,
    automaticVercelMonitors: true,
  }
);
