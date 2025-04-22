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
    }, {
      protocol: "https",
      hostname: "www.sportsdirect.com",
      port: "",
      pathname: "/**"
    }, {
      protocol: "https",
      hostname: "assets.digitalcontent.marksandspencer.app",
      port: "",
      pathname: "/**"
    }, {
      protocol: "http",
      hostname: "148.113.180.19",
      port: "",
      pathname: "/**"
    }]
  },
};

export default nextConfig;
