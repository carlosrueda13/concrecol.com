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

  // En la pagina de la linea de concreto, usamos el ScrollNav con el boton de cotizar
  if (pathname === '/lineas/concreto') {
    return <ScrollNav textoBoton="Cotizar" hrefBoton="/cotizacion?linea=CONCRETO" />
  }

  // En la pagina de la linea de agregados, usamos el ScrollNav con el boton de cotizar
  if (pathname === '/lineas/agregados') {
    return <ScrollNav textoBoton="Cotizar" hrefBoton="/cotizacion?linea=AGREGADOS" />
  }

  // En la pagina de la linea de prefabricados, usamos el ScrollNav con el boton de cotizar
  if (pathname === '/lineas/prefabricados') {
    return <ScrollNav textoBoton="Cotizar" hrefBoton="/cotizacion?linea=PREFABRICADOS" />
  }
  
  // En cualquier otra pagina, usamos el MainNav tradicional
  return <MainNav />
}