'use client'

import React, { useState } from 'react'
import { SafeImage } from '@/components/ui/safe-image'
import { ProductImage } from '@/components/product-image'
import { LazyImage } from '@/components/ui/lazy-image'

interface ThumbnailGalleryProps {
  images: string[]
  productName: string
}

export function ThumbnailGallery({ images, productName }: ThumbnailGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // Handle empty images array
  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full md:w-1/2">
        <ProductImage src="/placeholder.jpg" alt={productName} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full md:w-1/2">
      {/* Main image */}
      <div className="relative aspect-square w-full">
        <ProductImage 
          src={images[selectedImageIndex]} 
          alt={`${productName} - Image ${selectedImageIndex + 1}`}
          priority={selectedImageIndex === 0}
        />
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-16 h-16 flex-shrink-0 border-2 ${
                index === selectedImageIndex ? 'border-blue-500' : 'border-transparent'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <LazyImage
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
