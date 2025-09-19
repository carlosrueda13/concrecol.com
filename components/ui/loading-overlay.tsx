'use client'

import { useLoading } from '@/contexts/loading-context'
import { Loader2 } from 'lucide-react'

export function LoadingOverlay() {
  const { isLoading, loadingMessage } = useLoading()

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-3 max-w-md text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C4D600]" />
        <p className="text-lg font-medium">{loadingMessage}</p>
      </div>
    </div>
  )
}
