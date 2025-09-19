'use client'

import { Button as ShadcnButton } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { useLoading } from '@/contexts/loading-context'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  useGlobalLoadingState?: boolean
}

export function LoadingButton({
  isLoading: localLoading = false,
  loadingText = 'Cargando...',
  variant = 'default',
  size = 'default',
  children,
  disabled,
  useGlobalLoadingState = false,
  ...props
}: LoadingButtonProps) {
  const { isLoading: globalLoading } = useLoading()
  
  // Use global loading state if specified, otherwise use local loading state
  const isLoading = useGlobalLoadingState ? globalLoading : localLoading
  
  return (
    <ShadcnButton
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </ShadcnButton>
  )
}
