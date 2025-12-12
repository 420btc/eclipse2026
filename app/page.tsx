"use client"

import { useState, useCallback } from "react"
import { EclipseMap } from "@/components/eclipse-map"
import { SidebarPanel } from "@/components/sidebar-panel"
import type { POICategory } from "@/lib/points-of-interest"
import { eclipses, defaultEclipse } from "@/lib/eclipse-data"

export default function EclipsePage() {
  const [selectedEclipseId, setSelectedEclipseId] = useState(defaultEclipse.id)
  const [showPath, setShowPath] = useState(true)
  const [showCities, setShowCities] = useState(true)
  const [showPOIs, setShowPOIs] = useState(true)
  const [showWeather, setShowWeather] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<POICategory[]>([
    "monumento",
    "natural",
    "religioso",
    "museo",
    "mirador",
  ])
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  const [alignmentMode, setAlignmentMode] = useState<"pointA" | "pointB" | null>(null)
  const [pointA, setPointA] = useState<{ lat: number; lng: number } | null>(null)
  const [pointB, setPointB] = useState<{ lat: number; lng: number } | null>(null)
  const [eclipseTime, setEclipseTime] = useState<Date | null>(null)
  const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleLocationClick = useCallback((lat: number, lng: number) => {
    if (alignmentMode === "pointA") {
      setPointA({ lat, lng })
      setAlignmentMode(null) // Auto-advance logic could go here or stay manual
    } else if (alignmentMode === "pointB") {
      setPointB({ lat, lng })
      setAlignmentMode(null)
    } else {
      setSelectedLocation({ lat, lng })
    }
  }, [alignmentMode])

  const handleCitySelect = useCallback((lat: number, lng: number) => {
    if (alignmentMode === "pointA") {
        setPointA({ lat, lng })
        setAlignmentMode(null)
    } else if (alignmentMode === "pointB") {
        setPointB({ lat, lng })
        setAlignmentMode(null)
    } else {
        setSelectedLocation({ lat, lng })
        setFlyToLocation({ lat, lng })
    }
  }, [alignmentMode])

  const currentEclipse = eclipses[selectedEclipseId] || defaultEclipse

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row bg-background overflow-hidden">
      {/* Sidebar Panel - Desktop: Left, Mobile: Bottom */}
      <div className="w-full md:w-80 h-[40%] md:h-full flex-shrink-0 border-t md:border-t-0 md:border-r border-border order-2 md:order-1 bg-background z-10 relative shadow-xl md:shadow-none">
        <SidebarPanel
          selectedEclipseId={selectedEclipseId}
          onEclipseChange={setSelectedEclipseId}
          showPath={showPath}
          setShowPath={setShowPath}
          showCities={showCities}
          setShowCities={setShowCities}
          showPOIs={showPOIs}
          setShowPOIs={setShowPOIs}
          showWeather={showWeather}
          setShowWeather={setShowWeather}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedLocation={selectedLocation}
          onCitySelect={handleCitySelect}
          // Alignment props
          alignmentMode={alignmentMode}
          setAlignmentMode={setAlignmentMode}
          pointA={pointA}
          setPointA={setPointA}
          pointB={pointB}
          setPointB={setPointB}
          eclipseTime={eclipseTime}
          setEclipseTime={setEclipseTime}
        />
      </div>

      {/* Map - Desktop: Right, Mobile: Top */}
      <div className="flex-1 relative h-[60%] md:h-full w-full order-1 md:order-2">
        <EclipseMap
          eclipseData={currentEclipse}
          showPath={showPath}
          showCities={showCities}
          showPOIs={showPOIs}
          showWeather={showWeather}
          selectedCategories={selectedCategories}
          onLocationClick={handleLocationClick}
          // Alignment props
          pointA={pointA}
          pointB={pointB}
          eclipseTime={eclipseTime}
          alignmentMode={alignmentMode}
          selectedLocation={selectedLocation}
          flyToLocation={flyToLocation}
        />
      </div>
    </div>
  )
}
