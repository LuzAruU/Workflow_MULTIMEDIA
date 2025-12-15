"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { useState } from "react"

interface ImageViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  imageName: string
}

export function ImageViewerDialog({ open, onOpenChange, imageUrl, imageName }: ImageViewerDialogProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)

  // Construir la URL completa correctamente
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fullImageUrl
    link.download = imageName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden" hideCloseButton>
        {/* Título oculto para accesibilidad */}
        <VisuallyHidden>
          <DialogTitle>Visor de imagen: {imageName}</DialogTitle>
        </VisuallyHidden>

        {/* Header con fondo oscuro para mejor contraste */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-semibold truncate text-lg">{imageName}</h3>
            <p className="text-xs text-slate-300">Vista previa de imagen</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                disabled={zoom <= 25}
                className="h-8 w-8 p-0 hover:bg-slate-700 text-white disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono w-16 text-center">{zoom}%</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
                className="h-8 w-8 p-0 hover:bg-slate-700 text-white disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            {/* Botón Rotar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="h-8 w-8 p-0 hover:bg-slate-700 text-white"
              title="Rotar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            {/* Botón Descargar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0 hover:bg-slate-700 text-white"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Botón Cerrar */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-slate-700 text-white"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Contenedor de la imagen con fondo oscuro */}
        <div className="relative h-[calc(90vh-72px)] bg-slate-950 flex items-center justify-center overflow-auto p-4">
          <div className="relative">
            <img
              src={fullImageUrl}
              alt={imageName}
              style={{ 
                width: zoom === 100 ? 'auto' : `${zoom}%`,
                maxWidth: zoom === 100 ? '100%' : 'none',
                maxHeight: zoom === 100 ? 'calc(90vh - 120px)' : 'none',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease'
              }}
              className="object-contain"
              onError={(e) => {
                console.error('Error loading image:', fullImageUrl)
                e.currentTarget.onerror = null
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EError cargando imagen%3C/text%3E%3C/svg%3E'
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
