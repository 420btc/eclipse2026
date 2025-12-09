export interface WeatherZone {
  id: string
  name: string
  lat: number
  lng: number
  probability: number // 0-100% de nubosidad (Bajo es mejor)
  description: string
  color: string
}

export const weatherZones: WeatherZone[] = [
  {
    id: "galicia-asturias",
    name: "Costa Norte / Galicia",
    lat: 43.5,
    lng: -7.0,
    probability: 65,
    description: "Alta probabilidad de nubes bajas y niebla costera.",
    color: "#ef4444", // Rojo
  },
  {
    id: "leon-montana",
    name: "Montaña Leonesa",
    lat: 42.9,
    lng: -5.5,
    probability: 45,
    description: "Variable. Las montañas pueden retener nubes.",
    color: "#f97316", // Naranja
  },
  {
    id: "palencia-burgos",
    name: "Meseta Norte (Palencia/Burgos)",
    lat: 42.4,
    lng: -4.0,
    probability: 15,
    description: "Excelentes condiciones. Cielos despejados muy probables.",
    color: "#22c55e", // Verde
  },
  {
    id: "soria-aragon",
    name: "Soria / Aragón Occidental",
    lat: 41.6,
    lng: -2.0,
    probability: 20,
    description: "Muy buenas condiciones históricas.",
    color: "#22c55e", // Verde
  },
  {
    id: "teruel-maestrazgo",
    name: "Teruel / Maestrazgo",
    lat: 40.8,
    lng: -0.5,
    probability: 25,
    description: "Buenas condiciones, riesgo ocasional de tormentas de verano.",
    color: "#84cc16", // Verde lima
  },
  {
    id: "costa-azahar",
    name: "Costa del Azahar",
    lat: 40.4,
    lng: 0.4,
    probability: 35,
    description: "Riesgo de humedad y brumas marinas al atardecer.",
    color: "#eab308", // Amarillo
  },
  {
    id: "baleares",
    name: "Islas Baleares",
    lat: 39.6,
    lng: 2.8,
    probability: 40,
    description: "Generalmente despejado, pero eclipse muy bajo (riesgo nubes horizonte).",
    color: "#eab308", // Amarillo
  },
]
