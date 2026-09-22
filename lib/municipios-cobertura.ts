// Coverage municipalities for Concrecol (San Gil plant).
// Static coordinates obtained from Nominatim (OpenStreetMap), first result.

export interface MunicipioCobertura {
  // Canonical name for display (with accents)
  nombre: string
  // Normalized name for exact matching
  normalizado: string
  // Latitude
  lat: number
  // Longitude
  lng: number
}

// Normalizes a text for exact matching: lowercase, NFD, remove diacritics,
// trim and collapse whitespace.
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
}

export const MUNICIPIOS_COBERTURA: MunicipioCobertura[] = [
  { nombre: 'Aratoca', normalizado: 'aratoca', lat: 6.6945729, lng: -73.0187027 },
  { nombre: 'Barichara', normalizado: 'barichara', lat: 6.6357156, lng: -73.2234417 },
  { nombre: 'Cabrera', normalizado: 'cabrera', lat: 6.5933521, lng: -73.2463975 },
  { nombre: 'Cepitá', normalizado: 'cepita', lat: 6.745901, lng: -72.9294288 },
  { nombre: 'Charalá', normalizado: 'charala', lat: 6.2881742, lng: -73.148289 },
  { nombre: 'Coromoro', normalizado: 'coromoro', lat: 6.240506, lng: -72.9917307 },
  { nombre: 'Curití', normalizado: 'curiti', lat: 6.6067027, lng: -73.069209 },
  { nombre: 'Encino', normalizado: 'encino', lat: 6.137825, lng: -73.0988367 },
  { nombre: 'Jordán', normalizado: 'jordan', lat: 6.7127071, lng: -73.0924538 },
  { nombre: 'Mogotes', normalizado: 'mogotes', lat: 6.5024406, lng: -72.976792 },
  { nombre: 'Ocamonte', normalizado: 'ocamonte', lat: 6.3407198, lng: -73.1220259 },
  { nombre: 'Onzaga', normalizado: 'onzaga', lat: 6.3438974, lng: -72.816606 },
  { nombre: 'Páramo', normalizado: 'paramo', lat: 6.416541, lng: -73.1693988 },
  { nombre: 'Pinchote', normalizado: 'pinchote', lat: 6.5322505, lng: -73.1732298 },
  { nombre: 'San Gil', normalizado: 'san gil', lat: 6.5552856, lng: -73.1312353 },
  { nombre: 'San Joaquín', normalizado: 'san joaquin', lat: 6.4710188, lng: -72.8451961 },
  {
    nombre: 'Valle de San José',
    normalizado: 'valle de san jose',
    lat: 6.4480153,
    lng: -73.1443007,
  },
  { nombre: 'Villanueva', normalizado: 'villanueva', lat: 6.6712394, lng: -73.1753984 },
  { nombre: 'Chima', normalizado: 'chima', lat: 6.3443969, lng: -73.3727428 },
  { nombre: 'Confines', normalizado: 'confines', lat: 6.3559746, lng: -73.2409632 },
  { nombre: 'Contratación', normalizado: 'contratacion', lat: 6.290737, lng: -73.4745564 },
  { nombre: 'El Guacamayo', normalizado: 'el guacamayo', lat: 6.2452658, lng: -73.4975606 },
  { nombre: 'Galán', normalizado: 'galan', lat: 6.6379098, lng: -73.2874531 },
  { nombre: 'Gámbita', normalizado: 'gambita', lat: 5.9162802, lng: -73.3158972 },
  { nombre: 'Guadalupe', normalizado: 'guadalupe', lat: 6.2468169, lng: -73.4181815 },
  { nombre: 'Guapotá', normalizado: 'guapota', lat: 6.3082977, lng: -73.3212243 },
  { nombre: 'Hato', normalizado: 'hato', lat: 6.5621066, lng: -73.3647381 },
  { nombre: 'Oiba', normalizado: 'oiba', lat: 6.2314836, lng: -73.2740311 },
  { nombre: 'Palmar', normalizado: 'palmar', lat: 6.538635, lng: -73.2916928 },
  {
    nombre: 'Palmas del Socorro',
    normalizado: 'palmas del socorro',
    lat: 6.4066247,
    lng: -73.287918,
  },
  { nombre: 'Simacota', normalizado: 'simacota', lat: 6.6824805, lng: -73.7916925 },
  { nombre: 'Socorro', normalizado: 'socorro', lat: 6.470518, lng: -73.2623187 },
  { nombre: 'Suaita', normalizado: 'suaita', lat: 6.1257536, lng: -73.3627147 },
  { nombre: 'Chitaraque', normalizado: 'chitaraque', lat: 6.0279763, lng: -73.4469335 },
  { nombre: 'Vado Real', normalizado: 'vado real', lat: 6.0690472, lng: -73.4124163 },
]
