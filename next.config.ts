import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid picking a parent folder lockfile when tracing (e.g. extra package-lock in home).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
