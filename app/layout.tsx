import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { ConditionalNav } from '@/components/conditional-nav'
import { Footer } from '@/components/footer'
import { sukhumvitSet } from './fonts'

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
    <html lang="es">
      <body className={`${sukhumvitSet.className} antialiased`}>
        <Providers>
          <ConditionalNav />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
