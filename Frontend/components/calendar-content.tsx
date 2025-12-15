"use client"

import { useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarContent() {
  const { proyectos } = useAppContext()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Obtener todas las tareas de todos los proyectos del usuario
  const todasLasTareas = proyectos.flatMap(proyecto => 
    (proyecto.tareas || []).map(tarea => ({
      ...tarea,
      proyectoNombre: proyecto.nombre,
      proyectoId: proyecto.id
    }))
  ).filter(tarea => tarea.fechaLimite)

  // Función para obtener tareas de un día específico
  const getTareasDelDia = (fecha: Date) => {
    return todasLasTareas.filter(tarea => {
      const fechaLimite = new Date(tarea.fechaLimite!)
      return (
        fechaLimite.getDate() === fecha.getDate() &&
        fechaLimite.getMonth() === fecha.getMonth() &&
        fechaLimite.getFullYear() === fecha.getFullYear()
      )
    })
  }

  // Generar días del mes
  const getDiasDelMes = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const primerDia = new Date(year, month, 1)
    const ultimoDia = new Date(year, month + 1, 0)
    
    const diasPrevios = primerDia.getDay()
    const diasDelMes = ultimoDia.getDate()
    
    const dias: Date[] = []
    
    // Días del mes anterior
    for (let i = diasPrevios - 1; i >= 0; i--) {
      const dia = new Date(year, month, -i)
      dias.push(dia)
    }
    
    // Días del mes actual
    for (let i = 1; i <= diasDelMes; i++) {
      dias.push(new Date(year, month, i))
    }
    
    // Días del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push(new Date(year, month + 1, i))
    }
    
    return dias
  }

  const mesAnterior = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const mesSiguiente = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const hoy = new Date()
  const dias = getDiasDelMes()
  const nombreMes = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'CRITICA': return 'bg-red-500'
      case 'ALTA': return 'bg-orange-500'
      case 'MEDIA': return 'bg-yellow-500'
      case 'BAJA': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Calendario</h1>
        <p className="text-muted-foreground mt-2">Vista de fechas límite de todas tus tareas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="capitalize">{nombreMes}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={mesAnterior}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoy
                </Button>
                <Button variant="outline" size="sm" onClick={mesSiguiente}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                <div key={dia} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {dias.map((dia, index) => {
                const esHoy = dia.toDateString() === hoy.toDateString()
                const esMesActual = dia.getMonth() === currentDate.getMonth()
                const tareasDelDia = getTareasDelDia(dia)
                const tieneTareas = tareasDelDia.length > 0

                return (
                  <div
                    key={index}
                    className={cn(
                      "min-h-24 p-2 rounded-lg border transition-colors",
                      esMesActual ? "bg-card" : "bg-muted/30",
                      esHoy && "border-primary border-2",
                      tieneTareas && "hover:bg-accent cursor-pointer"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        !esMesActual && "text-muted-foreground",
                        esHoy && "text-primary font-bold"
                      )}>
                        {dia.getDate()}
                      </span>
                      {tieneTareas && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                          {tareasDelDia.length}
                        </Badge>
                      )}
                    </div>

                    {/* Tareas del día */}
                    <div className="space-y-1">
                      {tareasDelDia.slice(0, 2).map((tarea) => (
                        <div
                          key={tarea.id}
                          className={cn(
                            "text-xs p-1 rounded truncate",
                            getPrioridadColor(tarea.prioridad),
                            "text-white font-medium"
                          )}
                          title={`${tarea.titulo} - ${tarea.proyectoNombre}`}
                        >
                          {tarea.titulo}
                        </div>
                      ))}
                      {tareasDelDia.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{tareasDelDia.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lista de próximas tareas */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Próximas Fechas Límite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todasLasTareas
                .filter(tarea => new Date(tarea.fechaLimite!) >= hoy)
                .sort((a, b) => new Date(a.fechaLimite!).getTime() - new Date(b.fechaLimite!).getTime())
                .slice(0, 10)
                .map(tarea => {
                  const fechaLimite = new Date(tarea.fechaLimite!)
                  const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div
                      key={tarea.id}
                      className="p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm line-clamp-1">{tarea.titulo}</h4>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs flex-shrink-0",
                            diasRestantes <= 1 && "bg-red-100 text-red-700",
                            diasRestantes <= 3 && diasRestantes > 1 && "bg-orange-100 text-orange-700"
                          )}
                        >
                          {diasRestantes === 0 ? 'Hoy' : diasRestantes === 1 ? 'Mañana' : `${diasRestantes}d`}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {tarea.proyectoNombre}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getPrioridadColor(tarea.prioridad)
                        )} />
                        <span className="text-xs text-muted-foreground">
                          {fechaLimite.toLocaleDateString('es-ES', { 
                            day: 'numeric', 
                            month: 'short' 
                          })}
                        </span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          {tarea.estado}
                        </Badge>
                      </div>
                    </div>
                  )
                })}

              {todasLasTareas.filter(t => new Date(t.fechaLimite!) >= hoy).length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay tareas con fecha límite próxima
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
