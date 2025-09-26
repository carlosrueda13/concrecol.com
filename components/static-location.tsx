'use client'

import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
// Removed withBasePath import - using direct paths for Vercel

interface StaticLocationProps {
  address: string
  latitude: number
  longitude: number
  className?: string
}

export function StaticLocation({
  address = 'Concrecol, San Gil, Colombia',
  latitude = 6.457055,
  longitude = -73.136701,
  className = '',
}: StaticLocationProps) {
  // Generar URL para el enlace de Google Maps
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
  
  // Asegurarnos que el mapa siempre se muestre, incluso si la imagen falla
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Prevenir bucle infinito
    e.currentTarget.src = '/images/map-placeholder.jpg';
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Imagen estática del mapa con marcador */}
      <div className="relative w-full h-80 md:h-96 bg-gray-200 rounded-lg overflow-hidden mb-4 shadow-md">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Cargando mapa...</p>
        </div>
        
        {/* Imagen estática de la ubicación - usando una imagen de Google Maps */}
        <img 
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=800x500&markers=color:red%7C${latitude},${longitude}&key=`}
          alt={`Ubicación de ${address}`}
          className="w-full h-full object-cover relative z-10"
          onError={handleImageError}
        />
        
        {/* Overlay con el nombre de la empresa */}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 z-20">
          <p className="font-semibold">{address}</p>
          <p className="text-sm text-gray-200">Lat: {latitude.toFixed(6)}, Long: {longitude.toFixed(6)}</p>
        </div>
      </div>
      
      {/* Botón para abrir en Google Maps */}
      <Button
        onClick={() => window.open(googleMapsUrl, '_blank')}
        className="bg-[#C4D600] text-[#4D4D4D] hover:bg-[#C4D600]/90 inline-flex items-center"
      >
        Ver en Google Maps <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}