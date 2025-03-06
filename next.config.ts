import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "avatar.iran.liara.run",
      port: "",
      pathname: "/**"
    },{
      protocol: "https",
      hostname: "flagcdn.com",
      port: "",
      pathname: "/**"
    }, {
      protocol: "https",
      hostname: "m.media-amazon.com",
      port: "",
      pathname: "/**"
    }]
  },
};

export default nextConfig;
