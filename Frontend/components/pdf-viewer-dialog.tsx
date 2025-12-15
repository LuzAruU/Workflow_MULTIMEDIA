"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Button } from "@/components/ui/button"
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { useState } from "react"

interface PdfViewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pdfUrl: string
  pdfName: string
}

export function PdfViewerDialog({ open, onOpenChange, pdfUrl, pdfName }: PdfViewerDialogProps) {
  const [zoom, setZoom] = useState(100)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = pdfName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden" hideCloseButton>
        <VisuallyHidden>
          <DialogTitle>Visor de PDF: {pdfName}</DialogTitle>
        </VisuallyHidden>

        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-700">
          <div className="flex-1 min-w-0 mr-4">
            <h3 className="font-semibold truncate text-lg">{pdfName}</h3>
            <p className="text-xs text-slate-300">Vista previa de PDF</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Controles de Zoom */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg px-2 py-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                disabled={zoom <= 50}
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

        {/* PDF Viewer */}
        <div className="h-[calc(90vh-72px)] bg-slate-950">
          <iframe
            src={`${pdfUrl}#zoom=${zoom}`}
            className="w-full h-full border-0"
            title={pdfName}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
