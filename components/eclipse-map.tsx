"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { type EclipseData } from "@/lib/eclipse-data"
import { pointsOfInterest, categoryColors, type POICategory } from "@/lib/points-of-interest"
import { weatherZones } from "@/lib/weather-data"
import { X, ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react"

import { getSunPosition } from "@/lib/sun-utils"

interface EclipseMapProps {
  eclipseData: EclipseData
  showPath: boolean
  showCities: boolean
  showPOIs: boolean
  showWeather: boolean
  selectedCategories: POICategory[]
  onLocationClick: (lat: number, lng: number) => void
  // Alignment Props
  alignmentMode?: "pointA" | "pointB" | null
  pointA?: { lat: number; lng: number } | null
  pointB?: { lat: number; lng: number } | null
  eclipseTime?: Date | null
  selectedLocation?: { lat: number; lng: number } | null
  flyToLocation?: { lat: number; lng: number } | null
}

interface PopupInfo {
  lat: number
  lng: number
  content: {
    title: string
    type: "city" | "poi"
    data: any
  }
}

const TILE_SIZE = 256

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * Math.pow(2, zoom)
}

function latToTileY(lat: number, zoom: number): number {
  const latRad = (lat * Math.PI) / 180
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
}

function tileXToLng(x: number, zoom: number): number {
  return (x / Math.pow(2, zoom)) * 360 - 180
}

function tileYToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, zoom)
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
}

