// Datos REALES del eclipse solar total del 12 de agosto de 2026
// Fuente: NASA GSFC - Fred Espenak
// https://eclipse.gsfc.nasa.gov/SEpath/SEpath2001/SE2026Aug12Tpath.html

export interface EclipsePathPoint {
  time: string // UTC
  centralLat: number
  centralLng: number
  northLat: number | null
  northLng: number | null
  southLat: number
  southLng: number
  pathWidth: number // km
  duration: string
}

// Datos de la trayectoria del eclipse sobre/cerca de España (NASA)
export const eclipsePathData: EclipsePathPoint[] = [
  {
    time: "18:20",
    centralLat: 48.212,
    centralLng: -13.048,
    northLat: 48.208,
    northLng: -10.267,
    southLat: 48.147,
    southLng: -15.639,
    pathWidth: 319,
    duration: "2m01s",
  },
  {
    time: "18:22",
    centralLat: 47.102,
    centralLng: -11.715,
    northLat: 47.038,
    northLng: -8.802,
    southLat: 47.083,
    southLng: -14.397,
    pathWidth: 318,
    duration: "1m59s",
  },
  {
    time: "18:24",
    centralLat: 45.943,
    centralLng: -10.19,
    northLat: 45.802,
    northLng: -7.077,
    southLat: 45.983,
    southLng: -13.008,
    pathWidth: 315,
    duration: "1m56s",
  },
  {
    time: "18:26",
    centralLat: 44.713,
    centralLng: -8.398,
    northLat: 44.457,
    northLng: -4.949,
    southLat: 44.832,
    southLng: -11.42,
    pathWidth: 311,
    duration: "1m53s",
  },
  {
    time: "18:28",
    centralLat: 43.372,
    centralLng: -6.189,
    northLat: 42.908,
    northLng: -2.085,
    southLat: 43.607,
    southLng: -9.552,
    pathWidth: 304,
    duration: "1m49s",
  },
  {
    time: "18:30",
    centralLat: 41.817,
    centralLng: -3.185,
    northLat: 40.665,
    northLng: 3.295,
    southLat: 42.263,
    southLng: -7.237,
    pathWidth: 294,
    duration: "1m45s",
  },
  {
    time: "18:32",
    centralLat: 39.408,
    centralLng: 2.95,
    northLat: null,
    northLng: null,
    southLat: 40.683,
    southLng: -4.04,
    pathWidth: 270,
    duration: "1m36s",
  },
]

// Línea central del eclipse sobre España (lng, lat para GeoJSON)
export const eclipseCentralLine: [number, number][] = [
  [-13.048, 48.212],
  [-11.715, 47.102],
  [-10.19, 45.943],
  [-8.398, 44.713],
  [-6.189, 43.372],
  [-3.185, 41.817],
  [2.95, 39.408],
  [5.407, 38.68],
]

// Límite norte de totalidad
export const eclipseNorthLimit: [number, number][] = [
  [-10.267, 48.208],
  [-8.802, 47.038],
  [-7.077, 45.802],
  [-4.949, 44.457],
  [-2.085, 42.908],
  [3.295, 40.665],
]

// Límite sur de totalidad
export const eclipseSouthLimit: [number, number][] = [
  [-15.639, 48.147],
  [-14.397, 47.083],
  [-13.008, 45.983],
  [-11.42, 44.832],
  [-9.552, 43.607],
  [-7.237, 42.263],
  [-4.04, 40.683],
  [4.54, 37.69],
  [6.34, 38.408],
]

export interface CityEclipseData {
  name: string
  lat: number
  lng: number
  inicio: string // Hora oficial España (CEST = UTC+2)
  inicioTotalidad: string
  maximo: string
  finTotalidad: string
  fin: string
  duracionTotalidad: string
  magnitud: number
  alturaSol: number // grados sobre horizonte
  inTotality: boolean
}

