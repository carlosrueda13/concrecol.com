'use client'

import { useMunicipio } from '@/components/municipio-context'

export function AnuncioCharala() {
  const {
  municipioSeleccionado,
  mostrarAnuncio,
} = useMunicipio()

  const mensaje = `¡Buenas noticias ${municipioSeleccionado}! Concrecol llega con todo`
  if (!mostrarAnuncio) {
  return null
}

  return (
    <div className="flex h-[64px] sm:h-[88px] w-full items-center overflow-hidden whitespace-nowrap">
      <div className="marquesina-track">
        <span className="mr-12 font-titulo text-[32px] sm:text-[42px] text-lima uppercase tracking-[0.05em]">
          {mensaje}
        </span>

        <span
          className="mr-12 font-titulo text-[32px] sm:text-[42px] text-lima uppercase tracking-[0.05em]"
          aria-hidden="true"
        >
          {mensaje}
        </span>
      </div>
    </div>
  )
}