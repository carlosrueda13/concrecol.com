'use client'

import 'leaflet/dist/leaflet.css'

import L from 'leaflet'
import { useEffect } from 'react'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

// Coordenadas de la planta San Gil
export const COORDENADAS_PLANTA = { lat: 6.524959942352748, lng: -73.19613522714694 }

// Radio de cobertura de entregas en kilometros
export const RADIO_COBERTURA_KM = 40

// Radio terrestre medio en kilometros
const RADIO_TERRESTRE_KM = 6371

// Distancia de Haversine entre dos puntos en kilometros
export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const aRadianes = Math.PI / 180

  const deltaLat = (lat2 - lat1) * aRadianes
  const deltaLon = (lon2 - lon1) * aRadianes

  const senoLat = Math.sin(deltaLat / 2)
  const senoLon = Math.sin(deltaLon / 2)

  const a =
    senoLat * senoLat +
    Math.cos(lat1 * aRadianes) * Math.cos(lat2 * aRadianes) * senoLon * senoLon

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return RADIO_TERRESTRE_KM * c
}

// Icono del marcador con las tres URLs CDN de Leaflet 1.9.4
const ICONO_MARCADOR = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Resultado de la busqueda Nominatim enviado desde el panel de ubicacion
export interface LugarBuscado {
  lat: number
  lon: number
  label: string
}

interface MapaCoberturaProps {
  lugarBuscado?: LugarBuscado | null
}

// Centra el mapa en cada resultado de busqueda a zoom 13
function CentrarVista({ lugar }: { lugar: LugarBuscado }) {
  const mapa = useMap()

  useEffect(() => {
    mapa.setView([lugar.lat, lugar.lon], 13)
  }, [lugar, mapa])

  return null
}

export function MapaCobertura({ lugarBuscado }: MapaCoberturaProps) {
  const radioEnMetros = RADIO_COBERTURA_KM * 1000

  return (
    <MapContainer center={COORDENADAS_PLANTA} zoom={10} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={COORDENADAS_PLANTA}
        radius={radioEnMetros}
        pathOptions={{
          color: '#C4D600',
          fillColor: '#C4D600',
          fillOpacity: 0.1,
        }}
      />
      <Marker position={COORDENADAS_PLANTA} icon={ICONO_MARCADOR}>
        <Popup>Concrecol - Planta San Gil</Popup>
      </Marker>
      {lugarBuscado && (
        <>
          <Marker
            position={[lugarBuscado.lat, lugarBuscado.lon]}
            icon={ICONO_MARCADOR}
          >
            <Popup>{lugarBuscado.label}</Popup>
          </Marker>
          <CentrarVista lugar={lugarBuscado} />
        </>
      )}
    </MapContainer>
  )
}
