import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Avoid picking a parent folder lockfile when tracing (e.g. extra package-lock in home).
  outputFileTracingRoot: path.join(__dirname),
  // App Router `route.ts` için gövde limiti Pages `api.bodyParser` ile ayarlanmaz; platform (ör. Vercel ~4.5 MB) geçerlidir.
  // Server Actions ve olası ilgili limitler için:
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
