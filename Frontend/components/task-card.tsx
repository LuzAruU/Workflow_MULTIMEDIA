"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TaskDetailPanel } from "@/components/task-detail-panel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/lib/app-context"

interface TaskCardProps {
  task: {
    id: string
    titulo: string
    prioridad: "BAJA" | "MEDIA" | "ALTA" | "CRITICA"
    numero: number
  }
  estado: string
  needsHighlight?: boolean
}

const prioridadConfig = {
  BAJA: { color: "bg-slate-100", textColor: "text-slate-700", label: "Baja" },
  MEDIA: { color: "bg-blue-100", textColor: "text-blue-700", label: "Media" },
  ALTA: { color: "bg-amber-100", textColor: "text-amber-700", label: "Alta" },
  CRITICA: { color: "bg-red-100", textColor: "text-red-700", label: "Crítica" },
}

export function TaskCard({ task, estado, needsHighlight }: TaskCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const router = useRouter()
  const { proyectoSeleccionado } = useAppContext()

  const tarea = proyectoSeleccionado?.tareas?.find((t) => t.id === task.id)
  const ejecutor = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === tarea?.ejecutorId)
  const qa = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === tarea?.qaId)

  const prioridad = prioridadConfig[task.prioridad]

  return (
    <>
      <Card
        onClick={() => setIsDetailOpen(true)}
        className={`p-4 cursor-pointer hover:shadow-md transition-all ${
          needsHighlight ? "border-l-4 border-l-destructive animate-pulse" : ""
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">#{task.numero}</span>
            <Badge className={`${prioridad.color} ${prioridad.textColor} text-xs font-semibold`}>
              {prioridad.label}
            </Badge>
          </div>
          {needsHighlight && <AlertCircle className="w-4 h-4 text-red-500" />}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-sm mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {task.titulo}
        </h4>

        {/* Assignees */}
        <div className="flex items-center gap-2">
          {ejecutor && (
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={ejecutor.avatar} alt={ejecutor.nombre} />
                <AvatarFallback className="text-xs">{ejecutor.nombre[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Ejecutor</span>
            </div>
          )}
          {qa && (
            <div className="flex items-center gap-1">
              <Avatar className="h-6 w-6 border border-border">
                <AvatarImage src={qa.avatar} alt={qa.nombre} />
                <AvatarFallback className="text-xs">{qa.nombre[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">QA</span>
            </div>
          )}
          {!ejecutor && !qa && <span className="text-xs text-muted-foreground">Sin asignar</span>}
        </div>
      </Card>

      <TaskDetailPanel
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        taskId={task.id}
        taskNumber={task.numero}
        taskTitle={task.titulo}
        estado={estado}
      />
    </>
  )
}
