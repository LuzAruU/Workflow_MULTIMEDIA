"use client"

import type React from "react"

import { useState } from "react"
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
import { X, Plus } from "lucide-react"
import { createProyecto, fetchUsuario } from "@/lib/api"
import { useAppContext } from "@/lib/app-context"

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [miembrosInput, setMiembrosInput] = useState("")
  const [miembros, setMiembros] = useState<Array<{ uuid: string; nombre: string; rol: "ORGANIZADOR" | "EJECUTOR" | "QA" }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const { agregarProyecto, usuarioActual } = useAppContext()

  const handleAddMiembro = async () => {
    if (miembrosInput.trim()) {
      setIsLoading(true)
      try {
        // Buscar el usuario por UUID
        const usuario = await fetchUsuario(miembrosInput.trim())
        
        // Verificar si ya está agregado
        if (miembros.find(m => m.uuid === usuario.id)) {
          alert('Este usuario ya está agregado al proyecto')
          return
        }
        
        setMiembros([...miembros, { 
          uuid: usuario.id, 
          nombre: usuario.nombre,
          rol: "EJECUTOR" 
        }])
        setMiembrosInput("")
      } catch (error) {
        alert('Usuario no encontrado. Verifica el UUID.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRemoveMiembro = (uuid: string) => {
    setMiembros(miembros.filter((m) => m.uuid !== uuid))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!usuarioActual) {
      alert('No hay usuario autenticado. Por favor, inicia sesión de nuevo.')
      window.location.href = '/'
      return
    }
    
    setIsLoading(true)
    
    try {
      console.log('Usuario actual:', usuarioActual)
      console.log('Miembros a agregar:', miembros)
      
      const response = await createProyecto({
        nombre,
        descripcion: descripcion || '',
        estado: 'ABIERTO',
        miembros: [
          { usuarioId: usuarioActual.id, rol: 'ORGANIZADOR' },
          ...miembros.map(m => ({ usuarioId: m.uuid, rol: m.rol }))
        ]
      })
      
      console.log('Respuesta del servidor:', response)
      
      // Transformar la respuesta al formato del contexto
      const proyectoFormateado = {
        id: response.proyecto.id,
        nombre: response.proyecto.nombre,
        descripcion: response.proyecto.descripcion || '',
        estado: response.proyecto.estado,
        creadorId: usuarioActual!.id,
        miembros: response.proyecto.miembros || [],
        tareas: [],
        creadoEn: response.proyecto.creado_en || new Date().toISOString()
      }
      
      agregarProyecto(proyectoFormateado)
      
      // Reset form
      setNombre("")
      setDescripcion("")
      setMiembros([])
      onOpenChange(false)
      
      alert('¡Proyecto creado exitosamente!')
    } catch (error: any) {
      console.error('Error completo:', error)
      
      // Si el error es de autenticación, redirigir al login
      if (error.message.includes('autenticado') || error.message.includes('Auth')) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.')
        localStorage.removeItem('auth_token')
        window.location.href = '/'
        return
      }
      
      alert(`Error al crear el proyecto: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Set up a new QA project and add team members</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Project Name</Label>
            <Input
              id="nombre"
              placeholder="e.g., Database Migration"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Description</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe your project..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">You'll be set as ORGANIZADOR (Organizer)</p>
          </div>

          {/* Add Members */}
          <div className="space-y-2">
            <Label htmlFor="miembros">Add Team Members</Label>
            <p className="text-xs text-muted-foreground">Usa el UUID del usuario (de Settings)</p>
            <div className="flex gap-2">
              <Input
                id="miembros"
                placeholder="UUID del usuario"
                value={miembrosInput}
                onChange={(e) => setMiembrosInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddMiembro()
                  }
                }}
              />
              <Button type="button" size="sm" onClick={handleAddMiembro} disabled={isLoading}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Members List */}
            {miembros.length > 0 && (
              <div className="space-y-2">
                {miembros.map((miembro) => (
                  <div key={miembro.uuid} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{miembro.nombre}</p>
                      <p className="text-xs text-muted-foreground font-mono">{miembro.uuid.substring(0, 20)}...</p>
                      <p className="text-xs text-muted-foreground">{miembro.rol}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMiembro(miembro.uuid)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!nombre || isLoading}>
              {isLoading ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
