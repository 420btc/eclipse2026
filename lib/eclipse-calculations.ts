// Funciones para calcular datos del eclipse en cualquier coordenada
// Basado en datos reales de NASA GSFC

import { type EclipseData } from "./eclipse-data"

export interface EclipseCalculation {
  isInTotality: boolean
  distanceFromCenter: number
  estimatedDuration: string
  estimatedMaxTime: string
  magnitude: number
  coverage: number
  sunAltitude: number
}

// Calcular distancia entre dos puntos (Haversine)
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Encontrar el punto más cercano en un path [lng, lat]
export function findClosestPointOnPath(
  lat: number,
  lng: number,
  path: [number, number][],
): { point: [number, number]; distance: number; index: number } {
  if (!path || path.length === 0) return { point: [0, 0], distance: Infinity, index: -1 }

  let minDistance = Number.POSITIVE_INFINITY
  let closestPoint: [number, number] = path[0]
  let closestIndex = 0

  for (let i = 0; i < path.length; i++) {
    const [pathLng, pathLat] = path[i]
    const distance = haversineDistance(lat, lng, pathLat, pathLng)
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = path[i]
      closestIndex = i
    }
  }

  return { point: closestPoint, distance: minDistance, index: closestIndex }
}

// Verificar si un punto está dentro de la zona de totalidad usando ray casting
export function isInTotalityZone(lat: number, lng: number, eclipseData: EclipseData): boolean {
  // Use central line and simple distance threshold
  const closestCenter = findClosestPointOnPath(lat, lng, eclipseData.centralLine)
  
  // Ancho aproximado banda totalidad/anularidad (aprox 100-300km, radio 50-150km)
  // 2026: ~300km, 2027: ~250km, 2028: ~300km
  // Usamos 100km como radio seguro para "en zona"
  return closestCenter.distance < 100 
}

// Calcular datos del eclipse para una ubicación
export function calculateEclipseData(lat: number, lng: number, eclipseData: EclipseData): EclipseCalculation {
  const closestCenter = findClosestPointOnPath(lat, lng, eclipseData.centralLine)
  const inTotality = isInTotalityZone(lat, lng, eclipseData)

  // Find nearest city for time estimation
  const nearestCityInfo = findNearestCity(lat, lng, eclipseData)
  const city = nearestCityInfo.city

  // Calcular duración basándose en la distancia al centro
  let duration = 0
  let magnitude = 0.85

  if (inTotality) {
    // Parse duration from city if available, else estimate
    // Format "Xm Ys"
    let maxSeconds = 120 // Default
    if (city && city.duracionTotalidad && city.duracionTotalidad !== "-") {
        const parts = city.duracionTotalidad.split(' ')
        const m = parseInt(parts[0].replace('m', '')) || 0
        const s = parseInt(parts[1]?.replace('s', '') || '0') || 0
        maxSeconds = m * 60 + s
    }
    
    const bandWidth = 150
    const normalizedDistance = Math.min(closestCenter.distance / bandWidth, 1)
    duration = maxSeconds * Math.sqrt(Math.max(0, 1 - normalizedDistance * normalizedDistance))
    magnitude = 1.0 + 0.03 * (1 - normalizedDistance)
  } else {
    // Eclipse parcial - calcular magnitud basada en distancia
    magnitude = Math.max(0.1, 1.0 - closestCenter.distance * 0.002)
  }

  // Estimar hora del máximo usando la ciudad más cercana
  let timeStr = "12:00"
  let sunAlt = 45
  if (city) {
      timeStr = city.maximo
      sunAlt = city.alturaSol
  }

  // Cobertura
  const coverage = inTotality ? 100 : Math.round(magnitude * 100)

  return {
    isInTotality: inTotality,
    distanceFromCenter: Math.round(closestCenter.distance),
    estimatedDuration: inTotality ? `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s` : "-",
    estimatedMaxTime: timeStr,
    magnitude: Math.round(magnitude * 1000) / 1000,
    coverage,
    sunAltitude: Math.round(sunAlt),
  }
}

export function findNearestCity(lat: number, lng: number, eclipseData: EclipseData) {
  let minDistance = Number.POSITIVE_INFINITY
  let nearestCity = eclipseData.cities[0]

  for (const city of eclipseData.cities) {
    const distance = haversineDistance(lat, lng, city.lat, city.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestCity = city
    }
  }

  return { city: nearestCity, distance: minDistance }
}