// Datos de ciudades - Fuente: Instituto Geográfico Nacional de España
export const citiesData: CityEclipseData[] = [
  {
    name: "A Coruña",
    lat: 43.3623,
    lng: -8.4115,
    inicio: "19:31",
    inicioTotalidad: "20:27",
    maximo: "20:28",
    finTotalidad: "20:28",
    fin: "21:22",
    duracionTotalidad: "1m 16s",
    magnitud: 1.024,
    alturaSol: 12,
    inTotality: true,
  },
  {
    name: "Santiago de Compostela",
    lat: 42.8782,
    lng: -8.5448,
    inicio: "19:31",
    inicioTotalidad: "20:27",
    maximo: "20:28",
    finTotalidad: "20:29",
    fin: "21:22",
    duracionTotalidad: "1m 41s",
    magnitud: 1.028,
    alturaSol: 11,
    inTotality: true,
  },
  {
    name: "Oviedo",
    lat: 43.3614,
    lng: -5.8493,
    inicio: "19:32",
    inicioTotalidad: "20:28",
    maximo: "20:29",
    finTotalidad: "20:30",
    fin: "21:22",
    duracionTotalidad: "1m 44s",
    magnitud: 1.029,
    alturaSol: 8,
    inTotality: true,
  },
  {
    name: "León",
    lat: 42.5987,
    lng: -5.5671,
    inicio: "19:32",
    inicioTotalidad: "20:28",
    maximo: "20:29",
    finTotalidad: "20:30",
    fin: "21:21",
    duracionTotalidad: "1m 44s",
    magnitud: 1.029,
    alturaSol: 8,
    inTotality: true,
  },
  {
    name: "Bilbao",
    lat: 43.263,
    lng: -2.935,
    inicio: "19:33",
    inicioTotalidad: "20:29",
    maximo: "20:30",
    finTotalidad: "20:31",
    fin: "21:22",
    duracionTotalidad: "1m 47s",
    magnitud: 1.03,
    alturaSol: 6,
    inTotality: true,
  },
  {
    name: "San Sebastián",
    lat: 43.3183,
    lng: -1.9812,
    inicio: "19:34",
    inicioTotalidad: "20:30",
    maximo: "20:30",
    finTotalidad: "20:31",
    fin: "21:22",
    duracionTotalidad: "1m 32s",
    magnitud: 1.026,
    alturaSol: 5,
    inTotality: true,
  },
  {
    name: "Burgos",
    lat: 42.344,
    lng: -3.6969,
    inicio: "19:33",
    inicioTotalidad: "20:29",
    maximo: "20:29",
    finTotalidad: "20:31",
    fin: "21:20",
    duracionTotalidad: "1m 44s",
    magnitud: 1.029,
    alturaSol: 8,
    inTotality: true,
  },
  {
    name: "Logroño",
    lat: 42.4627,
    lng: -2.4449,
    inicio: "19:34",
    inicioTotalidad: "20:29",
    maximo: "20:30",
    finTotalidad: "20:31",
    fin: "21:20",
    duracionTotalidad: "1m 22s",
    magnitud: 1.023,
    alturaSol: 6,
    inTotality: true,
  },
  {
    name: "Zaragoza",
    lat: 41.6488,
    lng: -0.8891,
    inicio: "19:35",
    inicioTotalidad: "20:30",
    maximo: "20:31",
    finTotalidad: "20:31",
    fin: "21:20",
    duracionTotalidad: "1m 06s",
    magnitud: 1.018,
    alturaSol: 4,
    inTotality: true,
  },
  {
    name: "Valencia",
    lat: 39.4699,
    lng: -0.3763,
    inicio: "19:36",
    inicioTotalidad: "20:31",
    maximo: "20:32",
    finTotalidad: "20:32",
    fin: "21:19",
    duracionTotalidad: "0m 28s",
    magnitud: 1.006,
    alturaSol: 2,
    inTotality: true,
  },
  {
    name: "Palma de Mallorca",
    lat: 39.5696,
    lng: 2.6502,
    inicio: "19:38",
    inicioTotalidad: "20:31",
    maximo: "20:32",
    finTotalidad: "20:32",
    fin: "21:19",
    duracionTotalidad: "1m 36s",
    magnitud: 1.004,
    alturaSol: 2,
    inTotality: true,
  },
  {
    name: "Mahón (Menorca)",
    lat: 39.8897,
    lng: 4.2665,
    inicio: "19:39",
    inicioTotalidad: "20:33",
    maximo: "20:33",
    finTotalidad: "20:34",
    fin: "21:18",
    duracionTotalidad: "0m 55s",
    magnitud: 1.014,
    alturaSol: 1,
    inTotality: true,
  },
  // Ciudades con eclipse PARCIAL
  {
    name: "Madrid",
    lat: 40.4168,
    lng: -3.7038,
    inicio: "19:34",
    inicioTotalidad: "-",
    maximo: "20:30",
    finTotalidad: "-",
    fin: "21:18",
    duracionTotalidad: "-",
    magnitud: 0.956,
    alturaSol: 5,
    inTotality: false,
  },
  {
    name: "Barcelona",
    lat: 41.3851,
    lng: 2.1734,
    inicio: "19:37",
    inicioTotalidad: "-",
    maximo: "20:32",
    finTotalidad: "-",
    fin: "21:18",
    duracionTotalidad: "-",
    magnitud: 0.982,
    alturaSol: 2,
    inTotality: false,
  },
  {
    name: "Sevilla",
    lat: 37.3891,
    lng: -5.9845,
    inicio: "19:32",
    inicioTotalidad: "-",
    maximo: "20:28",
    finTotalidad: "-",
    fin: "21:17",
    duracionTotalidad: "-",
    magnitud: 0.827,
    alturaSol: 9,
    inTotality: false,
  },
]

export const eclipseInfo = {
  date: "12 de agosto de 2026",
  dayOfWeek: "Miércoles",
  type: "Eclipse Solar Total",
  sarosNumber: 126,
  gamma: 0.8978,
  maxDuration: "2m 18s",
  maxDurationLocation: "Islandia (65°13.5'N, 25°13.7'W)",
  maxWidth: "294 km",
  spainEntryTime: "20:26 CEST",
  spainEntryLocation: "Costa de Galicia",
  spainExitTime: "20:34 CEST",
  spainExitLocation: "Menorca",
  sunAltitudeRange: "1° - 12°",
  nextTotalInSpain: "2 de agosto de 2027",
}
