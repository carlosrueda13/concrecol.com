export const COORDENADAS_PLANTA = {
  lat: 6.524959942352748,
  lng: -73.19613522714694,
}

export const RADIO_COBERTURA_KM = 75

const RADIO_TERRESTRE_KM = 6371

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
    Math.cos(lat1 * aRadianes) *
      Math.cos(lat2 * aRadianes) *
      senoLon *
      senoLon

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return RADIO_TERRESTRE_KM * c
}

export interface LugarBuscado {
  lat: number
  lon: number
  label: string
}
