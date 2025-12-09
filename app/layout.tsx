import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Eclipse Solar Total 2026 - Planificador España",
  description:
    "Planifica tu observación del eclipse solar total del 12 de agosto de 2026 en España. Mapa interactivo con trayectoria, ciudades y puntos de interés fotográficos.",
  keywords: ["eclipse solar", "2026", "España", "totalidad", "astronomía", "planificador"],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a1a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
