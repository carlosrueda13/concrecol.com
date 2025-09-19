'use client'

import { usePathname } from 'next/navigation'
import { MainNav } from '@/components/main-nav'
import { ScrollNav } from '@/components/scroll-nav'

export function ConditionalNav() {
  const pathname = usePathname()
  
  // En la página de inicio, usamos el ScrollNav
  if (pathname === '/') {
    return <ScrollNav />
  }
  
  // En cualquier otra página, usamos el MainNav tradicional
  return <MainNav />
}