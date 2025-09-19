/**
 * Utility functions for handling image URLs
 * This module provides functions to validate, transform, and handle image URLs
 */

/**
 * Validates if a string is a valid image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  try {
    const parsed = new URL(url)
    // Check if it's using a valid protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    
    // Check if the URL has a valid image extension
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif']
    const path = parsed.pathname.toLowerCase()
    
    // Either ends with a valid extension or comes from a known image host
    return (
      validExtensions.some(ext => path.endsWith(ext)) ||
      parsed.hostname.includes('githubusercontent.com') ||
      parsed.hostname.includes('cloudinary.com') ||
      parsed.hostname.includes('unsplash.com') ||
      parsed.hostname.includes('images.unsplash.com') ||
      parsed.hostname.includes('res.cloudinary.com') ||
      // Add other known image hosting services as needed
      (parsed.hostname.includes('concrecol.com') && path.includes('/images/'))
    )
  } catch (error) {
    // If the URL is invalid, it will throw an error
    return false
  }
}

/**
 * Transform a GitHub URL to a raw content URL if needed
 */
export function transformGitHubUrl(url: string): string {
  if (!url) return url
  
  try {
    const parsed = new URL(url)
    
    // Check if it's a GitHub URL that needs transformation
    if (parsed.hostname === 'github.com') {
      // Check if it's a blob URL format
      if (url.includes('/blob/')) {
        // Transform github.com URL to raw.githubusercontent.com URL
        // Example: https://github.com/user/repo/blob/main/image.jpg → 
        //          https://raw.githubusercontent.com/user/repo/main/image.jpg
        return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
      }
      
      // Check if it's another GitHub format that needs conversion
      if (url.includes('/raw/')) {
        // Already in raw format, just convert the domain
        return url.replace('github.com', 'raw.githubusercontent.com')
      }
    } 
    
    // Handle URLs that are already using githubusercontent but in different formats
    if (url.includes('githubusercontent.com')) {
      // These are likely already properly formatted for raw content
      return url
    }
    
    // Handle potential rawgithub.com URLs (deprecated service)
    if (parsed.hostname === 'rawgithub.com' || parsed.hostname === 'raw.githack.com') {
      // Try to convert to the modern raw.githubusercontent.com format if possible
      const pathParts = parsed.pathname.split('/')
      if (pathParts.length >= 4) {
        // Attempt to reconstruct as raw.githubusercontent.com URL
        // Format is typically: /user/repo/branch/path
        return `https://raw.githubusercontent.com${parsed.pathname}`
      }
    }
  } catch (error) {
    // If there's an error parsing the URL, return the original
    console.warn('Error processing GitHub URL:', error)
  }
  
  return url
}

/**
 * Process an image URL to ensure it's valid and properly formatted
 */
export function processImageUrl(url: string): string {
  if (!url) return '/placeholder.jpg'
  
  // Transform GitHub URLs if needed
  const transformedUrl = transformGitHubUrl(url)
  
  // Validate the URL
  if (isValidImageUrl(transformedUrl)) {
    return transformedUrl
  }
  
  // Return a placeholder for invalid URLs
  return '/placeholder.jpg'
}
