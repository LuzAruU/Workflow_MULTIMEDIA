"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Plus,
  MoreVertical,
  FolderOpen,
  ArchiveRestore,
  Settings,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { ProjectSettingsDialog } from "@/components/project-settings-dialog"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"

export function ProjectsContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("activos")
  const [filtro, setFiltro] = useState("")
  const { proyectos, setProyectoSeleccionado, setRolEnProyecto, usuarioActual } = useAppContext()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  // Esperar a que usuarioActual y proyectos estén listos antes de renderizar
  useEffect(() => {
    if (usuarioActual && proyectos) {
      setReady(true)
    }
  }, [usuarioActual, proyectos])

  // Si no está listo, muestra loading
  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  const handleEnterProject = (proyecto: any) => {
    const miembro = proyecto.miembros.find((m: any) => m.usuarioId === usuarioActual?.id)
    if (miembro) {
      setProyectoSeleccionado(proyecto)
      setRolEnProyecto(miembro.rol)
      router.push(`/workspace/${proyecto.id}`)
    }
  }

  const proyectosActivos = proyectos.filter((p) => p.estado !== "COMPLETADO" && p.estado !== "COMPLETADA")
  const proyectosCompletados = proyectos.filter((p) => p.estado === "COMPLETADO" || p.estado === "COMPLETADA")

  console.log('Proyectos totales:', proyectos.length)
  console.log('Proyectos activos:', proyectosActivos.length)
  console.log('Proyectos:', proyectos)

  const filtrarProyectos = (lista: any[]) => {
    return lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(filtro.toLowerCase()),
    )
  }

  const ProjectCard = ({ proyecto }: { proyecto: any }) => {
    const miembro = proyecto.miembros.find((m: any) => m.usuarioId === usuarioActual?.id)
    
    // Solo mostrar si el usuario es miembro
    if (!miembro) {
      return null
    }

    // Calcular progreso real basado en tareas
    const totalTareas = proyecto.tareas?.length || 0
    const tareasCompletadas = proyecto.tareas?.filter((t: any) => t.estado === 'COMPLETADA').length || 0
    const progreso = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0

    return (
      <Card className="hover:shadow-lg transition-all border-0 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-lg">{proyecto.nombre}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{proyecto.descripcion}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedProject(proyecto)
                    setIsSettingsOpen(true)
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveRestore className="w-4 h-4 mr-2" />
                  Ver Archivos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              {proyecto.estado === "EN_PROGRESO" ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  En Progreso
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Abierto
                </>
              )}
            </Badge>
            {miembro && (
              <Badge variant="outline" className="text-xs">
                Mi Rol: {miembro.rol === "ORGANIZADOR" ? "Organizador" : miembro.rol === "EJECUTOR" ? "Ejecutor" : "QA"}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progreso ({tareasCompletadas}/{totalTareas} tareas)</span>
              <span className="font-semibold">{progreso}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex -space-x-2">
              {proyecto.miembros.slice(0, 3).map((miembro: any, idx: number) => (
                <Avatar key={idx} className="h-8 w-8 border-2 border-card">
                  <AvatarImage src={miembro.avatar || "/placeholder.svg"} alt={miembro.nombre} />
                  <AvatarFallback className="text-xs">{miembro.nombre[0]}</AvatarFallback>
                </Avatar>
              ))}
              {proyecto.miembros.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-semibold">
                  +{proyecto.miembros.length - 3}
                </div>
              )}
            </div>
            <Button size="sm" onClick={() => handleEnterProject(proyecto)} className="gap-1">
              Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Mis Proyectos</h1>
          <p className="text-muted-foreground mt-2">Gestiona y visualiza todos tus proyectos QA</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Proyecto
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-fit grid-cols-2 bg-muted/40">
          <TabsTrigger value="activos">Proyectos Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        {/* Active Projects Tab */}
        <TabsContent value="activos" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar proyectos..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtrarProyectos(proyectosActivos).map((proyecto) => (
              <ProjectCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>

          {filtrarProyectos(proyectosActivos).length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-12 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No tienes proyectos activos</p>
                <p className="text-sm text-muted-foreground mt-1">Crea uno nuevo para comenzar</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="historial" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar en historial..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* History Grid */}
          <div className="space-y-3">
            {filtrarProyectos(proyectosCompletados).map((proyecto) => (
              <Card key={proyecto.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{proyecto.nombre}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Completado el {new Date(proyecto.creadoEn).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{proyecto.descripcion}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <Badge variant="secondary" className="mb-2 block">
                        {proyecto.estado}
                      </Badge>
                      <Button size="sm" onClick={() => handleEnterProject(proyecto)} className="gap-1 mt-2">
                        Ver Proyecto
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filtrarProyectos(proyectosCompletados).length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-12 text-center">
                <ArchiveRestore className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No hay proyectos completados</p>
                <p className="text-sm text-muted-foreground mt-1">Los proyectos finalizados aparecerán aquí</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateProjectDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
      {selectedProject && (
        <ProjectSettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} proyecto={selectedProject} />
      )}
    </div>
  )
}
