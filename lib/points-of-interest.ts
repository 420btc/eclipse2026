// Puntos de interés REALES en la línea del eclipse 2026
// Solo incluye lugares que están dentro o muy cerca de la franja de totalidad

export type POICategory = "monumento" | "natural" | "religioso" | "museo" | "mirador"

export interface PointOfInterest {
  id: string
  name: string
  lat: number
  lng: number
  category: POICategory
  description: string
  photoTip: string
  inTotality: boolean
  duracionTotalidad?: string
}

export const pointsOfInterest: PointOfInterest[] = [
  // GALICIA
  {
    id: "torre-hercules",
    name: "Torre de Hércules",
    lat: 43.3857,
    lng: -8.4066,
    category: "monumento",
    description: "Faro romano del siglo I, Patrimonio de la Humanidad. El más antiguo en funcionamiento.",
    photoTip: "Totalidad ~1m 20s. Sol a 12°. La corona solar detrás de la torre será icónica.",
    inTotality: true,
    duracionTotalidad: "1m 20s",
  },
  {
    id: "catedral-santiago",
    name: "Catedral de Santiago",
    lat: 42.8805,
    lng: -8.5446,
    category: "religioso",
    description: "Meta del Camino de Santiago. Fachada del Obradoiro.",
    photoTip: "Totalidad ~1m 41s. Las torres silueteadas contra el cielo oscurecido.",
    inTotality: true,
    duracionTotalidad: "1m 41s",
  },
  {
    id: "playa-catedrales",
    name: "Playa de las Catedrales",
    lat: 43.5536,
    lng: -7.1572,
    category: "natural",
    description: "Arcos naturales de 30m de altura en la costa de Lugo.",
    photoTip: "Totalidad ~1m 35s. Sol entre los arcos de roca al atardecer.",
    inTotality: true,
    duracionTotalidad: "1m 35s",
  },
  // ASTURIAS
  {
    id: "covadonga",
    name: "Lagos de Covadonga",
    lat: 43.2714,
    lng: -4.9856,
    category: "natural",
    description: "Lagos glaciares de Enol y Ercina en los Picos de Europa.",
    photoTip: "Totalidad ~1m 40s. Reflejo del eclipse en los lagos a 1000m de altitud.",
    inTotality: true,
    duracionTotalidad: "1m 40s",
  },
  {
    id: "santa-maria-naranco",
    name: "Santa María del Naranco",
    lat: 43.3833,
    lng: -5.8667,
    category: "religioso",
    description: "Joya del prerrománico asturiano del siglo IX. Patrimonio de la Humanidad.",
    photoTip: "Totalidad ~1m 44s. Arquitectura del siglo IX con el eclipse de fondo.",
    inTotality: true,
    duracionTotalidad: "1m 44s",
  },
  // PAÍS VASCO
  {
    id: "gaztelugatxe",
    name: "San Juan de Gaztelugatxe",
    lat: 43.4452,
    lng: -2.7833,
    category: "religioso",
    description: "Ermita sobre islote con 241 escalones. Famosa por Juego de Tronos.",
    photoTip: "Totalidad ~1m 45s. Silueta del islote contra el cielo oscurecido sobre el mar.",
    inTotality: true,
    duracionTotalidad: "1m 45s",
  },
  {
    id: "guggenheim",
    name: "Museo Guggenheim",
    lat: 43.2687,
    lng: -2.934,
    category: "museo",
    description: "Obra maestra de Frank Gehry. Titanio que refleja la luz.",
    photoTip: "Totalidad ~1m 47s. Las superficies metálicas capturarán la luz de la corona.",
    inTotality: true,
    duracionTotalidad: "1m 47s",
  },
  {
    id: "puente-vizcaya",
    name: "Puente Colgante de Vizcaya",
    lat: 43.3233,
    lng: -3.0175,
    category: "monumento",
    description: "Primer puente transbordador del mundo (1893). Patrimonio de la Humanidad.",
    photoTip: "Totalidad ~1m 45s. Estructura metálica silueteada contra la corona solar.",
    inTotality: true,
    duracionTotalidad: "1m 45s",
  },
  {
    id: "peine-viento",
    name: "El Peine del Viento",
    lat: 43.3103,
    lng: -2.0058,
    category: "monumento",
    description: "Esculturas de Eduardo Chillida integradas en las rocas de San Sebastián.",
    photoTip: "Totalidad ~1m 32s. Formas abstractas con el mar y cielo del eclipse.",
    inTotality: true,
    duracionTotalidad: "1m 32s",
  },
  // CASTILLA Y LEÓN
  {
    id: "catedral-burgos",
    name: "Catedral de Burgos",
    lat: 42.3406,
    lng: -3.7042,
    category: "religioso",
    description: "Catedral gótica del siglo XIII. Patrimonio de la Humanidad.",
    photoTip: "Totalidad ~1m 44s. Agujas góticas contra el cielo oscurecido.",
    inTotality: true,
    duracionTotalidad: "1m 44s",
  },
  {
    id: "catedral-leon",
    name: "Catedral de León",
    lat: 42.5995,
    lng: -5.567,
    category: "religioso",
    description: "La 'Pulchra Leonina', famosa por sus vidrieras medievales.",
    photoTip: "Totalidad ~1m 44s. Vidrieras con la luz especial del eclipse.",
    inTotality: true,
    duracionTotalidad: "1m 44s",
  },
  // LA RIOJA
  {
    id: "san-millan",
    name: "Monasterio de San Millán",
    lat: 42.3267,
    lng: -2.8686,
    category: "religioso",
    description: "Cuna del castellano escrito. Patrimonio de la Humanidad.",
    photoTip: "Totalidad ~1m 25s. El monasterio románico con el eclipse.",
    inTotality: true,
    duracionTotalidad: "1m 25s",
  },
  // ARAGÓN
  {
    id: "basilica-pilar",
    name: "Basílica del Pilar",
    lat: 41.6566,
    lng: -0.8789,
    category: "religioso",
    description: "Santuario mariano con 11 cúpulas sobre el río Ebro.",
    photoTip: "Totalidad ~1m 06s. Reflejo en el Ebro durante la totalidad. Sol muy bajo (4°).",
    inTotality: true,
    duracionTotalidad: "1m 06s",
  },
  {
    id: "aljaferia",
    name: "Palacio de la Aljafería",
    lat: 41.6561,
    lng: -0.8967,
    category: "monumento",
    description: "Palacio islámico del siglo XI, uno de los mejor conservados de España.",
    photoTip: "Totalidad ~1m 06s. Torre del Trovador contra el eclipse.",
    inTotality: true,
    duracionTotalidad: "1m 06s",
  },
  // BALEARES
  {
    id: "pont-den-gil",
    name: "Pont d'en Gil",
    lat: 39.9908,
    lng: 3.8261,
    category: "natural",
    description: "Arco natural de roca sobre el mar en Menorca.",
    photoTip: "Totalidad ~55s. Sol MUY bajo (1°). El sol eclipsado a través del arco.",
    inTotality: true,
    duracionTotalidad: "0m 55s",
  },
  {
    id: "naveta-tudons",
    name: "Naveta des Tudons",
    lat: 40.0039,
    lng: 3.8917,
    category: "monumento",
    description: "Tumba megalítica de 3.400 años, el edificio más antiguo de Europa.",
    photoTip: "Totalidad ~55s. Silueta prehistórica contra el cielo del eclipse.",
    inTotality: true,
    duracionTotalidad: "0m 55s",
  },
  {
    id: "monte-toro",
    name: "Monte Toro",
    lat: 39.9872,
    lng: 4.1122,
    category: "mirador",
    description: "Punto más alto de Menorca (358m) con santuario y vistas 360°.",
    photoTip: "Totalidad ~55s. Ver la sombra lunar aproximarse desde el horizonte oeste.",
    inTotality: true,
    duracionTotalidad: "0m 55s",
  },
]

export const categoryLabels: Record<POICategory, string> = {
  monumento: "Monumento",
  natural: "Natural",
  religioso: "Religioso",
  museo: "Museo",
  mirador: "Mirador",
}

export const categoryColors: Record<POICategory, string> = {
  monumento: "#f59e0b",
  natural: "#10b981",
  religioso: "#ec4899",
  museo: "#8b5cf6",
  mirador: "#06b6d4",
}
