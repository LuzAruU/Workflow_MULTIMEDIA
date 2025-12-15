"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Archive } from "lucide-react"

export function RepositoryView() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-12 text-center">
        <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Repositorio de archivos</p>
        <p className="text-sm text-muted-foreground mt-1">
          Usa la pestaña "Archivos" para ver todos los archivos del proyecto
        </p>
      </CardContent>
    </Card>
  )
}
