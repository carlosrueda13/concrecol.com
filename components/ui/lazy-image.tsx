'use client'

import { useState, useEffect } from 'react'
import { SafeImage } from '@/components/ui/safe-image'
import { getImagePlaceholder } from '@/lib/image-placeholders'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  width?: number
  height?: number
}

export function LazyImage({
  src,
  alt,
  className = '',
  priority = false,
  sizes,
  fill = false,
  width,
  height,
}: LazyImageProps) {
  const [isInView, setIsInView] = useState(priority)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (priority) {
      setIsInView(true)
      return
    }

    // Set up intersection observer to detect when image is in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '200px', // Start loading when image is 200px from viewport
      }
    )

    const element = document.getElementById(`lazy-image-${alt.replace(/\s+/g, '-')}`)
    if (element) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
    }
  }, [alt, priority])

  return (
    <div
      id={`lazy-image-${alt.replace(/\s+/g, '-')}`}
      className={`relative ${className}`}
      style={{ 
        width: fill ? '100%' : width ? `${width}px` : '100%', 
        height: fill ? '100%' : height ? `${height}px` : 'auto',
        aspectRatio: !fill && !height && width ? '1' : undefined
      }}
    >
      {isInView ? (
        <SafeImage
          src={src}
          alt={alt}
          className={`
            ${className}
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            transition-opacity duration-500
          `}
          onLoad={() => setIsLoaded(true)}
          priority={priority}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          fallbackSrc="/placeholder.jpg"
          placeholder="blur"
          blurDataURL={getImagePlaceholder(src)}
        />
      ) : (
        // Placeholder while image is not in view
        <div 
          className="w-full h-full animate-pulse" 
          style={{
            backgroundImage: `url(${getImagePlaceholder(src)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
    </div>
  )
}
