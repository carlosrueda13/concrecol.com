'use client'

import { useEffect } from 'react'

export function AdminBodyClass() {
  useEffect(() => {
    // Add the admin-page class to the body
    document.body.classList.add('admin-page')
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('admin-page')
    }
  }, [])
  
  return null
}
