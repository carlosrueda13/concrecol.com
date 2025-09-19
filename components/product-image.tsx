'use client'

import React from 'react'
import { LazyImage } from '@/components/ui/lazy-image'

interface ProductImageProps {
  src: string
  alt: string
  priority?: boolean
  sizes?: string
}

export function ProductImage({ src, alt, priority, sizes }: ProductImageProps) {
  return (
    <LazyImage
      src={src}
      alt={alt}
      fill
      className="object-cover"
      priority={priority}
      sizes={sizes || "(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"}
    />
  )
}
