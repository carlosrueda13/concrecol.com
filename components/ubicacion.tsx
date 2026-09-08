'use client'

import { useState } from 'react'
import { Aparece } from '@/components/animations/aparece'
import { BotonCotizar } from '@/components/boton-cotizar'
import {
  COORDENADAS_PLANTA,
  MapaCobertura,
  RADIO_COBERTURA_KM,
  calcularDistanciaKm,
  type LugarBuscado,
} from '@/components/mapa-cobertura'
import { Input } from '@/components/ui/input'
import { MapPin } from 'lucide-react'

export function Ubicacion() {
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<LugarBuscado | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dentroDeCobertura, setDentroDeCobertura] = useState(false)

  async function buscar() {
    if (!texto.trim()) return

    setBuscando(true)
    setError(null)
    setResultado(null)
    setDentroDeCobertura(false)

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
      const lat = parseFloat(lugar.lat)
      const lon = parseFloat(lugar.lon)

      setDentroDeCobertura(
        calcularDistanciaKm(COORDENADAS_PLANTA.lat, COORDENADAS_PLANTA.lng, lat, lon) <=
          RADIO_COBERTURA_KM,
      )

      setResultado({
        lat,
        lon,
        label: lugar.display_name,
      })
    } catch {
      setError('No se pudo completar la busqueda, intenta de nuevo.')
    } finally {
      setBuscando(false)
    }
  }

  async function usarUbicacionActual() {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite obtener tu ubicacion')
      return
    }

    setBuscando(true)
    setError(null)
    setResultado(null)
    setDentroDeCobertura(false)

    try {
      const posicion = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const lat = posicion.coords.latitude
      const lon = posicion.coords.longitude

      let label = 'Tu ubicación actual'

      try {
        const respuesta = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        )

        if (respuesta.ok) {
          const datos = (await respuesta.json()) as { display_name?: string }
          if (datos.display_name && datos.display_name.trim() !== '') {
            label = datos.display_name
          }
        }
      } catch {
        // Conserva el label de respaldo si falla el reverse geocoding
      }

      setDentroDeCobertura(
        calcularDistanciaKm(COORDENADAS_PLANTA.lat, COORDENADAS_PLANTA.lng, lat, lon) <=
          RADIO_COBERTURA_KM,
      )

      setResultado({ lat, lon, label })
    } catch (err) {
      console.error('[GEOLOCATION]', err)
      const geoError = err as GeolocationPositionError
      if (geoError?.code === 1) {
        setError('Permiso de ubicacion denegado. Habilitalo en la configuracion del navegador.')
      } else if (geoError?.code === 2) {
        setError('No se pudo determinar tu ubicacion (posicion no disponible).')
      } else if (geoError?.code === 3) {
        setError('La solicitud de ubicacion tardo demasiado, intenta de nuevo.')
      } else {
        setError('No se pudo obtener tu ubicacion. Verifica los permisos de ubicacion del navegador.')
      }
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
            <div className="relative z-0 h-[520px] w-full overflow-hidden xl:w-[750px]">
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
              <button
                type="button"
                onClick={usarUbicacionActual}
                disabled={buscando}
                className="flex items-center gap-1 font-texto text-[14px] text-grisCon underline underline-offset-2 hover:text-lima disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Usar mi ubicación actual
              </button>
              {resultado &&
                (dentroDeCobertura ? (
                  <div className="mt-4 border-2 border-lima bg-lima/10 p-4">
                    <p className="font-titulo text-[28px] uppercase text-lima">
                      ¡Llegamos a donde estes!
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 border-2 border-grisCon bg-grisClaro p-4">
                    <p className="font-texto text-[18px] text-grisCon">
                      Lo sentimos, este lugar está fuera de nuestra zona de cobertura.
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
