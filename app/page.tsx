"use client"

import { useState, useCallback } from "react"
import { EclipseMap } from "@/components/eclipse-map"
import { SidebarPanel } from "@/components/sidebar-panel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import type { POICategory } from "@/lib/points-of-interest"

export default function EclipsePage() {
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

  const handleLocationClick = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
  }, [])

  const handleCitySelect = useCallback((lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setSidebarOpen(false)
  }, [])

  return (
    <div className="h-[100dvh] w-full flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 flex-col flex-shrink-0 h-full">
        <SidebarPanel
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
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Map */}
      <div className="flex-1 relative h-full w-full">
        <EclipseMap
          showPath={showPath}
          showCities={showCities}
          showPOIs={showPOIs}
          showWeather={showWeather}
          selectedCategories={selectedCategories}
          onLocationClick={handleLocationClick}
        />
      </div>
    </div>
  )
}
