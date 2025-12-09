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
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 flex-shrink-0">
        <SidebarPanel
          showPath={showPath}
          setShowPath={setShowPath}
          showCities={showCities}
          setShowCities={setShowCities}
          showPOIs={showPOIs}
          setShowPOIs={setShowPOIs}
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
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedLocation={selectedLocation}
              onCitySelect={handleCitySelect}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <EclipseMap
          showPath={showPath}
          showCities={showCities}
          showPOIs={showPOIs}
          selectedCategories={selectedCategories}
          onLocationClick={handleLocationClick}
        />
      </div>
    </div>
  )
}
