"use client"

import { useState, useEffect } from "react"
import { useAppContext } from "@/lib/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  File, 
  Search,
  Download,
  Eye,
  FolderOpen
} from "lucide-react"
import { fetchAdjuntos, fetchEntregas } from "@/lib/api"
import { ImageViewerDialog } from "@/components/image-viewer-dialog"
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog"

interface Adjunto {
  id: string
  tipo_recurso: string
  url: string
  nombre_archivo: string
  contexto: string
  subido_por: {
    id: string
    nombre: string
    avatar: string
  }
  subido_en: string
}

interface Entrega {
  id: string
  numero_version: number
  resumen: string
  entregado_en: string
}

export function FilesView() {
  const { proyectoSeleccionado } = useAppContext()
  const [archivos, setArchivos] = useState<Record<string, Adjunto[]>>({})
  const [entregas, setEntregas] = useState<Record<string, Entrega[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [filtro, setFiltro] = useState("")
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; nombre: string } | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; nombre: string } | null>(null)

  useEffect(() => {
    const cargarArchivos = async () => {
      if (!proyectoSeleccionado?.tareas) return
      
      setIsLoading(true)
      try {
        const archivosMap: Record<string, Adjunto[]> = {}
        const entregasMap: Record<string, Entrega[]> = {}

        for (const tarea of proyectoSeleccionado.tareas) {
          // Cargar adjuntos de la tarea (SOLICITUD)
          try {
            const adjuntosTarea = await fetchAdjuntos(tarea.id)
            archivosMap[tarea.id] = adjuntosTarea
          } catch (error) {
            console.error(`Error cargando adjuntos de tarea ${tarea.id}:`, error)
            archivosMap[tarea.id] = []
          }

          // Cargar entregas de la tarea (ENTREGA y REVISION)
          try {
            const entregasTarea = await fetchEntregas(tarea.id)
            entregasMap[tarea.id] = entregasTarea
            
            // Cargar adjuntos de cada entrega
            for (const entrega of entregasTarea) {
              if (entrega.adjuntos && entrega.adjuntos.length > 0) {
                archivosMap[tarea.id] = [
                  ...archivosMap[tarea.id],
                  ...entrega.adjuntos
                ]
              }
            }
          } catch (error) {
            console.error(`Error cargando entregas de tarea ${tarea.id}:`, error)
            entregasMap[tarea.id] = []
          }
        }

        setArchivos(archivosMap)
        setEntregas(entregasMap)
      } catch (error) {
        console.error('Error cargando archivos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    cargarArchivos()
  }, [proyectoSeleccionado])

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'IMAGEN':
        return <ImageIcon className="w-5 h-5 text-blue-500" />
      case 'ENLACE':
        return <LinkIcon className="w-5 h-5 text-purple-500" />
      case 'DOCUMENTO':
        return <File className="w-5 h-5 text-orange-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getContextoBadge = (contexto: string) => {
    const config = {
      SOLICITUD: { bg: 'bg-blue-950', text: 'text-blue-300', label: 'Solicitud' },
      ENTREGA: { bg: 'bg-green-950', text: 'text-green-300', label: 'Entrega' },
      REVISION: { bg: 'bg-purple-950', text: 'text-purple-300', label: 'Revisión' }
    }
    const c = config[contexto as keyof typeof config] || config.SOLICITUD
    return (
      <Badge className={`${c.bg} ${c.text} text-xs`}>
        {c.label}
      </Badge>
    )
  }

  const handleViewImage = (archivo: Adjunto) => {
    setSelectedImage({
      url: archivo.url,
      nombre: archivo.nombre_archivo
    })
    setImageViewerOpen(true)
  }

  const handleViewPdf = (archivo: Adjunto) => {
    setSelectedPdf({
      url: archivo.url,
      nombre: archivo.nombre_archivo
    })
    setPdfViewerOpen(true)
  }

  const archivosFiltrados = Object.entries(archivos)
    .filter(([tareaId, files]) => {
      const tarea = proyectoSeleccionado?.tareas?.find(t => t.id === tareaId)
      if (!tarea) return false
      
      if (!filtro) return true
      
      return (
        tarea.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
        files.some(f => f.nombre_archivo.toLowerCase().includes(filtro.toLowerCase()))
      )
    })

  const totalArchivos = Object.values(archivos).reduce((acc, files) => acc + files.length, 0)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Cargando archivos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Archivos del Proyecto</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalArchivos} archivo{totalArchivos !== 1 ? 's' : ''} en total
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar archivos por nombre o tarea..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Files by Task */}
      <div className="space-y-6">
        {archivosFiltrados.map(([tareaId, files]) => {
          const tarea = proyectoSeleccionado?.tareas?.find(t => t.id === tareaId)
          if (!tarea || files.length === 0) return null

          const entregasTarea = entregas[tareaId] || []

          return (
            <Card key={tareaId} className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tarea.titulo}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {files.length} archivo{files.length !== 1 ? 's' : ''}
                        {entregasTarea.length > 0 && ` • ${entregasTarea.length} versión${entregasTarea.length !== 1 ? 'es' : ''}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{tarea.estado}</Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {files.map((archivo) => {
                    const isImage = archivo.tipo_recurso === 'IMAGEN'
                    const isPdf = archivo.nombre_archivo?.toLowerCase().endsWith('.pdf')
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
                    const fullUrl = archivo.url.startsWith('http') ? archivo.url : `${API_URL}${archivo.url}`

                    return (
                      <div
                        key={archivo.id}
                        className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-700 rounded-lg hover:bg-slate-800/60 transition-colors"
                      >
                        {getIconoTipo(archivo.tipo_recurso)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">{archivo.nombre_archivo}</p>
                            {getContextoBadge(archivo.contexto)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Subido por {archivo.subido_por.nombre} • {new Date(archivo.subido_en).toLocaleDateString('es-ES')}
                          </p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {(isImage || isPdf) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (isImage) {
                                  handleViewImage(archivo)
                                } else if (isPdf) {
                                  handleViewPdf(archivo)
                                }
                              }}
                              className="h-8 px-3 gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="text-xs">Ver</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="h-8 px-3 gap-1.5"
                          >
                            <a href={fullUrl} target="_blank" rel="noopener noreferrer" download>
                              <Download className="w-3.5 h-3.5" />
                              <span className="text-xs">Descargar</span>
                            </a>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {archivosFiltrados.length === 0 && (
          <Card className="border shadow-sm">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                {filtro ? 'No se encontraron archivos' : 'No hay archivos en este proyecto'}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {filtro ? 'Intenta con otro término de búsqueda' : 'Los archivos aparecerán aquí cuando se suban a las tareas'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Viewer Dialog */}
      {selectedImage && (
        <ImageViewerDialog
          open={imageViewerOpen}
          onOpenChange={setImageViewerOpen}
          imageUrl={selectedImage.url}
          imageName={selectedImage.nombre}
        />
      )}

      {/* PDF Viewer Dialog */}
      {selectedPdf && (
        <PdfViewerDialog
          open={pdfViewerOpen}
          onOpenChange={setPdfViewerOpen}
          pdfUrl={selectedPdf.url}
          pdfName={selectedPdf.nombre}
        />
      )}
    </div>
  )
}
