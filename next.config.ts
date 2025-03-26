/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      optimizePackageImports: ["@heroicons/react"],
    },
  },
  images: {
    domains: ["jbnado.dev"],
    formats: ["image/avif", "image/webp"],
  },
};
