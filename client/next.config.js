/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: true,
  }
};

module.exports = nextConfig; 