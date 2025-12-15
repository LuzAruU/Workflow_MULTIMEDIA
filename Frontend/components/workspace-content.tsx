"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppContext } from "@/lib/app-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskListView } from "@/components/task-list-view"
import { FilesView } from "@/components/files-view"
import { MembersView } from "@/components/members-view"
import { ProjectChat } from "@/components/project-chat"
import { TaskHistoryView } from "@/components/task-history-view"
import { RepositoryView } from "@/components/repository-view"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, ListTodo, FileStack, Users, MessageCircle, History, Archive } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"

export function WorkspaceContent() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("board")
  const { proyectoSeleccionado, setProyectoSeleccionado, proyectos } = useAppContext()
  const params = useParams()
  
  // Cargar el proyecto cuando se monta el componente
  useEffect(() => {
    if (params?.id && !proyectoSeleccionado) {
      const proyecto = proyectos.find(p => p.id === params.id)
      if (proyecto) {
        setProyectoSeleccionado(proyecto)
      }
    }
  }, [params, proyectos, proyectoSeleccionado, setProyectoSeleccionado])

  const tabs = [
    { id: "board", label: "Tablero", icon: LayoutGrid },
    { id: "list", label: "Lista", icon: ListTodo },
    { id: "files", label: "Archivos", icon: FileStack },
    { id: "members", label: "Equipo", icon: Users },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "history", label: "Historial", icon: History },
    { id: "repository", label: "Repositorio", icon: Archive },
  ]

  // Solo renderizar si hay proyecto seleccionado
  if (!proyectoSeleccionado) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando proyecto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{proyectoSeleccionado?.nombre || "Espacio de Trabajo"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {proyectoSeleccionado?.tareas?.length || 0} tareas • Estado: {proyectoSeleccionado?.estado}
          </p>
        </div>
        <Button onClick={() => setIsCreateTaskOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nueva Tarea
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-8 border-b border-border/50 bg-card/30">
          <TabsList className="grid w-fit grid-cols-7 bg-transparent border-0 gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-3 gap-2 text-sm font-medium transition-all"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        {/* Existing code */}
        <TabsContent value="board" className="flex-1 overflow-auto">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="list" className="flex-1 overflow-auto">
          <TaskListView />
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-auto">
          <FilesView />
        </TabsContent>

        <TabsContent value="members" className="flex-1 overflow-auto">
          <MembersView />
        </TabsContent>

        <TabsContent value="chat" className="flex-1 overflow-auto p-6">
          <ProjectChat />
        </TabsContent>

        <TabsContent value="history" className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Historial del Proyecto</h2>
              <p className="text-sm text-muted-foreground mt-1">Registro completo de eventos y cambios</p>
            </div>
            <TaskHistoryView />
          </div>
        </TabsContent>

        <TabsContent value="repository" className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Repositorio de Archivos</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Todos los archivos del proyecto organizados por contexto
              </p>
            </div>
            <RepositoryView />
          </div>
        </TabsContent>
      </Tabs>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        proyectoId={proyectoSeleccionado.id}
        miembros={proyectoSeleccionado.miembros}
      />
    </div>
  )
}
