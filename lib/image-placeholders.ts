/**
 * Utility functions for generating image placeholders and blur data URLs
 */

/**
 * Generate a simple SVG blur placeholder for images
 * This creates a very small, blurred SVG that can be used as a placeholder
 * while the actual image loads
 * 
 * @param width Width of the SVG
 * @param height Height of the SVG
 * @param color Base color for the placeholder (hex without #)
 * @returns A data URL for a blurred SVG
 */
export function generateBlurPlaceholder(
  width: number = 100,
  height: number = 100,
  color: string = 'e2e8f0'
): string {
  // Create a simple SVG with a blurred rectangle
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <filter id="b" x="0" y="0" width="100%" height="100%">
        <feGaussianBlur stdDeviation="20" />
      </filter>
      <rect width="100%" height="100%" fill="#${color}" filter="url(#b)" />
    </svg>
  `
  
  // Convert SVG to base64
  const svgBase64 = typeof window !== 'undefined'
    ? window.btoa(svg.trim())
    : Buffer.from(svg.trim()).toString('base64')
  
  // Return as data URL
  return `data:image/svg+xml;base64,${svgBase64}`
}

/**
 * Generate a color gradient SVG placeholder
 * Creates a more visually appealing gradient placeholder
 * 
 * @param width Width of the SVG
 * @param height Height of the SVG
 * @param colorStart Start color of gradient (hex without #)
 * @param colorEnd End color of gradient (hex without #)
 * @returns A data URL for a gradient SVG
 */
export function generateGradientPlaceholder(
  width: number = 100,
  height: number = 100,
  colorStart: string = 'e2e8f0',
  colorEnd: string = 'cbd5e1'
): string {
  // Create an SVG with a gradient
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#${colorStart}" />
          <stop offset="100%" stop-color="#${colorEnd}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
    </svg>
  `
  
  // Convert SVG to base64
  const svgBase64 = typeof window !== 'undefined'
    ? window.btoa(svg.trim())
    : Buffer.from(svg.trim()).toString('base64')
  
  // Return as data URL
  return `data:image/svg+xml;base64,${svgBase64}`
}

/**
 * Get a blurDataURL for an image to be used with Next.js Image component
 * 
 * @param url The URL of the image
 * @returns A placeholder data URL
 */
export function getImagePlaceholder(url: string): string {
  if (!url) return generateBlurPlaceholder()
  
  // For different image types, we could generate different color placeholders
  // This is a simple example - in a real app you might use the dominant color
  // of the actual image
  
  if (url.includes('product') || url.includes('concrete')) {
    return generateGradientPlaceholder(100, 100, 'd1d5db', 'e5e7eb')
  }
  
  if (url.includes('banner') || url.includes('hero')) {
    return generateGradientPlaceholder(100, 100, '1e3a8a', '3b82f6')
  }
  
  // Default placeholder
  return generateBlurPlaceholder()
}
