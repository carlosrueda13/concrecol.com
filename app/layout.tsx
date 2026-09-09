import type { Metadata } from 'next'
import { Archivo_Black, Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/app/providers'
import { ConditionalNav } from '@/components/conditional-nav'
import { Footer } from '@/components/footer'
import { ConsentBanner } from '@/components/consent-banner'
import PantallaCarga from '@/components/pantalla-carga'
import { sukhumvitSet } from './fonts'
import { validateDevEnv } from '@/lib/env-validation'

// Referencia inerte: conserva el import de Sukhumvit sin aplicarlo al DOM
// (evita el warning de variable sin uso sin generar clases ni estilos).
void sukhumvitSet

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-titulo',
  display: 'swap',
})

const inter = Inter({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-texto',
  display: 'swap',
})

// Validar env vars al inicio
if (typeof window === 'undefined') {
  validateDevEnv()
}

export const metadata: Metadata = {
  title: 'Concrecol - Construimos confianza, entregamos concreto',
  description: 'Planta de concreto en Colombia - Materiales de construcción y concreto de alta calidad',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // For the root layout, we'll check the pathname in the admin layout instead
  return (
    <html lang="es" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body className="font-texto antialiased">
        <PantallaCarga />
        <Providers>
          <ConditionalNav />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <ConsentBanner />
        </Providers>
      </body>
    </html>
  )
}
