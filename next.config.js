/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    domains: [], // Add image domains here
  }
}

module.exports = nextConfig