export function EclipseMap({
  eclipseData,
  showPath,
  showCities,
  showPOIs,
  showWeather,
  selectedCategories,
  onLocationClick,
  alignmentMode,
  pointA,
  pointB,
  eclipseTime,
  selectedLocation,
  flyToLocation,
}: EclipseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [center, setCenter] = useState({ lat: 41.5, lng: -3.5 })
  const [zoom, setZoom] = useState(6)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lng: 0 })
  const hasDragged = useRef(false)
  const [popup, setPopup] = useState<PopupInfo | null>(null)
  const [tiles, setTiles] = useState<{ x: number; y: number; url: string }[]>([])
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark")

  // Zoom to selected location only when explicitly requested via flyToLocation
  useEffect(() => {
    if (flyToLocation) {
      setCenter({ lat: flyToLocation.lat, lng: flyToLocation.lng })
      setZoom(10) // Zoom level close enough to see city context
    }
  }, [flyToLocation])

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Calculate visible tiles
  useEffect(() => {
    const centerTileX = lngToTileX(center.lng, zoom)
    const centerTileY = latToTileY(center.lat, zoom)

    const tilesX = Math.ceil(dimensions.width / TILE_SIZE) + 2
    const tilesY = Math.ceil(dimensions.height / TILE_SIZE) + 2

    const startTileX = Math.floor(centerTileX - tilesX / 2)
    const startTileY = Math.floor(centerTileY - tilesY / 2)

    const newTiles: { x: number; y: number; url: string }[] = []
    const maxTile = Math.pow(2, zoom)

    for (let x = startTileX; x < startTileX + tilesX; x++) {
      for (let y = startTileY; y < startTileY + tilesY; y++) {
        if (y >= 0 && y < maxTile) {
          const tileX = ((x % maxTile) + maxTile) % maxTile
          
          let url = ""
          if (mapStyle === "dark") {
            url = `https://a.basemaps.cartocdn.com/dark_all/${zoom}/${tileX}/${y}.png`
          } else {
            url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${tileX}`
          }

          newTiles.push({
            x,
            y,
            url,
          })
        }
      }
    }
    setTiles(newTiles)
  }, [center, zoom, dimensions, mapStyle])

  // Convert lat/lng to screen coordinates
  const geoToScreen = useCallback(
    (lng: number, lat: number): [number, number] => {
      const centerTileX = lngToTileX(center.lng, zoom)
      const centerTileY = latToTileY(center.lat, zoom)
      const pointTileX = lngToTileX(lng, zoom)
      const pointTileY = latToTileY(lat, zoom)

      const x = dimensions.width / 2 + (pointTileX - centerTileX) * TILE_SIZE
      const y = dimensions.height / 2 + (pointTileY - centerTileY) * TILE_SIZE

      return [x, y]
    },
    [center, zoom, dimensions],
  )

  // Convert screen to lat/lng
  const screenToGeo = useCallback(
    (screenX: number, screenY: number): [number, number] => {
      const centerTileX = lngToTileX(center.lng, zoom)
      const centerTileY = latToTileY(center.lat, zoom)

      const tileX = centerTileX + (screenX - dimensions.width / 2) / TILE_SIZE
      const tileY = centerTileY + (screenY - dimensions.height / 2) / TILE_SIZE

      return [tileXToLng(tileX, zoom), tileYToLat(tileY, zoom)]
    },
    [center, zoom, dimensions],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      hasDragged.current = false
      setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng })
      setPopup(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          hasDragged.current = true
      }

      const centerTileX = lngToTileX(dragStart.lng, zoom)
      const centerTileY = latToTileY(dragStart.lat, zoom)

      const newTileX = centerTileX - dx / TILE_SIZE
      const newTileY = centerTileY - dy / TILE_SIZE

      setCenter({
        lng: tileXToLng(newTileX, zoom),
        lat: tileYToLat(newTileY, zoom),
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const [mouseLng, mouseLat] = screenToGeo(mouseX, mouseY)

    const newZoom = Math.max(4, Math.min(12, Math.round(zoom) + (e.deltaY > 0 ? -1 : 1)))

    if (newZoom !== zoom) {
      // Zoom towards mouse position
      const newCenterTileX = lngToTileX(mouseLng, newZoom) - (mouseX - dimensions.width / 2) / TILE_SIZE
      const newCenterTileY = latToTileY(mouseLat, newZoom) - (mouseY - dimensions.height / 2) / TILE_SIZE

      setCenter({
        lng: tileXToLng(newCenterTileX, newZoom),
        lat: tileYToLat(newCenterTileY, newZoom),
      })
      setZoom(newZoom)
    }
  }

  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging || hasDragged.current) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const [lng, lat] = screenToGeo(x, y)
      onLocationClick(lat, lng)
    }
  }

  // Create path string from coordinates
  const coordsToPath = (coords: [number, number][]): string => {
    return coords
      .map((coord, i) => {
        const [x, y] = geoToScreen(coord[0], coord[1])
        return `${i === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  // Create totality zone polygon
  const totalityPolygonPath = (): string => {
    const northPoints = eclipseData.northLimit.map((c) => geoToScreen(c[0], c[1]))
    const southPoints = eclipseData.southLimit
      .slice()
      .reverse()
      .map((c) => geoToScreen(c[0], c[1]))
    const allPoints = [...northPoints, ...southPoints]
    return allPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z"
  }

  const handleCityClick = (city: (typeof eclipseData.cities)[0], e: React.MouseEvent) => {
    e.stopPropagation()
    setPopup({
      lat: city.lat,
      lng: city.lng,
      content: { title: city.name, type: "city", data: city },
    })
  }

  const handlePOIClick = (poi: (typeof pointsOfInterest)[0], e: React.MouseEvent) => {
    e.stopPropagation()
    setPopup({
      lat: poi.lat,
      lng: poi.lng,
      content: { title: poi.name, type: "poi", data: poi },
    })
  }

  const filteredPOIs = pointsOfInterest.filter((poi) => selectedCategories.includes(poi.category))

  const resetView = () => {
    setCenter({ lat: 41.5, lng: -3.5 })
    setZoom(6)
    setPopup(null)
  }
  
  // Alignment rendering logic
  const renderAlignment = () => {
      if (!pointA) return null
      
      const [ax, ay] = geoToScreen(pointA.lng, pointA.lat)
      
      // Point B
      let bx, by
      if (pointB) {
          [bx, by] = geoToScreen(pointB.lng, pointB.lat)
      }
      
      // Sun Azimuth Line
      let sunEndX, sunEndY
      if (eclipseTime) {
          const sunPos = getSunPosition(pointA.lat, pointA.lng, eclipseTime)
          // Calculate end point of sun line (arbitrary length for visualization, e.g. 500px or to screen edge)
          // We need to project azimuth (degrees clockwise from North) to screen coordinates
          // Map projection: North is up (-Y), East is right (+X)
          // Azimuth 0 (N) -> -Y
          // Azimuth 90 (E) -> +X
          // Azimuth 180 (S) -> +Y
          // Azimuth 270 (W) -> -X
          
          // Angle in math (radians, from +X, counter-clockwise):
          // 0 (E) -> 0
          // 90 (N) -> PI/2
          // 180 (W) -> PI
          // 270 (S) -> 3*PI/2
          
          // Conversion:
          // MathAngle = 90 - Azimuth (degrees)
          // If Azimuth = 0 (N), MathAngle = 90. cos(90)=0, sin(90)=1. Vector (0, -1) [Wait, screen Y is down]
          // Screen Y increases downwards.
          // North (-Y)
          // East (+X)
          // South (+Y)
          // West (-X)
          
          // So:
          // x = sin(azimuth)
          // y = -cos(azimuth) (because up is negative Y)
          
          const rad = (sunPos.azimuthDegrees * Math.PI) / 180
          const length = 1000 // Long enough line
          const dx = Math.sin(rad) * length
          const dy = -Math.cos(rad) * length
          
          sunEndX = ax + dx
          sunEndY = ay + dy
      }
      
      return (
          <g className="pointer-events-none">
            {/* Sun Azimuth Line */}
            {sunEndX !== undefined && sunEndY !== undefined && (
                <line 
                    x1={ax} y1={ay} x2={sunEndX} y2={sunEndY} 
                    stroke="#fbbf24" strokeWidth="3" strokeDasharray="8 4" opacity="0.8"
                />
            )}
            
            {/* Line A -> B */}
            {bx !== undefined && by !== undefined && (
                <line 
                    x1={ax} y1={ay} x2={bx} y2={by} 
                    stroke="#3b82f6" strokeWidth="2" opacity="0.6"
                />
            )}
            
            {/* Point A Marker */}
            <circle cx={ax} cy={ay} r="6" fill="#10b981" stroke="white" strokeWidth="2" />
            <text x={ax} y={ay - 10} textAnchor="middle" fill="#10b981" fontSize="12" fontWeight="bold" style={{textShadow: "0 0 2px black"}}>A</text>
            
            {/* Point B Marker */}
            {bx !== undefined && by !== undefined && (
                <>
                    <circle cx={bx} cy={by} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
                    <text x={bx} y={by - 10} textAnchor="middle" fill="#3b82f6" fontSize="12" fontWeight="bold" style={{textShadow: "0 0 2px black"}}>B</text>
                </>
            )}
          </g>
      )
  }

  // Calculate tile positions
  const centerTileX = lngToTileX(center.lng, zoom)
  const centerTileY = latToTileY(center.lat, zoom)

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing select-none bg-[#1a1a2e]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleMapClick}
    >
      {/* Map tiles layer */}
      <div className="absolute inset-0 overflow-hidden">
        {tiles.map((tile: { x: number; y: number; url: string }) => {
          const tileScreenX = dimensions.width / 2 + (tile.x - centerTileX) * TILE_SIZE
          const tileScreenY = dimensions.height / 2 + (tile.y - centerTileY) * TILE_SIZE
          return (
            <img
              key={`${zoom}-${tile.x}-${tile.y}`}
              src={tile.url || "/placeholder.svg"}
              alt=""
              className="absolute pointer-events-none"
              style={{
                left: tileScreenX,
                top: tileScreenY,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
              draggable={false}
            />
          )
        })}
      </div>

      {/* Eclipse overlay SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <clipPath id="totality-clip">
            <path d={totalityPolygonPath()} />
          </clipPath>
          <filter id="weather-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
          </filter>
        </defs>

        {showPath && (
          <>
            {/* Totality zone fill */}
            <path d={totalityPolygonPath()} fill="rgba(255, 107, 53, 0.25)" stroke="none" />

            {/* Weather Overlay (Modern Masking) */}
            {showWeather && (
              <g clipPath="url(#totality-clip)" filter="url(#weather-blur)" opacity="0.6">
                {weatherZones.map((zone) => {
                  const [x, y] = geoToScreen(zone.lng, zone.lat)
                  // Calculate radius based on zoom to keep size consistent relative to map
                  const radius = 100 * Math.pow(2, zoom - 6)
                  return (
                    <circle
                      key={zone.id}
                      cx={x}
                      cy={y}
                      r={radius}
                      fill={zone.color}
                    />
                  )
                })}
              </g>
            )}

            {/* North limit */}
            <path
              d={coordsToPath(eclipseData.northLimit)}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray="12,6"
              strokeLinecap="round"
            />

            {/* South limit */}
            <path
              d={coordsToPath(eclipseData.southLimit)}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray="12,6"
              strokeLinecap="round"
            />

            {/* Central line glow */}
            <path
              d={coordsToPath(eclipseData.centralLine)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              opacity="0.4"
              strokeLinecap="round"
            />

            {/* Central line */}
            <path
              d={coordsToPath(eclipseData.centralLine)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* City markers */}
        {showCities &&
          eclipseData.cities.map((city) => {
            const [x, y] = geoToScreen(city.lng, city.lat)
            // Only render if in view
            if (x < -50 || x > dimensions.width + 50 || y < -50 || y > dimensions.height + 50) return null
            const isTotal = city.inTotality
            return (
              <g
                key={city.name}
                onClick={(e) => handleCityClick(city, e)}
                className="cursor-pointer pointer-events-auto"
              >
                <circle cx={x} cy={y} r="16" fill={isTotal ? "#fbbf24" : "#94a3b8"} opacity="0.25" />
                <circle cx={x} cy={y} r="8" fill={isTotal ? "#fbbf24" : "#94a3b8"} stroke="#ffffff" strokeWidth="2.5" />
                <text
                  x={x}
                  y={y + 22}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="600"
                  className="pointer-events-none"
                  style={{
                    textShadow: "0 0 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,0.8)",
                    paintOrder: "stroke",
                    stroke: "#000",
                    strokeWidth: "3px",
                  }}
                >
                  {city.name}
                </text>
              </g>
            )
          })}

        {/* POI markers */}
        {showPOIs &&
          filteredPOIs.map((poi) => {
            const [x, y] = geoToScreen(poi.lng, poi.lat)
            if (x < -50 || x > dimensions.width + 50 || y < -50 || y > dimensions.height + 50) return null
            const color = categoryColors[poi.category]
            return (
              <g key={poi.id} onClick={(e) => handlePOIClick(poi, e)} className="cursor-pointer pointer-events-auto">
                <rect
                  x={x - 6}
                  y={y - 6}
                  width="12"
                  height="12"
                  rx="2"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )
          })}
        
        {/* Alignment Tool Layer */}
        {renderAlignment()}
      </svg>

      {/* Popup */}
      {popup && (
        <div
          className="absolute bg-card/95 backdrop-blur-md rounded-lg shadow-xl border border-border p-4 min-w-[260px] max-w-[320px] z-50 pointer-events-auto"
          style={{
            left: Math.min(Math.max(geoToScreen(popup.lng, popup.lat)[0] + 15, 10), dimensions.width - 340),
            top: Math.min(Math.max(geoToScreen(popup.lng, popup.lat)[1] - 100, 10), dimensions.height - 280),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setPopup(null)}
            className="absolute top-2 right-2 p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {popup.content.type === "city" && (
            <div>
              <h3 className="font-bold text-lg text-foreground mb-2 pr-6">{popup.content.data.name}</h3>
              {popup.content.data.inTotality ? (
                <div className="mb-3 inline-block px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-semibold border border-green-500/30">
                  ECLIPSE TOTAL
                </div>
              ) : (
                <div className="mb-3 inline-block px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                  ECLIPSE PARCIAL
                </div>
              )}
              <div className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Inicio eclipse:</span>
                  <span className="text-foreground font-medium">{popup.content.data.inicio}</span>
                </div>
                {popup.content.data.inTotality && popup.content.data.inicioTotalidad !== "-" && (
                  <>
                    <div className="flex justify-between">
                      <span>Inicio totalidad:</span>
                      <span className="text-foreground font-medium">{popup.content.data.inicioTotalidad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fin totalidad:</span>
                      <span className="text-foreground font-medium">{popup.content.data.finTotalidad}</span>
                    </div>
                    <div className="flex justify-between bg-orange-500/10 -mx-1 px-1 py-1 rounded">
                      <span className="text-orange-300">Duración totalidad:</span>
                      <span className="text-orange-400 font-bold">{popup.content.data.duracionTotalidad}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span>Máximo:</span>
                  <span className="text-foreground font-medium">{popup.content.data.maximo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fin eclipse:</span>
                  <span className="text-foreground font-medium">{popup.content.data.fin}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>Magnitud:</span>
                    <span className="text-foreground font-medium">{popup.content.data.magnitud.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Altura del Sol:</span>
                    <span className="text-foreground font-medium">{popup.content.data.alturaSol}°</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-border text-[11px] text-muted-foreground">
                Horarios en CEST (hora oficial España peninsular)
              </div>
            </div>
          )}

          {popup.content.type === "poi" && (
            <div>
              <h3 className="font-bold text-lg text-foreground mb-1 pr-6">{popup.content.data.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{popup.content.data.description}</p>
              <div
                className={`inline-block px-2 py-1 text-xs rounded-full font-semibold border ${
                  popup.content.data.inTotality
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}
              >
                {popup.content.data.inTotality
                  ? `Totalidad: ${popup.content.data.duracionTotalidad}`
                  : "Eclipse parcial"}
              </div>
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                <span className="font-semibold text-foreground block mb-1">Tip fotográfico:</span>
                {popup.content.data.photoTip}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setMapStyle((s: "dark" | "satellite") => (s === "dark" ? "satellite" : "dark"))}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Cambiar mapa base"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom((z: number) => Math.min(12, z + 1))}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom((z: number) => Math.max(4, z - 1))}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Alejar"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Restablecer vista"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 text-sm space-y-2.5 border border-border">
        <div className="font-semibold text-foreground mb-3">Leyenda</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-red-500 rounded-full"></div>
          <span className="text-muted-foreground">Línea central</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-0.5 border-t-[3px] border-dashed border-blue-400"></div>
          <span className="text-muted-foreground">Límites totalidad</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white"></div>
          <span className="text-muted-foreground">Ciudad (total)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-slate-400 border-2 border-white"></div>
          <span className="text-muted-foreground">Ciudad (parcial)</span>
        </div>
      </div>

      {/* Coordinates display */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground border border-border">
        <div>Zoom: {zoom.toFixed(1)}</div>
        <div>
          Centro: {center.lat.toFixed(3)}°N, {Math.abs(center.lng).toFixed(3)}°{center.lng < 0 ? "W" : "E"}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-card/80 backdrop-blur-sm rounded-lg px-4 py-2 text-xs text-muted-foreground border border-border">
        Arrastra para mover · Scroll/botones para zoom · Clic en marcadores para info
      </div>
    </div>
  )
}
