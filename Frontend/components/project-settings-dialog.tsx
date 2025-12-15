"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, UserPlus } from "lucide-react"
import { updateProyecto, fetchUsuarios } from "@/lib/api"
import { useAppContext, type Proyecto, type Miembro } from "@/lib/app-context"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyecto: Proyecto
}

export function ProjectSettingsDialog({ open, onOpenChange, proyecto }: ProjectSettingsDialogProps) {
  const [nombre, setNombre] = useState(proyecto.nombre)
  const [descripcion, setDescripcion] = useState(proyecto.descripcion)
  const [estado, setEstado] = useState(proyecto.estado)
  const [miembros, setMiembros] = useState(proyecto.miembros)
  const [nuevoMiembroId, setNuevoMiembroId] = useState("")
  const [nuevoMiembroRol, setNuevoMiembroRol] = useState<"ORGANIZADOR" | "EJECUTOR" | "QA">("EJECUTOR")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { actualizarProyecto } = useAppContext()
  const [usuariosDisponibles, setUsuariosDisponibles] = useState<any[]>([])
  const [openCombobox, setOpenCombobox] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<any>(null)

  useEffect(() => {
    setNombre(proyecto.nombre)
    setDescripcion(proyecto.descripcion)
    setEstado(proyecto.estado)
    setMiembros(proyecto.miembros)
    
    // Cargar usuarios disponibles
    cargarUsuarios()
  }, [proyecto])

  const cargarUsuarios = async () => {
    try {
      const usuarios = await fetchUsuarios()
      setUsuariosDisponibles(usuarios)
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    }
  }

  const handleAddMiembro = () => {
    if (usuarioSeleccionado) {
      const exists = miembros.find(m => m.usuarioId === usuarioSeleccionado.id)
      if (!exists) {
        setMiembros([
          ...miembros,
          {
            usuarioId: usuarioSeleccionado.id,
            nombre: usuarioSeleccionado.nombre,
            email: usuarioSeleccionado.email,
            avatar: usuarioSeleccionado.avatar || '',
            rol: nuevoMiembroRol
          }
        ])
        setUsuarioSeleccionado(null)
        setOpenCombobox(false)
      } else {
        alert('Este usuario ya está en el proyecto')
      }
    }
  }

  const handleRemoveMiembro = (usuarioId: string) => {
    // No permitir eliminar al organizador si es el único
    const organizadores = miembros.filter((m) => m.rol === "ORGANIZADOR")
    const miembro = miembros.find((m) => m.usuarioId === usuarioId)

    if (miembro?.rol === "ORGANIZADOR" && organizadores.length === 1) {
      alert("No puedes eliminar al único organizador del proyecto")
      return
    }

    setMiembros(miembros.filter((m) => m.usuarioId !== usuarioId))
  }

  const handleChangeRol = (usuarioId: string, nuevoRol: "ORGANIZADOR" | "EJECUTOR" | "QA") => {
    setMiembros(
      miembros.map((m) => (m.usuarioId === usuarioId ? { ...m, rol: nuevoRol } : m)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await updateProyecto(proyecto.id, {
        nombre,
        descripcion,
        estado,
        miembros: miembros.map((m) => ({
          usuarioId: m.usuarioId,
          rol: m.rol,
        })),
      })

      console.log("Proyecto actualizado:", response)

      const proyectoActualizado = {
        ...proyecto,
        nombre,
        descripcion,
        estado,
        miembros: response.proyecto.miembros,
      }

      actualizarProyecto(proyectoActualizado)
      onOpenChange(false)
      alert("¡Proyecto actualizado exitosamente!")
    } catch (error: any) {
      console.error("Error al actualizar:", error)
      alert(`Error al actualizar el proyecto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuración del Proyecto</DialogTitle>
          <DialogDescription>
            Actualiza los detalles del proyecto y gestiona los miembros del equipo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Proyecto</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={estado} onValueChange={(value: any) => setEstado(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ABIERTO">Abierto</SelectItem>
                  <SelectItem value="EN_PROGRESO">En Progreso</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gestión de Miembros */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label className="text-base">Miembros del Equipo</Label>
              <p className="text-sm text-muted-foreground">
                Gestiona quién tiene acceso a este proyecto
              </p>
            </div>

            {/* Agregar Nuevo Miembro */}
            <div className="flex gap-2">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="flex-1 justify-between"
                  >
                    {usuarioSeleccionado
                      ? `${usuarioSeleccionado.nombre} (${usuarioSeleccionado.email})`
                      : "Seleccionar usuario..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar usuario..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                      <CommandGroup>
                        {usuariosDisponibles.map((usuario) => (
                          <CommandItem
                            key={usuario.id}
                            value={`${usuario.nombre} ${usuario.email}`}
                            onSelect={() => {
                              setUsuarioSeleccionado(usuario)
                              setOpenCombobox(false)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={usuario.avatar} alt={usuario.nombre} />
                                <AvatarFallback>{usuario.nombre[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{usuario.nombre}</span>
                                <span className="text-xs text-muted-foreground">{usuario.email}</span>
                              </div>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                usuarioSeleccionado?.id === usuario.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              <Select value={nuevoMiembroRol} onValueChange={(value: any) => setNuevoMiembroRol(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                  <SelectItem value="EJECUTOR">Ejecutor</SelectItem>
                  <SelectItem value="QA">QA</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                size="icon" 
                onClick={handleAddMiembro}
                disabled={!usuarioSeleccionado}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Lista de Miembros */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {miembros.map((miembro) => (
                <div
                  key={miembro.usuarioId}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={miembro.avatar} alt={miembro.nombre} />
                      <AvatarFallback>{miembro.nombre[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{miembro.nombre}</p>
                      <p className="text-xs text-muted-foreground">{miembro.email || miembro.usuarioId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={miembro.rol}
                      onValueChange={(value: any) => handleChangeRol(miembro.usuarioId, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ORGANIZADOR">Organizador</SelectItem>
                        <SelectItem value="EJECUTOR">Ejecutor</SelectItem>
                        <SelectItem value="QA">QA</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMiembro(miembro.usuarioId)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
