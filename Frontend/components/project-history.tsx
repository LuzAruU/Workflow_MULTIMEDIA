"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useAppContext } from "@/lib/app-context"

interface HistorialItem {
  id: string
  accion: string
  usuario: string
  fecha: string
  detalles: string
  tipo: "creacion" | "entrega" | "revision" | "completado"
}

export function ProjectHistory() {
  const { proyectoSeleccionado } = useAppContext()
  const [filtro, setFiltro] = useState("")

  const historialData: HistorialItem[] = [
    {
      id: "1",
      accion: "Tarea Creada",
      usuario: "Juan Pérez",
      fecha: "hace 3 días",
      detalles: "#204 - Migración de Base de Datos",
      tipo: "creacion",
    },
    {
      id: "2",
      accion: "Entrega Realizada",
      usuario: "Carlos López",
      fecha: "hace 2 días",
      detalles: "Código + Documentación adjuntos",
      tipo: "entrega",
    },
    {
      id: "3",
      accion: "En Revisión QA",
      usuario: "María García",
      fecha: "hace 1 día",
      detalles: "Revisión iniciada - Encontrados 3 problemas",
      tipo: "revision",
    },
    {
      id: "4",
      accion: "Tarea Completada",
      usuario: "Carlos López",
      fecha: "hace 6 horas",
      detalles: "Correcciones aplicadas y aprobadas",
      tipo: "completado",
    },
  ]

  const filtrados = historialData.filter(
    (item) =>
      item.detalles.toLowerCase().includes(filtro.toLowerCase()) ||
      item.usuario.toLowerCase().includes(filtro.toLowerCase()),
  )

  const tiposColores: Record<HistorialItem["tipo"], string> = {
    creacion: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    entrega: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    revision: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    completado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Historial del Proyecto</CardTitle>
        <CardDescription>Registro completo de eventos y cambios</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en historial..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {/* Timeline */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filtrados.map((item, idx) => (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 border-border`}></div>
                {idx < filtrados.length - 1 && <div className="w-0.5 h-12 bg-border my-1"></div>}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${tiposColores[item.tipo]}`}>{item.accion}</Badge>
                  <span className="text-xs text-muted-foreground">{item.fecha}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{item.detalles}</p>
                <p className="text-xs text-muted-foreground mt-1">por {item.usuario}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
