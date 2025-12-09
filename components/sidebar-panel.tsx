"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sun, MapPin, Camera, Clock, Info, Search, Layers, Calculator } from "lucide-react"
import { citiesData, eclipseInfo } from "@/lib/eclipse-data"
import { pointsOfInterest, categoryLabels, categoryColors, type POICategory } from "@/lib/points-of-interest"
import { calculateEclipseData } from "@/lib/eclipse-calculations"

interface SidebarPanelProps {
  showPath: boolean
  setShowPath: (value: boolean) => void
  showCities: boolean
  setShowCities: (value: boolean) => void
  showPOIs: boolean
  setShowPOIs: (value: boolean) => void
  selectedCategories: POICategory[]
  setSelectedCategories: (value: POICategory[]) => void
  selectedLocation: { lat: number; lng: number } | null
  onCitySelect: (lat: number, lng: number) => void
}

export function SidebarPanel({
  showPath,
  setShowPath,
  showCities,
  setShowCities,
  showPOIs,
  setShowPOIs,
  selectedCategories,
  setSelectedCategories,
  selectedLocation,
  onCitySelect,
}: SidebarPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [customLat, setCustomLat] = useState("")
  const [customLng, setCustomLng] = useState("")
  const [calculatedData, setCalculatedData] = useState<ReturnType<typeof calculateEclipseData> | null>(null)

  const filteredCities = citiesData.filter((city) => city.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleCategoryToggle = (category: POICategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleCalculate = () => {
    const lat = Number.parseFloat(customLat)
    const lng = Number.parseFloat(customLng)
    if (!isNaN(lat) && !isNaN(lng)) {
      const data = calculateEclipseData(lat, lng)
      setCalculatedData(data)
    }
  }

  const locationData = selectedLocation ? calculateEclipseData(selectedLocation.lat, selectedLocation.lng) : null

  return (
    <div className="w-full h-full bg-background border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Sun className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">Eclipse 2026</h1>
            <p className="text-xs text-muted-foreground">
              {eclipseInfo.date} - {eclipseInfo.dayOfWeek}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lugares" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid grid-cols-4 mx-4 mt-4 flex-shrink-0">
          <TabsTrigger value="lugares" className="text-xs">
            <MapPin className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="capas" className="text-xs">
            <Layers className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="calc" className="text-xs">
            <Calculator className="w-4 h-4" />
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                      onChange={(e) => setCustomLat(e.target.value)}
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
                      onChange={(e) => setCustomLng(e.target.value)}
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
        </ScrollArea>
      </Tabs>
    </div>
  )
}
