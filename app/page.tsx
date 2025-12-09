"use client"

import { useState, useCallback } from "react"
import { EclipseMap } from "@/components/eclipse-map"
import { SidebarPanel } from "@/components/sidebar-panel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        setSidebarOpen(false)
    }
  }, [alignmentMode])

  const currentEclipse = eclipses[selectedEclipseId] || defaultEclipse

  return (
    <div className="h-[100dvh] w-full flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 flex-col flex-shrink-0 h-full">
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

      {/* Mobile Sidebar */}
      <div className="md:hidden absolute top-4 left-4 z-20">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="secondary" className="shadow-lg">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
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
          </SheetContent>
        </Sheet>
      </div>

      {/* Map */}
      <div className="flex-1 relative h-full w-full">
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
