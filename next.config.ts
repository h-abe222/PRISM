import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'puppeteer-core',
    '@sparticuz/chromium-min',
  ],
  // Include font files in the deployment
  outputFileTracingIncludes: {
    '/api/**/*': ['./fonts/**/*'],
  },
  // Allow images from external domains
  images: {
    domains: ['localhost', 'prism-vip.vercel.app'],
  },
};

export default nextConfig;
