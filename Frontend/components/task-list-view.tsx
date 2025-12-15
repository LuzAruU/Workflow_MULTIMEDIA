"use client"

import { useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { TaskDetailPanel } from "@/components/task-detail-panel"

const estadoBadgeColor: Record<string, string> = {
  BACKLOG: "bg-slate-100",
  ASIGNADA: "bg-blue-100",
  EN_PROGRESO: "bg-blue-200",
  PENDIENTE_QA: "bg-amber-100",
  EN_REVISION: "bg-purple-100",
  CORRECCION_NECESARIA: "bg-red-100",
  COMPLETADA: "bg-emerald-100",
}

const prioridadColor: Record<string, string> = {
  BAJA: "bg-slate-100",
  MEDIA: "bg-blue-100",
  ALTA: "bg-amber-100",
  CRITICA: "bg-red-100",
}

export function TaskListView() {
  const { proyectoSeleccionado } = useAppContext()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const tareas = proyectoSeleccionado?.tareas || []

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setDetailOpen(true)
  }

  const selectedTask = tareas.find((t) => t.id === selectedTaskId)

  return (
    <>
      <div className="p-6">
        {tareas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay tareas en este proyecto</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarea</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Asignado</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tareas.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50 cursor-pointer">
                  <TableCell className="font-medium">{task.titulo}</TableCell>
                  <TableCell>
                    <Badge className={estadoBadgeColor[task.estado as keyof typeof estadoBadgeColor]}>
                      {task.estado.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={prioridadColor[task.prioridad as keyof typeof prioridadColor]}>
                      {task.prioridad}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.ejecutorId ? "Asignado" : "Sin asignar"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleTaskClick(task.id)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {selectedTask && (
        <TaskDetailPanel
          open={detailOpen}
          onOpenChange={setDetailOpen}
          taskId={selectedTask.id}
          taskNumber={Number.parseInt(selectedTask.id.split("-")[1]) || 1}
          taskTitle={selectedTask.titulo}
          estado={selectedTask.estado}
        />
      )}
    </>
  )
}
