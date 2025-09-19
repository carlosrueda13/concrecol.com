'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/providers/toast-provider'
import { CartProvider } from '@/contexts/cart-provider'
import { LoadingProvider } from '@/contexts/loading-context'
import { LoadingOverlay } from '@/components/ui/loading-overlay'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <LoadingProvider>
          <CartProvider>
            {children}
            <LoadingOverlay />
          </CartProvider>
        </LoadingProvider>
      </ToastProvider>
    </SessionProvider>
  )
}
