export interface WeatherZone {
  id: string
  name: string
  lat: number
  lng: number
  probability: number // 0-100% de nubosidad (Bajo es mejor)
  description: string
  color: string
}

const zones2026: WeatherZone[] = [
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

const zones2027: WeatherZone[] = [
  {
    id: "estrecho-gibraltar",
    name: "Estrecho de Gibraltar (Tarifa)",
    lat: 36.0,
    lng: -5.6,
    probability: 20,
    description: "Riesgo de 'Levante' (nubes bajas/niebla) en el Estrecho. Microclima complejo.",
    color: "#eab308", // Amarillo
  },
  {
    id: "costa-malaga",
    name: "Costa del Sol (Málaga/Marbella)",
    lat: 36.5,
    lng: -4.9,
    probability: 5,
    description: "Condiciones excelentes. Muy baja probabilidad de nubes en agosto.",
    color: "#22c55e", // Verde
  },
  {
    id: "costa-cadiz",
    name: "Costa de la Luz (Cádiz)",
    lat: 36.4,
    lng: -6.1,
    probability: 8,
    description: "Muy buenas condiciones, cielos despejados predominantes.",
    color: "#22c55e", // Verde
  },
  {
    id: "ceuta-melilla",
    name: "Ceuta y Melilla",
    lat: 35.5,
    lng: -3.5,
    probability: 5,
    description: "Norte de África ofrece las mejores garantías de cielo despejado.",
    color: "#16a34a", // Verde oscuro
  },
  {
    id: "mar-alboran",
    name: "Mar de Alborán",
    lat: 36.0,
    lng: -3.0,
    probability: 10,
    description: "Generalmente despejado, ligero riesgo de bruma marina.",
    color: "#4ade80", // Verde claro
  },
]

const zones2028: WeatherZone[] = [
  {
    id: "huelva-sevilla",
    name: "Huelva / Sevilla",
    lat: 37.4,
    lng: -6.5,
    probability: 58,
    description: "Invierno. Probabilidad media de nubes. Mejor al interior si no hay niebla.",
    color: "#f97316", // Naranja
  },
  {
    id: "cordoba-jaen",
    name: "Valle del Guadalquivir",
    lat: 37.9,
    lng: -4.5,
    probability: 55,
    description: "Variable. Riesgo de nieblas matinales persistentes en invierno.",
    color: "#f97316", // Naranja
  },
  {
    id: "levante-valencia",
    name: "Valencia / Costa Blanca",
    lat: 39.0,
    lng: -0.5,
    probability: 58,
    description: "Clima invernal costero variable. Eclipse al atardecer (nubes en horizonte).",
    color: "#f97316", // Naranja
  },
  {
    id: "baleares-invierno",
    name: "Islas Baleares",
    lat: 39.5,
    lng: 2.5,
    probability: 67,
    description: "Alta probabilidad de nubes en enero. Sol muy bajo.",
    color: "#ef4444", // Rojo
  },
  {
    id: "interior-albacete",
    name: "Interior (Albacete)",
    lat: 38.8,
    lng: -2.0,
    probability: 50,
    description: "Frío y seco, pero paso de frentes atlánticos es común en enero.",
    color: "#eab308", // Amarillo
  },
]

export const weatherZones: Record<string, WeatherZone[]> = {
  "2026": zones2026,
  "2027": zones2027,
  "2028": zones2028,
}
