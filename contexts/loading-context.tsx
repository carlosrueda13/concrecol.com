'use client'

import React, { createContext, useState, useContext } from 'react'

interface LoadingContextProps {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  loadingMessage: string
  setLoadingMessage: (message: string) => void
}

const LoadingContext = createContext<LoadingContextProps | undefined>(undefined)

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Cargando...')

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => {
    setIsLoading(false)
    setLoadingMessage('Cargando...')
  }

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        loadingMessage,
        setLoadingMessage
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
