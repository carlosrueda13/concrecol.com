'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  
  useEffect(() => {
    // Check if consent has been given
    const checkConsent = async () => {
      try {
        const response = await fetch('/api/consent')
        const consent = await response.json()
        // Show banner if no explicit consent has been given
        if (!consent.analytics && !consent.marketing) {
          setShowBanner(true)
        }
      } catch (error) {
        setShowBanner(true) // Show banner on error
      }
    }
    
    checkConsent()
  }, [])
  
  const handleAcceptAll = async () => {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: true
      })
    })
    setShowBanner(false)
  }
  
  const handleAcceptNecessary = async () => {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false
      })
    })
    setShowBanner(false)
  }
  
  if (!showBanner) return null
  
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-white border shadow-lg">
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-600">
          Utilizamos cookies para mejorar tu experiencia. Las cookies necesarias están habilitadas por defecto.
        </p>
        <div className="flex gap-2 flex-col sm:flex-row">
          <Button 
            onClick={handleAcceptAll}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Aceptar todas
          </Button>
          <Button 
            onClick={handleAcceptNecessary}
            variant="outline"
          >
            Solo necesarias
          </Button>
        </div>
      </div>
    </Card>
  )
}