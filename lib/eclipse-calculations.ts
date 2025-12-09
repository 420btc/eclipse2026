// Funciones para calcular datos del eclipse en cualquier coordenada
// Basado en datos reales de NASA GSFC

import { eclipseCentralLine, citiesData } from "./eclipse-data"

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
export function isInTotalityZone(lat: number, lng: number): boolean {
  // Verificar límites básicos primero
  if (lat < 37 || lat > 48 || lng < -10 || lng > 6) {
    return false
  }

  const closestCenter = findClosestPointOnPath(lat, lng, eclipseCentralLine)

  // Ancho aproximado de la banda de totalidad: ~150km a cada lado del centro en España
  // Decrece hacia el este debido al sol más bajo
  const bandHalfWidth = 150 - (lng + 10) * 5 // Más ancho en el oeste

  return closestCenter.distance < Math.max(bandHalfWidth, 50)
}

// Calcular datos del eclipse para una ubicación
export function calculateEclipseData(lat: number, lng: number): EclipseCalculation {
  const closestCenter = findClosestPointOnPath(lat, lng, eclipseCentralLine)
  const inTotality = isInTotalityZone(lat, lng)

  // Calcular duración basándose en la distancia al centro
  let duration = 0
  let magnitude = 0.85

  if (inTotality) {
    // Duración máxima ~107s en el centro (España), decrece hacia los bordes
    const maxDuration = 107
    const bandWidth = 150
    const normalizedDistance = Math.min(closestCenter.distance / bandWidth, 1)
    duration = maxDuration * Math.sqrt(Math.max(0, 1 - normalizedDistance * normalizedDistance))
    magnitude = 1.0 + 0.03 * (1 - normalizedDistance)
  } else {
    // Eclipse parcial - calcular magnitud basada en distancia
    magnitude = Math.max(0.5, 1.0 - closestCenter.distance * 0.001)
  }

  // Estimar hora del máximo (CEST = UTC+2)
  // El eclipse cruza España entre 20:26 y 20:34 CEST aproximadamente
  const baseLng = -8.5
  const baseTime = 20 * 60 + 28 // 20:28 CEST
  const endLng = 4.5
  const endTime = 20 * 60 + 34 // 20:34 CEST

  const progress = Math.max(0, Math.min(1, (lng - baseLng) / (endLng - baseLng)))
  const estimatedMinutes = baseTime + progress * (endTime - baseTime)
  const hours = Math.floor(estimatedMinutes / 60)
  const minutes = Math.floor(estimatedMinutes % 60)

  // Calcular altitud solar aproximada (decrece de oeste a este)
  const sunAltitude = Math.max(1, 12 - (lng + 10) * 0.8)

  // Cobertura
  const coverage = inTotality ? 100 : Math.round(magnitude * 100)

  return {
    isInTotality: inTotality,
    distanceFromCenter: Math.round(closestCenter.distance),
    estimatedDuration: inTotality ? `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s` : "-",
    estimatedMaxTime: `${hours}:${minutes.toString().padStart(2, "0")} CEST`,
    magnitude: Math.round(magnitude * 1000) / 1000,
    coverage,
    sunAltitude: Math.round(sunAltitude),
  }
}

export function findNearestCity(lat: number, lng: number) {
  let minDistance = Number.POSITIVE_INFINITY
  let nearestCity = citiesData[0]

  for (const city of citiesData) {
    const distance = haversineDistance(lat, lng, city.lat, city.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestCity = city
    }
  }

  return { city: nearestCity, distance: minDistance }
}
