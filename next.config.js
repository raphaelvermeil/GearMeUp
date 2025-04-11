/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // This allows local images to work properly
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig;
