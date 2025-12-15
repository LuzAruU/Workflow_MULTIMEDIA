"use client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Paperclip, X, Plus } from "lucide-react"
import { createTarea, subirAdjunto } from "@/lib/api"
import { useAppContext } from "@/lib/app-context"
import { FileText } from "lucide-react"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proyectoId: string
  miembros: any[]
}

export function CreateTaskDialog({ open, onOpenChange, proyectoId, miembros }: CreateTaskDialogProps) {
  // Log para debug
  console.log('CreateTaskDialog props:', { proyectoId, miembrosCount: miembros?.length })
  
  const [titulo, setTitulo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [prioridad, setPrioridad] = useState("MEDIA")
  const [fechaLimite, setFechaLimite] = useState<Date>()
  const [ejecutorId, setEjecutorId] = useState<string>()
  const [qaId, setQaId] = useState<string>()
  const [archivos, setArchivos] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { agregarTarea } = useAppContext()

  const ejecutores = (miembros || []).filter(m => m.rol === 'EJECUTOR' || m.rol === 'ORGANIZADOR')
  const reviewers = (miembros || []).filter(m => m.rol === 'QA' || m.rol === 'ORGANIZADOR')

  const handleAgregarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevosArchivos = Array.from(e.target.files || [])
    setArchivos([...archivos, ...nuevosArchivos])
  }

  const handleEliminarArchivo = (index: number) => {
    setArchivos(archivos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Datos a enviar:', {
        proyecto_id: proyectoId,
        titulo,
        descripcion,
        prioridad,
        fecha_limite: fechaLimite ? format(fechaLimite, 'yyyy-MM-dd HH:mm:ss') : undefined,
        ejecutor_id: ejecutorId === 'sin-asignar' ? undefined : ejecutorId,
        qa_id: qaId === 'sin-asignar' ? undefined : qaId
      })

      if (!proyectoId) {
        alert('Error: No se pudo obtener el ID del proyecto')
        return
      }

      const response = await createTarea({
        proyecto_id: proyectoId,
        titulo,
        descripcion,
        prioridad,
        fecha_limite: fechaLimite ? format(fechaLimite, 'yyyy-MM-dd HH:mm:ss') : undefined,
        ejecutor_id: ejecutorId === 'sin-asignar' ? undefined : ejecutorId,
        qa_id: qaId === 'sin-asignar' ? undefined : qaId
      })

      console.log('Tarea creada:', response)

      const tareaFormateada = {
        id: response.tarea.id,
        titulo: response.tarea.titulo,
        descripcion: response.tarea.descripcion,
        prioridad: mapPrioridad(response.tarea.prioridad),
        estado: mapEstado(response.tarea.estado),
        ejecutorId: response.tarea.ejecutor?.id,
        qaId: response.tarea.qa?.id,
        solicitanteId: response.tarea.solicitante,
        fechaLimite: response.tarea.fecha_limite,
        creadoEn: new Date().toISOString(),
        adjuntos: []
      }

      agregarTarea(proyectoId, tareaFormateada)

      // Si se creó la tarea y hay archivos, subirlos
      if (response.tarea.id && archivos.length > 0) {
        for (const archivo of archivos) {
          const formData = new FormData()
          formData.append('archivo', archivo) // archivo: File
          formData.append('tipo_recurso', archivo.type.startsWith('image/') ? 'IMAGEN' : 'DOCUMENTO') // Ej: 'DOCUMENTO'
          formData.append('nombre_archivo', archivo.name)
          formData.append('contexto', 'SOLICITUD') // Ej: 'SOLICITUD'
          formData.append('id_padre', response.tarea.id) // id de la tarea, entrega o revisión
          formData.append('subido_por', 'usuarioActual.id') // Cambiar por el ID del usuario actual
          await subirAdjunto(formData)
        }
      }

      // Reset form
      setTitulo("")
      setDescripcion("")
      setPrioridad("MEDIA")
      setFechaLimite(undefined)
      setEjecutorId(undefined)
      setQaId(undefined)
      setArchivos([])
      onOpenChange(false)

      alert('¡Tarea creada exitosamente!')
    } catch (error: any) {
      console.error('Error al crear tarea:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Tarea</DialogTitle>
          <DialogDescription>
            Crea una nueva tarea para este proyecto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              placeholder="Ej: Implementar login de usuarios"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              placeholder="Describe los detalles de la tarea..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prioridad */}
            <div className="space-y-2">
              <Label>Prioridad *</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="CRÍTICA">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Límite */}
            <div className="space-y-2">
              <Label>Fecha Límite</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaLimite && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaLimite ? format(fechaLimite, "PPP") : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaLimite}
                    onSelect={setFechaLimite}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ejecutor */}
            <div className="space-y-2">
              <Label>Asignar a (Ejecutor)</Label>
              <Select value={ejecutorId} onValueChange={setEjecutorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                  {ejecutores.map((miembro) => (
                    <SelectItem key={miembro.usuarioId} value={miembro.usuarioId}>
                      {miembro.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* QA */}
            <div className="space-y-2">
              <Label>Revisor QA</Label>
              <Select value={qaId} onValueChange={setQaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                  {reviewers.map((miembro) => (
                    <SelectItem key={miembro.usuarioId} value={miembro.usuarioId}>
                      {miembro.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div className="space-y-2">
            <Label htmlFor="archivos">Archivos Adjuntos (opcional)</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <Input
                id="archivos"
                type="file"
                multiple
                onChange={handleAgregarArchivo}
                className="hidden"
              />
              <label
                htmlFor="archivos"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Haz clic para adjuntar archivos
                </p>
              </label>
            </div>

            {archivos.length > 0 && (
              <div className="space-y-2 mt-3">
                {archivos.map((archivo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm truncate">{archivo.name}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        ({(archivo.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEliminarArchivo(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
            <Button type="submit" disabled={!titulo || isLoading}>
              {isLoading ? 'Creando...' : 'Crear Tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Funciones auxiliares
function mapEstado(estadoBackend: string): any {
  const mapeo: Record<string, string> = {
    'TAREA_CREADA': 'BACKLOG',
    'TAREA_ASIGNADA': 'ASIGNADA',
    'TAREA_EN_PROGRESO': 'EN_PROGRESO',
    'TAREA_TERMINADA_PENDIENTE_QA': 'PENDIENTE_QA',
    'TAREA_EN_REVISION': 'EN_REVISION',
    'TAREA_CAMBIOS_SOLICITADOS': 'CORRECCION_NECESARIA',
    'TAREA_COMPLETADA': 'COMPLETADA'
  }
  return mapeo[estadoBackend] || 'BACKLOG'
}

function mapPrioridad(prioridadBackend: string): any {
  const mapeo: Record<string, string> = {
    'BAJA': 'BAJA',
    'MEDIA': 'MEDIA',
    'ALTA': 'ALTA',
    'CRÍTICA': 'CRITICA'
  }
  return mapeo[prioridadBackend] || 'MEDIA'
}
