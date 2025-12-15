"use client"

import { useEffect, useState } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  FolderOpen,
  ListTodo,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardContent() {
  const { proyectos, usuarioActual, setProyectoSeleccionado, setRolEnProyecto } = useAppContext()
  const router = useRouter()
  const [estadisticas, setEstadisticas] = useState({
    proyectosActivos: 0,
    totalTareas: 0,
    tareasAsignadas: 0,
    tareasCompletadas: 0,
    tareasPendientes: 0,
    tareasAtrasadas: 0,
    proximasTareas: [] as any[],
  })

  useEffect(() => {
    if (!usuarioActual || !proyectos) return

    // Calcular estadísticas
    const proyectosActivos = proyectos.filter(
      (p) =>
        p.estado !== "COMPLETADO" &&
        p.estado !== "CANCELADO" &&
        p.miembros.some((m) => m.usuarioId === usuarioActual.id)
    ).length

    let totalTareas = 0
    let tareasAsignadas = 0
    let tareasCompletadas = 0
    let tareasPendientes = 0
    let tareasAtrasadas = 0
    const proximasTareas: any[] = []
    const hoy = new Date()

    proyectos.forEach((proyecto) => {
      if (proyecto.tareas) {
        proyecto.tareas.forEach((tarea) => {
          // Contar tareas donde el usuario es ejecutor o QA
          if (tarea.ejecutorId === usuarioActual.id || tarea.qaId === usuarioActual.id) {
            totalTareas++

            if (tarea.estado === "COMPLETADA") {
              tareasCompletadas++
            } else {
              tareasAsignadas++

              if (tarea.estado === "BACKLOG" || tarea.estado === "ASIGNADA") {
                tareasPendientes++
              }

              // Verificar si está atrasada
              if (tarea.fechaLimite) {
                const fechaLimite = new Date(tarea.fechaLimite)
                if (fechaLimite < hoy) {
                  tareasAtrasadas++
                }

                // Agregar a próximas tareas si está cerca
                const diasRestantes = Math.ceil(
                  (fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
                )
                if (diasRestantes >= 0 && diasRestantes <= 7) {
                  proximasTareas.push({
                    ...tarea,
                    proyectoNombre: proyecto.nombre,
                    proyectoId: proyecto.id,
                    diasRestantes,
                  })
                }
              }
            }
          }
        })
      }
    })

    // Ordenar próximas tareas por fecha límite
    proximasTareas.sort((a, b) => a.diasRestantes - b.diasRestantes)

    setEstadisticas({
      proyectosActivos,
      totalTareas,
      tareasAsignadas,
      tareasCompletadas,
      tareasPendientes,
      tareasAtrasadas,
      proximasTareas: proximasTareas.slice(0, 5),
    })
  }, [proyectos, usuarioActual])

  const handleIrAProyecto = (proyectoId: string) => {
    const proyecto = proyectos.find((p) => p.id === proyectoId)
    if (proyecto) {
      const miembro = proyecto.miembros.find((m) => m.usuarioId === usuarioActual?.id)
      if (miembro) {
        setProyectoSeleccionado(proyecto)
        setRolEnProyecto(miembro.rol)
        router.push(`/workspace/${proyectoId}`)
      }
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "CRITICA":
        return "bg-red-500 text-white"
      case "ALTA":
        return "bg-orange-500 text-white"
      case "MEDIA":
        return "bg-yellow-500 text-white"
      case "BAJA":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (!usuarioActual) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No hay usuario conectado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          ¡Bienvenido, {usuarioActual.nombre.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-2">Aquí está tu resumen de actividad en VeriFlow</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Proyectos Activos */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proyectos Activos
            </CardTitle>
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {estadisticas.proyectosActivos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {proyectos.length} proyectos totales
            </p>
          </CardContent>
        </Card>

        {/* Tareas Asignadas */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tareas Asignadas
            </CardTitle>
            <ListTodo className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {estadisticas.tareasAsignadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {estadisticas.tareasPendientes} pendientes de iniciar
            </p>
          </CardContent>
        </Card>

        {/* Tareas Completadas */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completadas
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {estadisticas.tareasCompletadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {estadisticas.totalTareas > 0
                ? Math.round((estadisticas.tareasCompletadas / estadisticas.totalTareas) * 100)
                : 0}% de {estadisticas.totalTareas} totales
            </p>
          </CardContent>
        </Card>

        {/* Tareas Atrasadas */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atrasadas
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {estadisticas.tareasAtrasadas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {estadisticas.tareasAtrasadas > 0 ? "Requieren atención" : "Todo al día"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Tareas */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximas Fechas Límite
            </CardTitle>
          </CardHeader>
          <CardContent>
            {estadisticas.proximasTareas.length > 0 ? (
              <div className="space-y-3">
                {estadisticas.proximasTareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleIrAProyecto(tarea.proyectoId)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{tarea.titulo}</h4>
                      <Badge
                        variant="secondary"
                        className={`text-xs flex-shrink-0 ${
                          tarea.diasRestantes === 0
                            ? "bg-red-100 text-red-700"
                            : tarea.diasRestantes <= 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {tarea.diasRestantes === 0
                          ? "Hoy"
                          : tarea.diasRestantes === 1
                          ? "Mañana"
                          : `${tarea.diasRestantes}d`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {tarea.proyectoNombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getPrioridadColor(tarea.prioridad)}>
                        {tarea.prioridad}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tarea.estado}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay tareas con fecha límite próxima
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proyectos Recientes */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Proyectos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {proyectos.length > 0 ? (
              <div className="space-y-3">
                {proyectos
                  .filter((p) => p.miembros.some((m) => m.usuarioId === usuarioActual.id))
                  .slice(0, 5)
                  .map((proyecto) => {
                    const miembro = proyecto.miembros.find((m) => m.usuarioId === usuarioActual.id)
                    const totalTareas = proyecto.tareas?.length || 0
                    const tareasCompletadas = proyecto.tareas?.filter((t) => t.estado === "COMPLETADA")
                      .length || 0
                    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0

                    return (
                      <div
                        key={proyecto.id}
                        className="p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        onClick={() => handleIrAProyecto(proyecto.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">{proyecto.nombre}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {proyecto.descripcion}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {miembro?.rol}
                          </Badge>
                        </div>

                        {/* Barra de progreso */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{tareasCompletadas}/{totalTareas} tareas</span>
                            <span className="font-semibold">{progreso}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                        </div>

                        {/* Miembros */}
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <div className="flex -space-x-2">
                            {proyecto.miembros.slice(0, 3).map((m, idx) => (
                              <Avatar key={idx} className="h-5 w-5 border-2 border-card">
                                <AvatarImage src={m.avatar || undefined} alt={m.nombre} />
                                <AvatarFallback className="text-[10px]">
                                  {m.nombre[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {proyecto.miembros.length > 3 && (
                              <div className="h-5 w-5 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-semibold">
                                +{proyecto.miembros.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">
                  No tienes proyectos aún
                </p>
                <Button size="sm" onClick={() => router.push("/projects")}>
                  Crear Proyecto
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => router.push("/projects")}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="font-medium">Ver Proyectos</span>
              <span className="text-xs text-muted-foreground">
                {estadisticas.proyectosActivos} activos
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => router.push("/calendar")}
            >
              <Calendar className="w-6 h-6" />
              <span className="font-medium">Calendario</span>
              <span className="text-xs text-muted-foreground">Ver fechas límite</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => router.push("/settings")}
            >
              <Users className="w-6 h-6" />
              <span className="font-medium">Configuración</span>
              <span className="text-xs text-muted-foreground">Gestionar cuenta</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
