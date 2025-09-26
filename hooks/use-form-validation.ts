import { useState, useCallback } from 'react'
import { sanitizeString } from '@/lib/sanitization'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null // Retorna mensaje de error o null si válido
}

interface ValidationSchema {
  [key: string]: ValidationRule
}

interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function useFormValidation(schema: ValidationSchema) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = schema[name]
    if (!rule) return null

    // Sanitizar el valor
    const sanitizedValue = sanitizeString(value)

    // Validación required
    if (rule.required && (!sanitizedValue || sanitizedValue.trim() === '')) {
      return 'Este campo es requerido'
    }

    // Si el campo está vacío y no es requerido, es válido
    if (!sanitizedValue && !rule.required) {
      return null
    }

    // Validación de longitud mínima
    if (rule.minLength && sanitizedValue.length < rule.minLength) {
      return `Debe tener al menos ${rule.minLength} caracteres`
    }

    // Validación de longitud máxima
    if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
      return `No puede exceder ${rule.maxLength} caracteres`
    }

    // Validación de patrón
    if (rule.pattern && !rule.pattern.test(sanitizedValue)) {
      return 'Formato inválido'
    }

    // Validación personalizada
    if (rule.custom) {
      return rule.custom(sanitizedValue)
    }

    return null
  }, [schema])

  const validateForm = useCallback((values: Record<string, string>): ValidationResult => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(schema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '')
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return { isValid, errors: newErrors }
  }, [schema, validateField])

  const validateSingleField = useCallback((name: string, value: string) => {
    const error = validateField(name, value)
    setErrors(prev => ({
      ...prev,
      [name]: error || ''
    }))
    return !error
  }, [validateField])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }))
  }, [])

  return {
    errors,
    validateForm,
    validateSingleField,
    clearErrors,
    clearFieldError,
    hasErrors: Object.values(errors).some(error => error !== '')
  }
}

// Validaciones predefinidas comunes
export const commonValidations = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
    custom: (value: string) => {
      if (value && !value.includes('@')) {
        return 'Debe incluir un @ válido'
      }
      return null
    }
  },
  phone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
    minLength: 10,
    maxLength: 20
  },
  name: {
    required: true,
    pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/,
    minLength: 2,
    maxLength: 100
  },
  document: {
    required: true,
    pattern: /^[\d\-\.]+$/,
    minLength: 4,
    maxLength: 20
  }
}