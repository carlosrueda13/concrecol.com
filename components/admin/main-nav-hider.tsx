'use client'

import { useEffect } from 'react'

export function MainNavHider() {
  useEffect(() => {
    // Hide the main navigation and footer when the admin section is loaded
    const mainNav = document.querySelector('header:not(.admin-header)')
    const footer = document.querySelector('footer')

    if (mainNav) (mainNav as HTMLElement).style.display = 'none'
    if (footer) (footer as HTMLElement).style.display = 'none'

    // Clean up when component unmounts
    return () => {
      if (mainNav) (mainNav as HTMLElement).style.display = ''
      if (footer) (footer as HTMLElement).style.display = ''
    }
  }, [])
  
  return null
}
