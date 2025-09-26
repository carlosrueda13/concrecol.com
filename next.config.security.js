// next.config.js - Configuración de seguridad mejorada
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
]

// Solo agregar HSTS en producción
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  })
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Redirecciones de seguridad
  async redirects() {
    return [
      // Prevenir acceso directo a archivos sensibles
      {
        source: '/.env:path*',
        destination: '/404',
        permanent: false,
      },
      {
        source: '/config:path*',
        destination: '/404',
        permanent: false,
      },
    ]
  },

  // Configuración de imágenes segura
  images: {
    domains: ['concrecol-co.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },

  // Desactivar powered-by header
  poweredByHeader: false,

  // Configuración de compilación segura
  compiler: {
    // Remover console.logs en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Variables de entorno públicas seguras
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig