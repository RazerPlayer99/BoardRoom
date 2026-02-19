import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/BoardRoom",
  images: { unoptimized: true },
};

export default nextConfig;
