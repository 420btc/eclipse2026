import SunCalc from "suncalc"

export interface SunPosition {
  azimuth: number // Grados (0 = Sur en SunCalc, convertiremos a 0 = Norte)
  altitude: number // Grados
  azimuthDegrees: number // 0-360, 0 = Norte, 90 = Este
}

export function getSunPosition(lat: number, lng: number, date: Date): SunPosition {
  const position = SunCalc.getPosition(date, lat, lng)
  
  // SunCalc devuelve azimut en radianes, 0 = Sur, positivo hacia el Oeste
  // Queremos: Grados, 0 = Norte, 90 = Este (sentido horario)
  
  const azimuthRad = position.azimuth
  const altitudeRad = position.altitude
  
  // Convertir a grados
  let azimuthDeg = azimuthRad * (180 / Math.PI)
  const altitudeDeg = altitudeRad * (180 / Math.PI)
  
  // SunCalc: 0 is South, clockwise is positive? No.
  // SunCalc: azimuth: The azimuth of the sun, in radians (direction along the horizon, measured from south to west), e.g. 0 is south and Math.PI * 3/4 is northwest.
  // Así que 0 = Sur, +PI/2 = Oeste, -PI/2 = Este, PI = Norte
  
  // Convertir a 0 = Norte, Clockwise (N=0, E=90, S=180, W=270)
  // Sur (0 rad) -> 180 deg
  // Oeste (PI/2 rad) -> 270 deg
  // Este (-PI/2 rad) -> 90 deg
  // Norte (PI rad) -> 0/360 deg
  
  // Formula: (azimuthRad * 180 / PI) + 180
  let compassBearing = azimuthDeg + 180
  
  // Asegurar 0-360
  compassBearing = (compassBearing + 360) % 360
  
  return {
    azimuth: azimuthRad,
    altitude: altitudeDeg,
    azimuthDegrees: compassBearing
  }
}

export function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI

  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLambda = toRad(lng2 - lng1)

  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)

  let theta = Math.atan2(y, x)
  let bearing = toDeg(theta)

  return (bearing + 360) % 360
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: false })
}
