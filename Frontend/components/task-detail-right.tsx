"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TaskActions } from "@/components/task-actions"
import { useAppContext } from "@/lib/app-context"
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from "lucide-react"

interface TaskDetailRightProps {
  taskId: string
  estado: string
}

const estadoConfig: Record<string, { label: string; color: string; icon: any }> = {
  BACKLOG: { 
    label: "Pendiente", 
    color: "bg-slate-100 text-slate-700 border-slate-200", 
    icon: Clock 
  },
  ASIGNADA: { 
    label: "Asignada", 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    icon: PlayCircle 
  },
  EN_PROGRESO: { 
    label: "En Progreso", 
    color: "bg-blue-100 text-blue-700 border-blue-200", 
    icon: PlayCircle 
  },
  PENDIENTE_QA: { 
    label: "Esperando QA", 
    color: "bg-amber-100 text-amber-700 border-amber-200", 
    icon: Clock 
  },
  EN_REVISION: { 
    label: "En Revisión", 
    color: "bg-purple-100 text-purple-700 border-purple-200", 
    icon: PlayCircle 
  },
  CORRECCION_NECESARIA: { 
    label: "Correcciones", 
    color: "bg-red-100 text-red-700 border-red-200", 
    icon: AlertCircle 
  },
  COMPLETADA: { 
    label: "Completada", 
    color: "bg-emerald-100 text-emerald-700 border-emerald-200", 
    icon: CheckCircle2 
  },
}

export function TaskDetailRight({ taskId, estado }: TaskDetailRightProps) {
  const { proyectoSeleccionado } = useAppContext()
  const tarea = proyectoSeleccionado?.tareas?.find((t) => t.id === taskId)
  const estadoActual = estadoConfig[estado] || estadoConfig.BACKLOG
  const IconoEstado = estadoActual.icon

  return (
    <div className="space-y-4">
      {/* Estado de la Tarea */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IconoEstado className="w-4 h-4" />
            Estado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge className={`${estadoActual.color} border w-full justify-center py-2`}>
            {estadoActual.label}
          </Badge>
        </CardContent>
      </Card>

      {/* Acciones */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskActions tareaId={taskId} estadoActual={estado} />
        </CardContent>
      </Card>

      {/* Información Adicional */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Prioridad</span>
            <Badge variant="outline" className="text-xs font-medium">
              {tarea?.prioridad || 'MEDIA'}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estado Actual</span>
            <span className="text-sm font-medium">{estadoActual.label}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
