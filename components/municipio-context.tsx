'use client'

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

interface MunicipioContextValue {
  municipioSeleccionado: string
  setMunicipioSeleccionado: (municipio: string) => void
  mostrarAnuncio: boolean
  setMostrarAnuncio: (mostrar: boolean) => void
}

const MunicipioContext = createContext<MunicipioContextValue | undefined>(
  undefined,
)

export function MunicipioProvider({ children }: { children: ReactNode }) {
  const [municipioSeleccionado, setMunicipioSeleccionado] =
    useState('Charalá')

    const [mostrarAnuncio, setMostrarAnuncio] = useState(true)

  const value = useMemo(
  () => ({
    municipioSeleccionado,
    setMunicipioSeleccionado,
    mostrarAnuncio,
    setMostrarAnuncio,
  }),
  [municipioSeleccionado, mostrarAnuncio],
)

  return (
    <MunicipioContext.Provider value={value}>
      {children}
    </MunicipioContext.Provider>
  )
}

export function useMunicipio() {
  const context = useContext(MunicipioContext)

  if (!context) {
    throw new Error(
      'useMunicipio debe usarse dentro de MunicipioProvider',
    )
  }

  return context
}