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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle, XCircle } from "lucide-react"
import { crearRevisionQA } from "@/lib/api"

interface CrearRevisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entregaId: string
  numeroVersion: number
  onRevisionCreada: () => void
}

export function CrearRevisionDialog({
  open,
  onOpenChange,
  entregaId,
  numeroVersion,
  onRevisionCreada,
}: CrearRevisionDialogProps) {
  const [veredicto, setVeredicto] = useState<'APROBAR' | 'SOLICITAR_CAMBIOS'>('APROBAR')
  const [retroalimentacion, setRetroalimentacion] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await crearRevisionQA(entregaId, {
        veredicto,
        texto_retroalimentacion: retroalimentacion || undefined
      })

      // Reset form
      setVeredicto('APROBAR')
      setRetroalimentacion("")
      onOpenChange(false)
      onRevisionCreada()

      const mensaje = veredicto === 'APROBAR' 
        ? '¡Tarea aprobada exitosamente!' 
        : 'Cambios solicitados. La tarea regresó al ejecutor.'
      
      alert(mensaje)
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Revisar Entrega v{numeroVersion}</DialogTitle>
          <DialogDescription>
            Proporciona tu veredicto y retroalimentación al ejecutor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Veredicto */}
          <div className="space-y-3">
            <Label>Veredicto *</Label>
            <RadioGroup value={veredicto} onValueChange={(value: any) => setVeredicto(value)}>
              <div className="flex items-center space-x-2 p-3 border-2 border-green-200 rounded-lg bg-green-50 hover:border-green-300 transition-colors">
                <RadioGroupItem value="APROBAR" id="aprobar" />
                <Label
                  htmlFor="aprobar"
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Aprobar</p>
                    <p className="text-xs text-green-700">El trabajo cumple con los requisitos</p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border-2 border-red-200 rounded-lg bg-red-50 hover:border-red-300 transition-colors">
                <RadioGroupItem value="SOLICITAR_CAMBIOS" id="rechazar" />
                <Label
                  htmlFor="rechazar"
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Solicitar Cambios</p>
                    <p className="text-xs text-red-700">Se requieren correcciones</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Retroalimentación */}
          <div className="space-y-2">
            <Label htmlFor="retroalimentacion">
              Retroalimentación {veredicto === 'SOLICITAR_CAMBIOS' && '*'}
            </Label>
            <Textarea
              id="retroalimentacion"
              placeholder={
                veredicto === 'APROBAR'
                  ? "Comentarios positivos, sugerencias..."
                  : "Explica qué cambios se necesitan..."
              }
              value={retroalimentacion}
              onChange={(e) => setRetroalimentacion(e.target.value)}
              required={veredicto === 'SOLICITAR_CAMBIOS'}
              rows={4}
            />
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
              disabled={isLoading || (veredicto === 'SOLICITAR_CAMBIOS' && !retroalimentacion)}
              className={veredicto === 'APROBAR' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isLoading ? 'Enviando...' : 'Enviar Revisión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
