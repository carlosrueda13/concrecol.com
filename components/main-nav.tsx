'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, Phone, MapPin, Mail } from 'lucide-react'
import { BotonCotizar } from '@/components/boton-cotizar'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Concreto', href: '/lineas/concreto' },
  { label: 'Agregados', href: '/lineas/agregados' },
  { label: 'Constructora', href: '/lineas/constructora' },
  { label: 'Prefabricados', href: '/lineas/prefabricados' },
  { label: 'Ubicación', href: '/#ubicacion' },
]

export function MainNav({ sticky = true }: { sticky?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className={`bg-white shadow-sm z-50 ${sticky ? 'sticky top-0' : ''}`}>
      {/* Barra de contacto: franja superior 12px + barra útil 56px (conjunto gris 68px) */}
      <div className="bg-grisCon text-blanco">
        <div className="container mx-auto px-4">
          <div className="h-[12px]" aria-hidden="true" />
          <div className="flex h-14 items-center justify-between text-texto">
            <div className="flex items-center gap-2 min-w-0">
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-blanco hover:bg-white/10 hover:text-blanco text-texto"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">xxx xxx xxxx</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-2 text-blanco hover:bg-white/10 hover:text-blanco text-texto"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">gerencia@concrecol.co</span>
              </Button>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>San Gil, Santander</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación principal (88px) */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-[88px]">
          {/* Logo 180x48 */}
          <Link href="/" className="flex items-center w-[180px] h-[48px] shrink-0">
            <img
              src="/images/Property 1=Default-1.png"
              alt="Concrecol Logo"
              className="w-full h-full object-contain"
            />
          </Link>

          {/* Navegación de escritorio */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Navegación principal">
            {NAV_ITEMS.map((item) => (
              <Link key={item.label} href={item.href} className="text-gray-700 hover:text-lima">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acciones a la derecha: Cotizar y menú móvil */}
          <div className="flex items-center gap-3">
            <BotonCotizar
              asChild
              className="hidden md:inline-flex w-[180px] h-[52px]"
            >
              <Link href="/cotizacion">Cotizar</Link>
            </BotonCotizar>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMenu}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4">
              <Link
                href="/"
                className="flex items-center w-[180px] h-[48px]"
                onClick={toggleMenu}
              >
                <img
                  src="/images/Property 1=Default-1.png"
                  alt="Concrecol Logo"
                  className="w-full h-full object-contain"
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4 p-4" aria-label="Navegación móvil">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 text-lg py-2 border-b border-gray-100"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
              <BotonCotizar asChild className="w-full h-[44px] mt-2">
                <Link href="/cotizacion" onClick={toggleMenu}>
                  Cotizar
                </Link>
              </BotonCotizar>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
