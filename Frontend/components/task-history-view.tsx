"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle2, AlertCircle, FileCheck2 } from "lucide-react"

export function TaskHistoryView() {
  const { proyectoSeleccionado } = useAppContext()
  const [historial, setHistorial] = useState<any[]>([])

  useEffect(() => {
    if (proyectoSeleccionado?.tareas) {
      const tareas = proyectoSeleccionado.tareas

      // Recolectar entregas y revisiones de todas las tareas
      const historialData = tareas.flatMap((tarea) => {
        const entregas = tarea.entrega
          ? [
              {
                id: `entrega-${tarea.entrega.id}`,
                tipo: "Entrega",
                titulo: tarea.titulo,
                descripcion: tarea.entrega.resumen,
                fecha: tarea.entrega.entregadoEn,
                prioridad: tarea.prioridad,
                estado: tarea.estado,
              },
            ]
          : []

        const revisiones = tarea.revision
          ? [
              {
                id: `revision-${tarea.revision.id}`,
                tipo: "Revisión",
                titulo: tarea.titulo,
                descripcion: tarea.revision.textoRetroalimentacion || "Sin comentarios",
                fecha: tarea.revision.revisadoEn,
                prioridad: tarea.prioridad,
                estado: tarea.estado,
                veredicto: tarea.revision.veredicto,
              },
            ]
          : []

        return [...entregas, ...revisiones]
      })

      // Ordenar por fecha descendente
      historialData.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      setHistorial(historialData)
    }
  }, [proyectoSeleccionado])

  if (!proyectoSeleccionado) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Selecciona un proyecto para ver su historial</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {historial.length > 0 ? (
        historial.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.tipo === "Entrega"
                          ? "bg-blue-100 text-blue-600"
                          : item.veredicto === "APROBADO"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.tipo === "Entrega" ? (
                        <FileCheck2 className="w-5 h-5" />
                      ) : item.veredicto === "APROBADO" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.fecha).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <Badge variant="secondary" className="mb-2 block">
                    {item.tipo}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.prioridad}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay entregas ni revisiones registradas</p>
        </div>
      )}
    </div>
  )
}
