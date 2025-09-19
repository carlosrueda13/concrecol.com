'use client'

import Image from 'next/image'
import { useState } from 'react'
import { SafeImage } from '@/components/ui/safe-image'

interface ImagePreviewProps {
  url: string
  alt?: string
}

export function ImagePreview({ url, alt }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
        <p className="text-sm text-gray-500">Error al cargar la imagen</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-square">
      <SafeImage
        src={url}
        alt={alt || 'Vista previa'}
        fill
        className={`
          object-cover
          rounded-md
          duration-700 ease-in-out
          ${loading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        onLoad={() => setLoading(false)}
        fallbackSrc="/placeholder.jpg"
      />
    </div>
  )
}
