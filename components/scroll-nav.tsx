'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MainNav } from '@/components/main-nav'

export function ScrollNav() {
  const [isCompactVisible, setIsCompactVisible] = useState(false)

  useEffect(() => {
    // Optimizamos para evitar demasiadas recalculaciones al hacer scroll
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // Mostrar la barra compacta solo tras superar la estructura principal (40 + 72 = 112px)
        setIsCompactVisible(window.scrollY > 112)
      }, 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    const initialCheck = setTimeout(handleScroll, 100)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
      clearTimeout(initialCheck)
    }
  }, [])

  return (
    <>
      {/* Estructura principal reutilizada (barra de contacto + navegación principal) */}
      <MainNav sticky={false} />

      {/* Barra compacta fija (56px) visible solo tras superar la estructura principal */}
      {isCompactVisible && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-grisCon animate-fadeIn h-14">
          <div className="container mx-auto px-4 h-full flex justify-between items-center">
            <Link href="/" className="font-titulo text-blanco text-xl leading-none">
              Concrecol
            </Link>
            <Button
              asChild
              className="bg-lima text-grisCon hover:bg-lima/90 h-10"
            >
              <Link href="/cotizacion">Cotizar</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
