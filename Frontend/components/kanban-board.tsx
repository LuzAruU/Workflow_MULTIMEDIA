"use client"

import { useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Badge } from "@/components/ui/badge"
import { TaskCard } from "./task-card"
import { TaskFilters, type TaskFiltersState } from "./task-filters"

const estadoColumnas = [
  { id: "BACKLOG", label: "Pendiente", color: "bg-slate-50 dark:bg-slate-900/30" },
  { id: "ASIGNADA", label: "Asignada", color: "bg-blue-50 dark:bg-blue-900/30" },
  { id: "EN_PROGRESO", label: "En Progreso", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "PENDIENTE_QA", label: "Esperando QA", color: "bg-amber-50 dark:bg-amber-950/20" },
  { id: "EN_REVISION", label: "En Revisión", color: "bg-purple-50 dark:bg-purple-950/20" },
  { id: "CORRECCION_NECESARIA", label: "Correcciones", color: "bg-red-50 dark:bg-red-950/20" },
  { id: "COMPLETADA", label: "Completada", color: "bg-emerald-50 dark:bg-emerald-950/20" },
]

export function KanbanBoard() {
  const { proyectoSeleccionado } = useAppContext()
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: "",
    prioridades: [],
    estados: [],
    asignadas: null,
  })

  let tareas = proyectoSeleccionado?.tareas || []

  tareas = tareas.filter((tarea) => {
    // Search filter
    if (
      filters.search &&
      !tarea.titulo.toLowerCase().includes(filters.search.toLowerCase()) &&
      !tarea.descripcion.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    // Priority filter
    if (filters.prioridades.length > 0 && !filters.prioridades.includes(tarea.prioridad)) {
      return false
    }

    // Status filter
    if (filters.estados.length > 0 && !filters.estados.includes(tarea.estado)) {
      return false
    }

    return true
  })

  const tareasAgrupadas: Record<string, typeof tareas> = {}
  estadoColumnas.forEach((col) => {
    tareasAgrupadas[col.id] = tareas.filter((t) => t.estado === col.id)
  })

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Tablero Kanban</h2>
        <p className="text-sm text-muted-foreground">{tareas.length} tareas totales</p>
      </div>

      <TaskFilters onFilterChange={setFilters} totalCount={tareas.length} />

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-5 min-w-max">
          {estadoColumnas.map((estado) => (
            <div key={estado.id} className="w-96 flex-shrink-0">
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">{estado.label}</h3>
                  <Badge variant="secondary" className="text-xs bg-muted">
                    {tareasAgrupadas[estado.id]?.length || 0}
                  </Badge>
                </div>
                <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full"></div>
              </div>

              <div
                className={`rounded-xl p-4 min-h-96 space-y-3 ${estado.color} border border-border/50 transition-all duration-200`}
              >
                {tareasAgrupadas[estado.id]?.map((tarea) => (
                  <TaskCard
                    key={tarea.id}
                    task={{
                      id: tarea.id,
                      titulo: tarea.titulo,
                      prioridad: tarea.prioridad,
                      numero: Number.parseInt(tarea.id.replace("task", "")),
                    }}
                    estado={estado.id}
                    needsHighlight={estado.id === "CORRECCION_NECESARIA"}
                  />
                ))}

                {(!tareasAgrupadas[estado.id] || tareasAgrupadas[estado.id].length === 0) && (
                  <div className="text-center py-12 flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted"></div>
                    <p className="text-sm text-muted-foreground">Sin tareas</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
