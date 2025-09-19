'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  disabled
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  const onImageUrlAdd = () => {
    const url = prompt('Ingresa la URL de la imagen:')
    if (url) {
      // Validar que la URL sea válida
      try {
        new URL(url)
        onChange([...value, url])
      } catch {
        alert('URL inválida')
      }
    }
  }

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url))
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onImageUrlAdd}
          disabled={disabled || loading}
        >
          <ImagePlus className="h-4 w-4 mr-2" />
          Agregar imagen
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3 lg:grid-cols-4">
        {value.map((url) => (
          <div key={url} className="relative group aspect-square">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onRemove(url)}
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              src={url}
              alt="Imagen del producto"
              className="object-cover rounded-lg"
              fill
            />
          </div>
        ))}
      </div>
    </div>
  )
}
