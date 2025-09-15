'use client'

import * as React from 'react'
import { ToastProvider as RadixToastProvider } from '@radix-ui/react-toast'
import { useToast } from '@/components/ui/use-toast'

interface ToastProviderProps {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts } = useToast()

  return (
    <RadixToastProvider>
      {children}
      <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        {toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <div
              key={id}
              className="bg-white border rounded-lg shadow-lg p-4 mb-2"
              {...props}
            >
              <div className="grid gap-1">
                {title && <div className="font-semibold">{title}</div>}
                {description && <div className="text-sm">{description}</div>}
              </div>
              {action}
            </div>
          )
        })}
      </div>
    </RadixToastProvider>
  )
}
