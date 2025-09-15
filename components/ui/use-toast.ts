'use client'

import * as React from 'react'

type Toast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: 'default' | 'destructive'
}

type ToastOptions = Omit<Toast, 'id'>

const ToastContext = React.createContext<{
  toasts: Toast[]
  toast: (opts: ToastOptions) => void
  dismiss: (id: string) => void
}>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
})

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(
    ({ title, description, action, variant = 'default' }: ToastOptions) => {
      const id = Math.random().toString(36).substr(2, 9)
      setToasts((prevToasts) => [
        ...prevToasts,
        { id, title, description, action, variant },
      ])

      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        )
      }, 5000)
    },
    []
  )

  const dismiss = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}
