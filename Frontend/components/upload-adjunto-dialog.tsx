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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Link as LinkIcon } from "lucide-react"
import { subirAdjunto } from "@/lib/api"

interface UploadAdjuntoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tareaId: string
  contexto: "SOLICITUD" | "ENTREGA" | "REVISION"
  onAdjuntoSubido: () => void
}

export function UploadAdjuntoDialog({
  open,
  onOpenChange,
  tareaId,
  contexto,
  onAdjuntoSubido,
}: UploadAdjuntoDialogProps) {
  const [tipoRecurso, setTipoRecurso] = useState<"IMAGEN" | "DOCUMENTO" | "ENLACE" | "OTRO">("DOCUMENTO")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [url, setUrl] = useState("")
  const [nombreArchivo, setNombreArchivo] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('id_padre', tareaId)
      formData.append('tipo_recurso', tipoRecurso)
      formData.append('contexto', contexto)

      if (tipoRecurso === 'ENLACE') {
        formData.append('url', url)
        formData.append('nombre_archivo', nombreArchivo || url)
      } else if (archivo) {
        formData.append('archivo', archivo)
        if (nombreArchivo) {
          formData.append('nombre_archivo', nombreArchivo)
        }
      }

      await subirAdjunto(formData)
      
      // Reset form
      setArchivo(null)
      setUrl("")
      setNombreArchivo("")
      setTipoRecurso("DOCUMENTO")
      onOpenChange(false)
      onAdjuntoSubido()
      
      alert('¡Adjunto subido exitosamente!')
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Adjunto</DialogTitle>
          <DialogDescription>
            Sube un archivo o enlace relacionado con esta tarea
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Recurso */}
          <div className="space-y-2">
            <Label>Tipo de Recurso</Label>
            <Select value={tipoRecurso} onValueChange={(value: any) => setTipoRecurso(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IMAGEN">Imagen</SelectItem>
                <SelectItem value="DOCUMENTO">Documento</SelectItem>
                <SelectItem value="ENLACE">Enlace</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Si es enlace, mostrar input de URL */}
          {tipoRecurso === 'ENLACE' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreArchivo">Nombre (opcional)</Label>
                <Input
                  id="nombreArchivo"
                  placeholder="Ej: Diseño final"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              {/* Subir archivo */}
              <div className="space-y-2">
                <Label htmlFor="archivo">Archivo *</Label>
                <Input
                  id="archivo"
                  type="file"
                  accept={tipoRecurso === 'IMAGEN' ? 'image/*' : '*/*'}
                  onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                  required
                />
                {archivo && (
                  <p className="text-xs text-muted-foreground">
                    {archivo.name} ({(archivo.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreArchivo">Nombre personalizado (opcional)</Label>
                <Input
                  id="nombreArchivo"
                  placeholder="Ej: Informe final v2"
                  value={nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                />
              </div>
            </>
          )}

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
              disabled={isLoading || (tipoRecurso === 'ENLACE' ? !url : !archivo)}
              className="gap-2"
            >
              {isLoading ? (
                'Subiendo...'
              ) : (
                <>
                  {tipoRecurso === 'ENLACE' ? <LinkIcon className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  Subir
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
