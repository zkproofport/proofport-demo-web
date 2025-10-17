/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", 
  experimental: {
    appDir: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;