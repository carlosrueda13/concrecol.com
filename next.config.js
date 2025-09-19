/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  experimental: {
    serverActions: true
  },
  images: {
    unoptimized: true,
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      'user-images.githubusercontent.com',
      'avatars.githubusercontent.com',
      'camo.githubusercontent.com',
      'rawgithub.com',
      'raw.githack.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'unsplash.com',
      'concrecol.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rawgithub.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githack.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      }
    ],
  }
}

module.exports = nextConfig
