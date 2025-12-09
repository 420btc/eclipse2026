"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback } from "react"
import { eclipseCentralLine, eclipseNorthLimit, eclipseSouthLimit, citiesData } from "@/lib/eclipse-data"
import { pointsOfInterest, categoryColors, type POICategory } from "@/lib/points-of-interest"
import { X, ZoomIn, ZoomOut, RotateCcw, Layers } from "lucide-react"

interface EclipseMapProps {
  showPath: boolean
  showCities: boolean
  showPOIs: boolean
  selectedCategories: POICategory[]
  onLocationClick: (lat: number, lng: number) => void
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

export function EclipseMap({ showPath, showCities, showPOIs, selectedCategories, onLocationClick }: EclipseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [center, setCenter] = useState({ lat: 41.5, lng: -3.5 })
  const [zoom, setZoom] = useState(6)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lng: 0 })
  const [popup, setPopup] = useState<PopupInfo | null>(null)
  const [tiles, setTiles] = useState<{ x: number; y: number; url: string }[]>([])
  const [mapStyle, setMapStyle] = useState<"dark" | "satellite">("dark")

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
      setDragStart({ x: e.clientX, y: e.clientY, lat: center.lat, lng: center.lng })
      setPopup(null)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x
      const dy = e.clientY - dragStart.y

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
    if (isDragging) return
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
    const northPoints = eclipseNorthLimit.map((c) => geoToScreen(c[0], c[1]))
    const southPoints = eclipseSouthLimit
      .slice()
      .reverse()
      .map((c) => geoToScreen(c[0], c[1]))
    const allPoints = [...northPoints, ...southPoints]
    return allPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ") + " Z"
  }

  const handleCityClick = (city: (typeof citiesData)[0], e: React.MouseEvent) => {
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
        {tiles.map((tile) => {
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
        {showPath && (
          <>
            {/* Totality zone fill */}
            <path d={totalityPolygonPath()} fill="rgba(255, 107, 53, 0.25)" stroke="none" />

            {/* North limit */}
            <path
              d={coordsToPath(eclipseNorthLimit)}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray="12,6"
              strokeLinecap="round"
            />

            {/* South limit */}
            <path
              d={coordsToPath(eclipseSouthLimit)}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="3"
              strokeDasharray="12,6"
              strokeLinecap="round"
            />

            {/* Central line glow */}
            <path
              d={coordsToPath(eclipseCentralLine)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="12"
              opacity="0.4"
              strokeLinecap="round"
            />

            {/* Central line */}
            <path
              d={coordsToPath(eclipseCentralLine)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </>
        )}

        {/* City markers */}
        {showCities &&
          citiesData.map((city) => {
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
                  x={x - 10}
                  y={y - 10}
                  width="20"
                  height="20"
                  rx="4"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </g>
            )
          })}
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
          onClick={() => setMapStyle((s) => (s === "dark" ? "satellite" : "dark"))}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Cambiar mapa base"
        >
          <Layers className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(12, z + 1))}
          className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-lg border border-border text-foreground hover:bg-accent flex items-center justify-center transition-colors"
          title="Acercar"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(4, z - 1))}
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
