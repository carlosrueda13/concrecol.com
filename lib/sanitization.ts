/**
 * Sanitiza strings para prevenir XSS y otros ataques de inyección
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remover HTML tags y caracteres peligrosos
  return input
    .replace(/<[^>]*>/g, '') // Remover HTML tags
    .replace(/[<>\"'%;&\(\)]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

/**
 * Sanitiza objetos recursivamente
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T]
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key as keyof T] = sanitizeObject(value)
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item) : 
        item
      ) as T[keyof T]
    } else {
      sanitized[key as keyof T] = value
    }
  }
  
  return sanitized
}

/**
 * Valida y sanitiza email
 */
export function sanitizeEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = sanitizeString(email).toLowerCase()
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Email inválido')
  }
  
  return sanitized
}

/**
 * Valida y sanitiza número de teléfono
 */
export function sanitizePhone(phone: string): string {
  const sanitized = sanitizeString(phone).replace(/[^\d\+\-\s\(\)]/g, '')
  
  if (sanitized.length < 10) {
    throw new Error('Teléfono inválido')
  }
  
  return sanitized
}

/**
 * Valida URLs de forma segura
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    
    // Solo permitir HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Blacklist de dominios peligrosos
    const dangerousDomains = ['localhost', '127.0.0.1', '0.0.0.0']
    if (dangerousDomains.some(domain => parsedUrl.hostname.includes(domain))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Escapa caracteres especiales para SQL (aunque usemos ORM)
 */
export function escapeSqlString(input: string): string {
  return input.replace(/'/g, "''").replace(/\\/g, '\\\\')
}