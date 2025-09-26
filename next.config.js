/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Eliminar output: 'export' para funcionalidad completa del servidor
  basePath: process.env.NODE_ENV === 'production' ? '/concrecol.com' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/concrecol.com' : '',
  
  experimental: {
    serverActions: true
  },
  
  // ✅ Headers de seguridad mejorados
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ]
  },
  
  images: {
    unoptimized: true,
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'githubusercontent.com',
      'concrecol.com',
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
        pathname: '/**',
      }
    ],
  }
}

module.exports = nextConfig
