'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/cart-provider'

export function MainNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cart } = useCart()
  
  const cartItemsCount = cart?.items?.length || 0

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/images/Property 1=Default-1.png" 
              alt="Concrecol Logo" 
              className="h-8"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-[#C4D600]">
              Inicio
            </Link>
            <Link href="/productos" className="text-gray-700 hover:text-[#C4D600]">
              Productos
            </Link>
            <Link href="/sobre-nosotros" className="text-gray-700 hover:text-[#C4D600]">
              Sobre Nosotros
            </Link>
            <Link href="/proyectos" className="text-gray-700 hover:text-[#C4D600]">
              Nuestros Proyectos
            </Link>
            <Link href="/contacto" className="text-gray-700 hover:text-[#C4D600]">
              Contacto
            </Link>
          </nav>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/carrito" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#C4D600] text-[#4D4D4D] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4">
              <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                <img 
                  src="/images/Property 1=Default-1.png" 
                  alt="Concrecol Logo" 
                  className="h-8"
                />
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex flex-col space-y-4 p-4">
              <Link 
                href="/" 
                className="text-gray-700 text-lg py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                href="/productos" 
                className="text-gray-700 text-lg py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              <Link 
                href="/sobre-nosotros" 
                className="text-gray-700 text-lg py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
              <Link 
                href="/proyectos" 
                className="text-gray-700 text-lg py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Nuestros Proyectos
              </Link>
              <Link 
                href="/contacto" 
                className="text-gray-700 text-lg py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link 
                href="/carrito" 
                className="flex items-center text-gray-700 text-lg py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Carrito
                {cartItemsCount > 0 && (
                  <span className="ml-2 bg-[#C4D600] text-[#4D4D4D] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
