'use client'

import React from 'react'
import Image, { ImageProps } from 'next/image'
import { isValidImageUrl, transformGitHubUrl, processImageUrl } from '@/lib/image-utils'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src: string
  fallbackSrc?: string
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export function SafeImage({ src, fallbackSrc, alt, ...props }: SafeImageProps) {
  const defaultFallback = fallbackSrc || '/placeholder.jpg';
  const [imgSrc, setImgSrc] = React.useState<string>(processImageUrl(src))
  const [error, setError] = React.useState<boolean>(false)
  const [attemptedFallback, setAttemptedFallback] = React.useState<boolean>(false)
  
  // Handle GitHub URLs that may be causing issues
  const isGitHubUrl = typeof src === 'string' && 
    (src.includes('github.com') || 
     src.includes('githubusercontent.com') || 
     src.includes('rawgithub.com'));

  // Safely handle image URLs - make sure they're properly formatted
  React.useEffect(() => {
    // Reset error state when src changes
    setError(false);
    setAttemptedFallback(false);
    
    // Process the image URL
    const processedUrl = processImageUrl(src)
    setImgSrc(processedUrl)
    
    // If the processed URL is a fallback, mark as error
    if (processedUrl === defaultFallback) {
      setError(true);
      setAttemptedFallback(true);
    }
  }, [src, defaultFallback])

  // Generate a display name for the fallback placeholder
  const getDisplayName = (): string => {
    if (typeof alt === 'string' && alt.trim()) {
      return alt.trim().charAt(0).toUpperCase();
    }
    
    // Try to extract name from URL if possible
    if (typeof src === 'string') {
      try {
        const url = new URL(src);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        return filename.charAt(0).toUpperCase();
      } catch (e) {
        // Ignore error
      }
    }
    
    return '?';
  };

  if (error && attemptedFallback) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 text-gray-400"
        style={{ 
          width: props.width || '100%', 
          height: props.height || '100%',
          ...(props.style || {}),
          aspectRatio: props.width && props.height ? undefined : '1/1',
        }}
      >
        <div className="text-2xl font-bold">{getDisplayName()}</div>
      </div>
    )
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt || ''}
      onError={() => {
        console.warn(`Image failed to load: ${imgSrc} ${isGitHubUrl ? '(GitHub URL)' : ''}`);
        
        if (!attemptedFallback) {
          setAttemptedFallback(true);
          setImgSrc(defaultFallback);
        } else {
          setError(true);
        }
      }}
    />
  )
}
