'use client'

import { useState } from 'react'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import { MapaCobertura, type LugarBuscado } from '@/components/mapa-cobertura'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

export function Ubicacion() {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<LugarBuscado | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function buscar() {
    if (!texto.trim()) return

    setBuscando(true)
    setError(null)
    setResultado(null)

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(texto + ', Santander, Colombia')}&format=json&limit=1`
      const respuesta = await fetch(url)

      if (!respuesta.ok) {
        setError('No se pudo completar la busqueda, intenta de nuevo.')
        return
      }

      const datos = (await respuesta.json()) as Array<{
        lat: string
        lon: string
        display_name: string
      }>

      if (!Array.isArray(datos) || datos.length === 0) {
        setError('No se encontro el lugar, intenta con otro nombre')
        return
      }

      const lugar = datos[0]
      setResultado({
        lat: parseFloat(lugar.lat),
        lon: parseFloat(lugar.lon),
        label: lugar.display_name,
      })
    } catch {
      setError('No se pudo completar la busqueda, intenta de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  return (
    <>
      {/* Ubicacion */}
      <section id="ubicacion" className="relative w-full scroll-mt-14 bg-blanco py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 xl:px-0">
          <Aparece direccion="izquierda" distancia={40} duracion={0.6}>
            <h2 className="font-titulo text-[40px] text-grisCon">Ubicación</h2>
            <div aria-hidden="true" className="w-20 h-1 bg-lima mt-4" />
          </Aparece>
          <div className="mt-8 flex flex-col gap-6 xl:flex-row">
            {/* Mapa de cobertura interactivo (Leaflet + OpenStreetMap) */}
            <div className="h-[520px] w-full overflow-hidden xl:w-[750px]">
              <MapaCobertura lugarBuscado={resultado} />
            </div>
            {/* Panel de ubicacion */}
            <div className="flex w-full flex-col justify-center gap-6 xl:h-[520px] xl:w-[426px]">
              <address className="font-texto text-[20px] not-italic text-grisCon">
                KM 8 Via San gil - Socorro, Santander, Colombia
              </address>
              <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-lima animate-pulse" aria-hidden="true" />
                <p className="font-titulo text-[24px] text-lima">
                  ¿Dónde nos necesitas?
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex w-full flex-col gap-1">
                  <Input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Nombre de tu pueblo o municipio"
                    className="h-[48px]"
                  />
                  {error && (
                    <p role="alert" className="font-texto text-[14px] text-red-600">
                      {error}
                    </p>
                  )}
                </div>
                <BotonCotizar
                  type="button"
                  variant="contorno"
                  className="h-[48px] w-fit px-6"
                  onClick={buscar}
                  disabled={buscando}
                >
                  Buscar
                </BotonCotizar>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
