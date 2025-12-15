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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, Paperclip, X } from "lucide-react"
import { crearEntrega, subirAdjunto } from "@/lib/api"

interface CrearEntregaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tareaId: string
  onEntregaCreada: () => void
  esInicioTarea?: boolean
}

export function CrearEntregaDialog({
  open,
  onOpenChange,
  tareaId,
  onEntregaCreada,
  esInicioTarea = false,
}: CrearEntregaDialogProps) {
  const [resumen, setResumen] = useState("")
  const [metodologia, setMetodologia] = useState("")
  const [archivos, setArchivos] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
      console.log('=== CREAR ENTREGA ===')
      console.log('Datos:', { tarea_id: tareaId, resumen, metodologia })

      // Crear la entrega
      const response = await crearEntrega({
        tarea_id: tareaId,
        resumen,
        metodologia: metodologia || undefined
      })

      console.log('Entrega creada:', response.entrega)

      // Subir archivos adjuntos con el ID de la ENTREGA como id_padre
      if (archivos.length > 0) {
        console.log(`Subiendo ${archivos.length} archivos...`)
        
        for (const archivo of archivos) {
          const formData = new FormData()
          formData.append('id_padre', response.entrega.id) // ID de la entrega, NO de la tarea
          formData.append('tipo_recurso', archivo.type.startsWith('image/') ? 'IMAGEN' : 'DOCUMENTO')
          formData.append('contexto', 'ENTREGA')
          formData.append('archivo', archivo)

          console.log('Subiendo archivo:', {
            nombre: archivo.name,
            tipo: archivo.type.startsWith('image/') ? 'IMAGEN' : 'DOCUMENTO',
            id_padre: response.entrega.id,
            contexto: 'ENTREGA'
          })

          const adjuntoResponse = await subirAdjunto(formData)
          console.log('Archivo subido:', adjuntoResponse)
        }
      }

      // Reset form
      setResumen("")
      setMetodologia("")
      setArchivos([])
      onOpenChange(false)
      onEntregaCreada()

      alert(`¡Entrega v${response.entrega.numero_version} creada exitosamente!`)
    } catch (error: any) {
      console.error('Error completo:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {esInicioTarea ? 'Iniciar Tarea' : 'Crear Entrega'}
          </DialogTitle>
          <DialogDescription>
            {esInicioTarea 
              ? 'Describe cómo abordarás esta tarea y adjunta archivos de referencia'
              : 'Documenta tu trabajo y adjunta los archivos de evidencia'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resumen */}
          <div className="space-y-2">
            <Label htmlFor="resumen">
              {esInicioTarea ? 'Plan de Trabajo *' : 'Resumen del Trabajo *'}
            </Label>
            <Textarea
              id="resumen"
              placeholder={
                esInicioTarea 
                  ? 'Describe cómo planeas completar esta tarea...'
                  : 'Describe qué completaste en esta entrega...'
              }
              value={resumen}
              onChange={(e) => setResumen(e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Metodología */}
          <div className="space-y-2">
            <Label htmlFor="metodologia">
              {esInicioTarea ? 'Metodología Propuesta *' : 'Metodología (Opcional)'}
            </Label>
            <Textarea
              id="metodologia"
              placeholder={
                esInicioTarea
                  ? 'Explica tu enfoque, herramientas a utilizar, pasos a seguir...'
                  : 'Explica cómo abordaste la tarea, herramientas utilizadas, etc.'
              }
              value={metodologia}
              onChange={(e) => setMetodologia(e.target.value)}
              required={esInicioTarea}
              rows={3}
            />
          </div>

          {/* Archivos Adjuntos */}
          <div className="space-y-2">
            <Label htmlFor="archivos">
              {esInicioTarea ? 'Archivos de Referencia' : 'Archivos de Evidencia'}
            </Label>
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
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
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
                      <Paperclip className="w-4 h-4 text-primary flex-shrink-0" />
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
            <Button 
              type="submit" 
              disabled={isLoading || !resumen || (esInicioTarea && !metodologia)} 
              className="gap-2"
            >
              {isLoading ? (
                'Procesando...'
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {esInicioTarea ? 'Iniciar y Enviar a QA' : 'Enviar a QA'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
