"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface ChecklistCategory {
  id: string
  title: string
  items: ChecklistItem[]
}

const defaultChecklist: ChecklistCategory[] = [
  {
    id: "optical",
    title: "Equipo Óptico",
    items: [
      { id: "glasses", label: "Gafas de eclipse certificadas (ISO 12312-2)", checked: false },
      { id: "binoculars", label: "Prismáticos (con filtros solares)", checked: false },
      { id: "telescope", label: "Telescopio (con filtro solar)", checked: false },
      { id: "filters", label: "Filtros solares de repuesto", checked: false },
    ],
  },
  {
    id: "photography",
    title: "Fotografía",
    items: [
      { id: "camera", label: "Cámara DSLR/Mirrorless", checked: false },
      { id: "tripod", label: "Trípode robusto", checked: false },
      { id: "telephoto", label: "Objetivo teleobjetivo", checked: false },
      { id: "remote", label: "Disparador remoto/intervalómetro", checked: false },
      { id: "batteries", label: "Baterías extra (cargadas)", checked: false },
      { id: "memory", label: "Tarjetas de memoria vacías", checked: false },
      { id: "solar-filter-cam", label: "Filtro solar para cámara", checked: false },
    ],
  },
  {
    id: "comfort",
    title: "Confort y Logística",
    items: [
      { id: "chair", label: "Silla plegable", checked: false },
      { id: "water", label: "Agua y comida", checked: false },
      { id: "clothing", label: "Ropa adecuada (capas)", checked: false },
      { id: "sunscreen", label: "Protector solar y gorra", checked: false },
      { id: "red-light", label: "Linterna de luz roja", checked: false },
      { id: "map", label: "Mapa físico (offline)", checked: false },
    ],
  },
]

export function PreparationChecklist() {
  const [checklist, setChecklist] = useState<ChecklistCategory[]>(defaultChecklist)
  const { toast } = useToast()

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eclipse-checklist")
    if (saved) {
      try {
        setChecklist(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load checklist", e)
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("eclipse-checklist", JSON.stringify(checklist))
    } catch (error) {
      console.error("Failed to save checklist:", error)
      toast({
        title: "Error de almacenamiento",
        description: "No se pudo guardar el progreso. Es posible que el almacenamiento esté lleno.",
        variant: "destructive",
      })
    }
  }, [checklist, toast])

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== itemId) return item
            return { ...item, checked: !item.checked }
          }),
        }
      })
    )
  }

  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0)
  const checkedItems = checklist.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.checked).length,
    0
  )
  const progress = Math.round((checkedItems / totalItems) * 100)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Progreso de Preparación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{progress}% Completado</span>
            <span className="text-xs text-muted-foreground">
              {checkedItems}/{totalItems} items
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        {checklist.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-sm font-medium">
              {category.title}
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                ({category.items.filter((i) => i.checked).length}/{category.items.length})
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pt-1">
                {category.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => toggleItem(category.id, item.id)}
                    />
                    <Label
                      htmlFor={item.id}
                      className={`text-sm cursor-pointer ${
                        item.checked ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {item.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
