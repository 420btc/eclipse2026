"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sun, MapPin, Camera, Clock, Info, Search, Layers, Calculator, CloudRain, Globe, Moon, Ruler, CalendarClock, X, Trash2 } from "lucide-react"
import { eclipses, type EclipseData } from "@/lib/eclipse-data"
import { pointsOfInterest, categoryLabels, categoryColors, type POICategory } from "@/lib/points-of-interest"
import { calculateEclipseData } from "@/lib/eclipse-calculations"
import { getSunPosition, calculateBearing, formatTime } from "@/lib/sun-utils"
import { weatherZones } from "@/lib/weather-data"
import { getMoonData } from "@/lib/moon-api"
import { useRouter, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

interface SidebarPanelProps {
  selectedEclipseId: string
  onEclipseChange: (id: string) => void
  showPath: boolean
  setShowPath: (value: boolean) => void
  showCities: boolean
  setShowCities: (value: boolean) => void
  showPOIs: boolean
  setShowPOIs: (value: boolean) => void
  showWeather: boolean
  setShowWeather: (value: boolean) => void
  selectedCategories: POICategory[]
  setSelectedCategories: (value: POICategory[]) => void
  selectedLocation: { lat: number; lng: number } | null
  onCitySelect: (lat: number, lng: number) => void
  // Alignment Props
  alignmentMode: "pointA" | "pointB" | null
  setAlignmentMode: (mode: "pointA" | "pointB" | null) => void
  pointA: { lat: number; lng: number } | null
  setPointA: (point: { lat: number; lng: number } | null) => void
  pointB: { lat: number; lng: number } | null
  setPointB: (point: { lat: number; lng: number } | null) => void
  eclipseTime: Date | null
  setEclipseTime: (date: Date | null) => void
}

export function SidebarPanel({
  selectedEclipseId,
  onEclipseChange,
  showPath,
  setShowPath,
  showCities,
  setShowCities,
  showPOIs,
  setShowPOIs,
  showWeather,
  setShowWeather,
  selectedCategories,
  setSelectedCategories,
  selectedLocation,
  onCitySelect,
  alignmentMode,
  setAlignmentMode,
  pointA,
  setPointA,
  pointB,
  setPointB,
  eclipseTime,
  setEclipseTime,
}: SidebarPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customLat, setCustomLat] = useState("")
  const [customLng, setCustomLng] = useState("")
  const [calculatedData, setCalculatedData] = useState<ReturnType<typeof calculateEclipseData> | null>(null)
  const [moonData, setMoonData] = useState<any>(null)
  const [loadingMoon, setLoadingMoon] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isMapbox = pathname === "/mapbox"

  const currentEclipse = eclipses[selectedEclipseId]
  const citiesData = currentEclipse.cities
  const eclipseInfo = currentEclipse.info

  const filteredCities = citiesData.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCategoryToggle = (category: POICategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleCalculate = async () => {
    if (customLat && customLng) {
      const lat = Number.parseFloat(customLat)
      const lng = Number.parseFloat(customLng)
      if (!isNaN(lat) && !isNaN(lng)) {
        setCalculatedData(calculateEclipseData(lat, lng, currentEclipse))
        
        // Fetch Moon Data
        setLoadingMoon(true)
        try {
          // Eclipse date: use currentEclipse date (needs parsing or simpler approach)
          // For now using the date string from info, simplified logic
          const dateStr = eclipseInfo.date.split(" de ")[2] // simplistic parsing for "12 de agosto de 2026"
          const monthMap: Record<string, string> = { "enero": "01", "agosto": "08" }
          const monthStr = eclipseInfo.date.split(" de ")[1]
          const dayStr = eclipseInfo.date.split(" de ")[0].padStart(2, '0')
          const isoDate = `${dateStr}-${monthMap[monthStr] || "08"}-${dayStr}`
          
          const data = await getMoonData(lat, lng, isoDate)
          setMoonData(data)
        } catch (error) {
          console.error(error)
        } finally {
          setLoadingMoon(false)
        }
      }
    }
  }

  const locationData = selectedLocation ? calculateEclipseData(selectedLocation.lat, selectedLocation.lng, currentEclipse) : null
  
  // Alignment Calculations
  const [alignmentTimeOffset, setAlignmentTimeOffset] = useState(0) // Minutes relative to max eclipse

  const getAlignmentData = () => {
    if (!pointA) return null
    
    // Determine reference date/time
    // Default to approximate eclipse time if not set
    // 2026: ~20:30 CEST. 2027: ~10:45 CEST. 2028: ~17:55 CEST
    let baseDateStr = eclipseInfo.date
    // Parsing simplistic date "12 de agosto de 2026"
    const parts = baseDateStr.split(' de ')
    const day = parseInt(parts[0])
    const monthName = parts[1]
    const year = parseInt(parts[2])
    const monthMap: Record<string, number> = { "enero": 0, "agosto": 7 }
    
    const date = new Date(year, monthMap[monthName] || 7, day)
    
    // Set approx time based on eclipse ID
    if (selectedEclipseId === "2026") date.setHours(20, 30, 0)
    else if (selectedEclipseId === "2027") date.setHours(10, 45, 0)
    else if (selectedEclipseId === "2028") date.setHours(17, 55, 0)
    
    // Apply offset
    date.setMinutes(date.getMinutes() + alignmentTimeOffset)
    
    // Update parent state if needed, or just use local derived date
    // Better to update parent so map can use it
    if (eclipseTime?.getTime() !== date.getTime()) {
       // Avoid infinite loop, maybe do this in useEffect or just use local var for calculation
       // We'll update parent state only when slider changes
    }
    
    const sunPos = getSunPosition(pointA.lat, pointA.lng, date)
    
    let bearingAB = null
    let diff = null
    
    if (pointB) {
        bearingAB = calculateBearing(pointA.lat, pointA.lng, pointB.lat, pointB.lng)
        // Diff: shortest angle
        let d = Math.abs(sunPos.azimuthDegrees - bearingAB)
        if (d > 180) d = 360 - d
        diff = d
    }
    
    return {
        date,
        sunPos,
        bearingAB,
        diff
    }
  }

  const alignmentData = getAlignmentData()
  
  // Effect to sync time to map
  React.useEffect(() => {
      if (alignmentData) {
          setEclipseTime(alignmentData.date)
      }
  }, [alignmentTimeOffset, selectedEclipseId])


  return (
    <div className="w-full h-full bg-background border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Sun className="w-6 h-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <Select value={selectedEclipseId} onValueChange={onEclipseChange}>
              <SelectTrigger className="h-8 w-full">
                <SelectValue placeholder="Seleccionar eclipse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">Eclipse Total 2026</SelectItem>
                <SelectItem value="2027">Eclipse Total 2027</SelectItem>
                <SelectItem value="2028">Eclipse Anular 2028</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{eclipseInfo.date}</span>
          <span>{eclipseInfo.dayOfWeek}</span>
        </div>
      </div>

      <Tabs defaultValue="lugares" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-6 mx-4 mt-4 flex-shrink-0">
          <TabsTrigger value="lugares" className="text-xs">
            <MapPin className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="capas" className="text-xs">
            <Layers className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="clima" className="text-xs">
            <CloudRain className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="calc" className="text-xs">
            <Calculator className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="alineacion" className="text-xs">
            <Ruler className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="info" className="text-xs">
            <Info className="w-4 h-4" />
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1 min-h-0">
          <TabsContent value="lugares" className="p-4 space-y-4 mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ciudad..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[380px] rounded-md border px-1">
              <div className="space-y-2 p-1">
                {filteredCities.map((city) => (
                  <Card
                    key={city.name}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onCitySelect(city.lat, city.lng)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{city.name}</span>
                        {city.inTotality ? (
                          <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 text-xs">
                            {city.duracionTotalidad}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Parcial
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {city.inTotality && (
                          <div className="flex justify-between">
                            <span>Totalidad:</span>
                            <span className="text-foreground">
                              {city.inicioTotalidad} - {city.finTotalidad}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Máximo:</span>
                          <span className="text-foreground">{city.maximo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sol a:</span>
                          <span className="text-foreground">{city.alturaSol}° altura</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Spots Fotográficos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4">
                {pointsOfInterest.slice(0, 6).map((poi) => (
                  <div
                    key={poi.id}
                    className="text-xs p-2 bg-muted/50 rounded cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onCitySelect(poi.lat, poi.lng)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm" style={{ background: categoryColors[poi.category] }} />
                      <span className="font-medium flex-1">{poi.name}</span>
                      {poi.inTotality && poi.duracionTotalidad && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {poi.duracionTotalidad}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capas" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Capas del Mapa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="path" className="text-sm cursor-pointer">
                    Trayectoria del eclipse
                  </Label>
                  <Switch id="path" checked={showPath} onCheckedChange={setShowPath} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="cities" className="text-sm cursor-pointer">
                    Ciudades principales
                  </Label>
                  <Switch id="cities" checked={showCities} onCheckedChange={setShowCities} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pois" className="text-sm cursor-pointer">
                    Puntos de interés
                  </Label>
                  <Switch id="pois" checked={showPOIs} onCheckedChange={setShowPOIs} />
                </div>
              </CardContent>
            </Card>

            {showPOIs && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Filtrar POIs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  {(Object.keys(categoryLabels) as POICategory[]).map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                      />
                      <label htmlFor={category} className="text-sm flex items-center gap-2 cursor-pointer">
                        <span className="w-3 h-3 rounded-sm" style={{ background: categoryColors[category] }} />
                        {categoryLabels[category]}
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Leyenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-1 bg-red-500 rounded" />
                  <span className="text-muted-foreground">Línea central (máx. duración)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 border-t-2 border-dashed border-blue-400" />
                  <span className="text-muted-foreground">Límites de totalidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-4 bg-orange-500/20 rounded" />
                  <span className="text-muted-foreground">Zona de totalidad</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clima" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CloudRain className="w-4 h-4" />
                  Probabilidad de Nubes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather" className="text-sm cursor-pointer">
                    Activar mapa de nubes
                  </Label>
                  <Switch id="weather" checked={showWeather} onCheckedChange={setShowWeather} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Visualización basada en datos históricos de nubosidad media en agosto (2000-2023).
                </p>

                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold mb-2">Zonas Climáticas</div>
                  {weatherZones.map((zone) => (
                    <div
                      key={zone.id}
                      className="p-3 rounded-lg border border-border bg-card/50 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => onCitySelect(zone.lat, zone.lng)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">{zone.name}</span>
                        <Badge
                          variant="outline"
                          className={`${
                            zone.probability < 30
                              ? "text-green-500 border-green-500/30 bg-green-500/10"
                              : zone.probability < 50
                                ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
                                : "text-red-500 border-red-500/30 bg-red-500/10"
                          }`}
                        >
                          {zone.probability}% Nubes
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{zone.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calc" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Calcular por Coordenadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="lat" className="text-xs">
                      Latitud
                    </Label>
                    <Input
                      id="lat"
                      placeholder="42.8782"
                      value={customLat}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomLat(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng" className="text-xs">
                      Longitud
                    </Label>
                    <Input
                      id="lng"
                      placeholder="-8.5448"
                      value={customLng}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomLng(e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <Button onClick={handleCalculate} className="w-full" size="sm">
                  Calcular
                </Button>

                {calculatedData && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {calculatedData.isInTotality ? (
                        <Badge className="bg-green-600">En zona de totalidad</Badge>
                      ) : (
                        <Badge variant="secondary">Eclipse parcial</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {calculatedData.isInTotality && (
                        <div>
                          <span className="text-muted-foreground">Duración:</span>
                          <div className="font-medium text-orange-400">{calculatedData.estimatedDuration}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Máximo:</span>
                        <div className="font-medium">{calculatedData.estimatedMaxTime}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Magnitud:</span>
                        <div className="font-medium">{calculatedData.magnitude.toFixed(3)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cobertura:</span>
                        <div className="font-medium">{calculatedData.coverage}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Altura Sol:</span>
                        <div className="font-medium">~{calculatedData.sunAltitude}°</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dist. centro:</span>
                        <div className="font-medium">{calculatedData.distanceFromCenter} km</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MoonAPI Data Section */}
                {loadingMoon && (
                  <div className="flex justify-center p-4">
                    <span className="loading loading-spinner text-orange-500">Cargando datos lunares...</span>
                  </div>
                )}

                {moonData && (
                  <div className="mt-4 space-y-3 p-3 bg-blue-950/30 rounded-lg border border-blue-900/50">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-blue-200">
                      <Moon className="w-4 h-4" /> Datos Astronómicos (MoonAPI)
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-background/20 p-2 rounded">
                        <span className="block text-muted-foreground">Fase Lunar</span>
                        <span className="font-medium text-foreground">{moonData.moon.phase_name} {moonData.moon.emoji}</span>
                      </div>
                      <div className="bg-background/20 p-2 rounded">
                        <span className="block text-muted-foreground">Iluminación</span>
                        <span className="font-medium text-foreground">{moonData.moon.illumination}</span>
                      </div>
                      <div className="bg-background/20 p-2 rounded">
                        <span className="block text-muted-foreground">Salida Luna</span>
                        <span className="font-medium text-foreground">{moonData.moon.moonrise}</span>
                      </div>
                      <div className="bg-background/20 p-2 rounded">
                        <span className="block text-muted-foreground">Puesta Sol</span>
                        <span className="font-medium text-orange-300">{moonData.sun.sunset_timestamp}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
                      <div className="flex justify-between">
                        <span>Constelación:</span>
                        <span className="text-foreground">{moonData.moon.zodiac.moon_sign}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Distancia Sol:</span>
                        <span className="text-foreground">{(moonData.sun.position.distance / 1000000).toFixed(1)}M km</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedLocation && locationData && (
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Punto seleccionado
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="text-xs text-muted-foreground mb-2">
                    {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°
                    {selectedLocation.lng >= 0 ? "E" : "W"}
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {locationData.isInTotality ? (
                        <Badge className="bg-green-600">En totalidad</Badge>
                      ) : (
                        <Badge variant="secondary">Parcial</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {locationData.isInTotality && (
                        <div>
                          <span className="text-muted-foreground">Duración:</span>
                          <div className="font-medium text-orange-400">{locationData.estimatedDuration}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Máximo:</span>
                        <div className="font-medium">{locationData.estimatedMaxTime}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="info" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sun className="w-4 h-4 text-orange-500" />
                  Eclipse Solar Total 2026
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-4 pb-4 text-sm">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El primer eclipse total de Sol visible desde España en más de un siglo. La franja de totalidad cruzará
                  el norte peninsular de oeste a este durante el atardecer.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Fecha</span>
                    <div className="font-medium">{eclipseInfo.date}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Tipo</span>
                    <div className="font-medium">{eclipseInfo.type}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Entrada España</span>
                    <div className="font-medium">{eclipseInfo.spainEntryTime}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Salida España</span>
                    <div className="font-medium">{eclipseInfo.spainExitTime}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Altura Sol</span>
                    <div className="font-medium">{eclipseInfo.sunAltitudeRange}</div>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground block">Ancho banda</span>
                    <div className="font-medium">{eclipseInfo.maxWidth}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Datos Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ciclo Saros:</span>
                  <span className="font-medium">{eclipseInfo.sarosNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gamma:</span>
                  <span className="font-medium">{eclipseInfo.gamma}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración máxima:</span>
                  <span className="font-medium">{eclipseInfo.maxDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación máx:</span>
                  <span className="font-medium text-right">{eclipseInfo.maxDurationLocation}</span>
                </div>
                <div className="mt-3 p-2 bg-blue-500/10 rounded text-blue-400 text-[11px]">
                  Próximo eclipse total en España: {eclipseInfo.nextTotalInSpain}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Consejos de Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 text-xs text-muted-foreground">
                <p className="flex gap-2">
                  <span className="text-red-400">⚠</span>
                  <span>Nunca mires al Sol sin protección certificada ISO 12312-2</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Solo durante la totalidad es seguro mirar sin filtro</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-amber-400">📷</span>
                  <span>Usa filtros solares especiales para cámaras</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-blue-400">📍</span>
                  <span>Busca ubicación con horizonte oeste despejado</span>
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alineacion" className="p-4 space-y-4 mt-0">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Alineación Solar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 pb-4">
                <p className="text-xs text-muted-foreground">
                  Define tu posición (A) y tu objetivo (B) para ver si el sol estará alineado durante el eclipse.
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Button 
                        variant={alignmentMode === "pointA" ? "default" : "outline"}
                        className={`w-full text-xs flex gap-2 ${pointA ? "border-green-500/50" : ""}`}
                        onClick={() => setAlignmentMode(alignmentMode === "pointA" ? null : "pointA")}
                    >
                        <MapPin className="w-3 h-3" />
                        {pointA ? "A (Fijado)" : "Punto A"}
                    </Button>
                    {pointA && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full h-6 text-[10px] text-muted-foreground hover:text-destructive"
                            onClick={() => {
                                setPointA(null)
                                // If A is removed, B usually loses context or we keep it but it won't show alignment
                                // Optionally clear B too if desired, but user asked to remove A OR B
                            }}
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Borrar A
                        </Button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Button 
                        variant={alignmentMode === "pointB" ? "default" : "outline"}
                        className={`w-full text-xs flex gap-2 ${pointB ? "border-blue-500/50" : ""}`}
                        onClick={() => setAlignmentMode(alignmentMode === "pointB" ? null : "pointB")}
                        disabled={!pointA}
                    >
                        <Camera className="w-3 h-3" />
                        {pointB ? "B (Fijado)" : "Punto B"}
                    </Button>
                    {pointB && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full h-6 text-[10px] text-muted-foreground hover:text-destructive"
                            onClick={() => setPointB(null)}
                        >
                            <Trash2 className="w-3 h-3 mr-1" /> Borrar B
                        </Button>
                    )}
                  </div>
                </div>
                
                {alignmentMode === "pointA" && (
                  <div className="text-xs text-amber-500 bg-amber-500/10 p-2 rounded animate-pulse">
                    Haz clic en el mapa para establecer tu ubicación.
                  </div>
                )}
                 {alignmentMode === "pointB" && (
                  <div className="text-xs text-blue-500 bg-blue-500/10 p-2 rounded animate-pulse">
                    Haz clic en el mapa para establecer el objetivo.
                  </div>
                )}

                {alignmentData && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-border">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-xs">Hora: {formatTime(alignmentData.date)}</Label>
                            <span className="text-xs text-muted-foreground">{alignmentTimeOffset > 0 ? `+${alignmentTimeOffset}m` : `${alignmentTimeOffset}m`}</span>
                        </div>
                        <Slider 
                            value={[alignmentTimeOffset]} 
                            min={-60} 
                            max={60} 
                            step={1} 
                            onValueChange={(v) => setAlignmentTimeOffset(v[0])}
                            className="py-2"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>-1h</span>
                            <span>Máximo</span>
                            <span>+1h</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-muted/50 rounded space-y-1">
                            <span className="text-muted-foreground block">Azimut Sol</span>
                            <div className="font-medium text-lg text-orange-400">{alignmentData.sunPos.azimuthDegrees.toFixed(1)}°</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded space-y-1">
                            <span className="text-muted-foreground block">Elevación Sol</span>
                            <div className="font-medium text-lg text-orange-400">{alignmentData.sunPos.altitude.toFixed(1)}°</div>
                        </div>
                        {alignmentData.bearingAB !== null && (
                             <div className="p-2 bg-muted/50 rounded space-y-1">
                                <span className="text-muted-foreground block">Azimut A→B</span>
                                <div className="font-medium text-lg text-blue-400">{alignmentData.bearingAB.toFixed(1)}°</div>
                            </div>
                        )}
                        {alignmentData.diff !== null && (
                             <div className="p-2 bg-muted/50 rounded space-y-1">
                                <span className="text-muted-foreground block">Diferencia</span>
                                <div className={`font-medium text-lg ${alignmentData.diff < 2 ? "text-green-500" : "text-foreground"}`}>
                                    {alignmentData.diff.toFixed(1)}°
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {alignmentData.diff !== null && alignmentData.diff < 2 && (
                        <div className="p-2 bg-green-500/20 text-green-400 rounded text-xs text-center font-medium border border-green-500/30">
                            ¡Alineación Perfecta! ✨
                        </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
