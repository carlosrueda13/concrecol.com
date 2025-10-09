'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
// Removed withBasePath import - using direct paths for Vercel
import Image from 'next/image'

interface StaticLocationProps {
  address: string
  latitude: number
  longitude: number
  className?: string
}

export function StaticLocation({
  address = 'Concrecol, KM 8 Via San gil - Socorro, Santander',
  latitude = 6.5254028,
  longitude = -73.2020077,
  className = '',
}: StaticLocationProps) {
  // Enlace directo a Google Maps con la ubicación exacta
  const googleMapsUrl = `https://www.google.com/maps/place/CONCRECOL+-+Concretos+Premezclados/@6.5254028,-73.2020077,16.17z/data=!4m6!3m5!1s0x8e69c160de1755f5:0xdcf14effb54bc2f7!8m2!3d6.5250089!4d-73.1961221!16s%2Fg%2F11w4c3r2_3!5m1!1e2?entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D`
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Imagen estática del mapa con marcador */}
      <div className="relative w-full h-80 md:h-96 bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-md">
        <Image
          src="/images/location-map.png"
          alt={`Ubicación de ${address}`}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 800px"
        />
        
        {/* Overlay con el nombre de la empresa */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4">
          <p className="font-semibold">{address}</p>
        </div>
      </div>
      
      {/* Botón para abrir en Google Maps */}
      <Button
        onClick={() => window.open(googleMapsUrl, '_blank')}
        className="bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90 inline-flex items-center px-6 py-3 text-base"
      >
        Ver en Google Maps <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}