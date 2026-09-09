'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MainNav } from '@/components/main-nav'
import { BotonCotizar } from '@/components/boton-cotizar'

// Diagonal notch: 10px at the top-left corner and 20px at the bottom-right
// corner. All other corners stay square. Reused by the front and its shadow.
const CLIP_PATH =
  'polygon(10px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 10px)'

export function ScrollNav({
  textoBoton = 'Cotizar',
  hrefBoton = '/cotizacion',
}: {
  textoBoton?: string
  hrefBoton?: string
}) {
  const [isCompactVisible, setIsCompactVisible] = useState(false)

  useEffect(() => {
    // Optimizamos para evitar demasiadas recalculaciones al hacer scroll
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        // Mostrar la barra compacta solo tras superar la estructura principal (40 + 72 = 112px)
        const y = window.scrollY ?? document.documentElement.scrollTop ?? 0
        setIsCompactVisible(y > 112)
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
      {/* Estructura principal reutilizada (barra de contacto + navegacion principal) */}
      <MainNav sticky={false} />

      {/* Barra compacta flotante (72px) visible solo tras superar la estructura principal */}
      {isCompactVisible && (
        <div className="fixed top-4 left-6 right-6 z-50 animate-fadeIn">
          <div className="relative mx-auto w-full max-w-[1200px]">
            {/* Sombra: capa hermana absoluta detras del frente, negra, solida,
                sin blur, con el mismo clip-path y desplazada 8px abajo y 8px
                a la derecha. No intercepta eventos. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 translate-x-2 translate-y-2 pointer-events-none"
              style={{ clipPath: CLIP_PATH, backgroundColor: '#000000' }}
            />
            {/* Frente: fondo grisCon al 90% con backdrop-blur y clip-path */}
            <div
              className="relative z-10 h-[72px] bg-grisCon/90 backdrop-blur"
              style={{ clipPath: CLIP_PATH }}
            >
              <div className="container mx-auto px-6 h-full flex justify-between items-center gap-3">
                <Link href="/" className="flex items-center min-w-0 h-10">
                  <Image
                    src="/logo-hero.png"
                    alt="Concrecol"
                    width={190}
                    height={40}
                    className="max-h-10 w-auto max-w-full"
                  />
                </Link>
                <BotonCotizar asChild className="shrink-0">
                  <Link href={hrefBoton}>{textoBoton}</Link>
                </BotonCotizar>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
