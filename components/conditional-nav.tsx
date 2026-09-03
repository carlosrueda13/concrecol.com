'use client'

import { usePathname } from 'next/navigation'
import { MainNav } from '@/components/main-nav'
import { ScrollNav } from '@/components/scroll-nav'

export function ConditionalNav() {
  const pathname = usePathname()
  
  // En la pagina de inicio, usamos el ScrollNav
  if (pathname === '/') {
    return <ScrollNav />
  }

  // En la pagina de constructora, usamos el ScrollNav con el boton de contacto
  if (pathname === '/lineas/constructora') {
    return <ScrollNav textoBoton="Contactar" hrefBoton="/contacto" />
  }
  
  // En cualquier otra pagina, usamos el MainNav tradicional
  return <MainNav />
}