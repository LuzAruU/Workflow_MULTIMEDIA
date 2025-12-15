"use client"
import { useState, useEffect, useMemo } from "react"
import { useAppContext } from "@/lib/app-context"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Image as ImageIcon, Link as LinkIcon, File, Eye, Download, CheckCircle, XCircle, PlayCircle, PackageCheck } from "lucide-react"
import { fetchAdjuntos, fetchEntregas } from "@/lib/api"
import { ImageViewerDialog } from "@/components/image-viewer-dialog"
import { PdfViewerDialog } from "@/components/pdf-viewer-dialog"

interface TaskDetailLeftProps {
  taskId: string
  taskNumber: number
  estado: string
}

export function TaskDetailLeft({ taskId, taskNumber, estado }: TaskDetailLeftProps) {
  const { proyectoSeleccionado } = useAppContext()
  const [adjuntos, setAdjuntos] = useState<any[]>([])
  const [entregas, setEntregas] = useState<any[]>([])
  const [isLoadingAdjuntos, setIsLoadingAdjuntos] = useState(false)
  const [isLoadingHistorial, setIsLoadingHistorial] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{ url: string; nombre: string } | null>(null)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [selectedPdf, setSelectedPdf] = useState<{ url: string; nombre: string } | null>(null)

  const tarea = proyectoSeleccionado?.tareas?.find((t) => t.id === taskId)
  const solicitante = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === tarea?.solicitanteId)
  const ejecutor = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === tarea?.ejecutorId)
  const qa = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === tarea?.qaId)

  const taskData = {
    descripcion: tarea?.descripcion || "Sin descripción",
    fechaLimite: tarea?.fechaLimite || "No especificada",
    solicitante: tarea?.solicitante || "Solicitante",
    ejecutor: tarea?.ejecutor || "Sin asignar",
    qa: tarea?.qa || "Sin asignar",
  }

  // Cargar entregas y adjuntos
  useEffect(() => {
    const cargarDatos = async () => {
      if (!taskId) return
      
      setIsLoadingAdjuntos(true)
      setIsLoadingHistorial(true)
      
      try {
        // Cargar adjuntos
        const adjuntosData = await fetchAdjuntos(taskId)
        console.log("Adjuntos recibidos del backend:", adjuntosData)
        setAdjuntos(adjuntosData)
        
        // Cargar entregas
        const entregasData = await fetchEntregas(taskId)
        setEntregas(entregasData)
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoadingAdjuntos(false)
        setIsLoadingHistorial(false)
      }
    }

    cargarDatos()
  }, [taskId])

  // Agrupar adjuntos por contexto (el backend ya devuelve todos los relacionados)
  const adjuntosPorContexto = {
    SOLICITUD: adjuntos.filter(a => a.contexto === 'SOLICITUD'),
    ENTREGA: adjuntos.filter(a => a.contexto === 'ENTREGA'),
    REVISION: adjuntos.filter(a => a.contexto === 'REVISION'),
  }

  console.log("Adjuntos agrupados por contexto:")
  console.log("SOLICITUD:", adjuntosPorContexto.SOLICITUD)
  console.log("ENTREGA:", adjuntosPorContexto.ENTREGA)
  console.log("REVISION:", adjuntosPorContexto.REVISION)

  // Función para obtener el icono según el tipo de recurso
  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'IMAGEN':
        return <ImageIcon className="w-4 h-4 text-blue-500" />
      case 'ENLACE':
        return <LinkIcon className="w-4 h-4 text-purple-500" />
      case 'DOCUMENTO':
        return <File className="w-4 h-4 text-orange-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  // Función para obtener el color del badge según el contexto
  const getContextoColor = (contexto: string) => {
    switch (contexto) {
      case 'SOLICITUD':
        return 'bg-blue-100 text-blue-700'
      case 'ENTREGA':
        return 'bg-green-100 text-green-700'
      case 'REVISION':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleViewImage = (archivo: any) => {
    setSelectedImage({
      url: archivo.url,
      nombre: archivo.nombre_archivo
    })
    setImageViewerOpen(true)
  }

  const handleViewPdf = (archivo: any) => {
    setSelectedPdf({
      url: archivo.url,
      nombre: archivo.nombre_archivo
    })
    setPdfViewerOpen(true)
  }

  const renderAdjunto = (archivo: any, contexto: string) => {
    const isImage = archivo.tipo_recurso === 'IMAGEN'
    // Detectar PDF por extensión (mayúsculas/minúsculas)
    const isPdf = archivo.nombre_archivo?.toLowerCase().endsWith('.pdf')
    const contextColors: Record<string, { bg: string; border: string; hover: string }> = {
      SOLICITUD: { bg: 'bg-black', border: 'border-purple-500', hover: 'hover:bg-purple-950' },
      ENTREGA: { bg: 'bg-black', border: 'border-white', hover: 'hover:bg-slate-950' },
      REVISION: { bg: 'bg-black', border: 'border-purple-400', hover: 'hover:bg-purple-950' }
    }
    const colors = contextColors[contexto] || contextColors.SOLICITUD

    // Construir URL completa
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
    const fullUrl = archivo.url.startsWith('http') ? archivo.url : `${API_URL}${archivo.url}`

    return (
      <div
        key={archivo.id}
        className={`flex items-center gap-3 p-3 ${colors.bg} border ${colors.border} rounded-lg ${colors.hover} transition-colors`}
      >
        {getIconoTipo(archivo.tipo_recurso)}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{archivo.nombre_archivo}</p>
          <p className="text-xs text-muted-foreground">
            Subido por {archivo.subido_por.nombre} • {new Date(archivo.subido_en).toLocaleDateString('es-ES')}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isImage && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleViewImage({ url: fullUrl, nombre: archivo.nombre_archivo })}
              className="h-9 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              title="Ver imagen"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver</span>
            </Button>
          )}
          {isPdf && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleViewPdf({ url: fullUrl, nombre: archivo.nombre_archivo })}
              className="h-9 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              title="Ver PDF"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Ver PDF</span>
            </Button>
          )}
          {!isImage && !isPdf && (
            <Button
              variant="default"
              size="sm"
              asChild
              className="h-9 px-4 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              title="Descargar"
            >
              <a href={fullUrl} target="_blank" rel="noopener noreferrer" download>
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Descargar</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Construir historial completo
  const construirHistorial = () => {
    const eventos: Array<{
      tipo: string
      evento: string
      fecha: string
      usuario: string
      icono: any
      color: string
      detalles?: string
    }> = []

    // Evento de creación de tarea
    if (tarea?.creadoEn) {
      eventos.push({
        tipo: 'creacion',
        evento: 'Tarea Creada',
        fecha: tarea.creadoEn,
        usuario: solicitante?.nombre || 'Sistema',
        icono: FileText,
        color: 'bg-blue-500'
      })
    }

    // Adjuntos de solicitud
    adjuntosPorContexto.SOLICITUD.forEach((adjunto) => {
      eventos.push({
        tipo: 'adjunto_solicitud',
        evento: 'Archivo Adjuntado (Solicitud)',
        fecha: adjunto.subido_en,
        usuario: adjunto.subido_por.nombre,
        icono: FileText,
        color: 'bg-blue-400',
        detalles: adjunto.nombre_archivo
      })
    })

    // Entregas y sus revisiones
    entregas.forEach((entrega) => {
      // Evento de entrega
      eventos.push({
        tipo: 'entrega',
        evento: `Entrega v${entrega.numero_version} Creada`,
        fecha: entrega.entregado_en,
        usuario: ejecutor?.nombre || 'Ejecutor',
        icono: PackageCheck,
        color: 'bg-green-500',
        detalles: entrega.resumen
      })

      // Adjuntos de la entrega
      if (entrega.adjuntos && entrega.adjuntos.length > 0) {
        entrega.adjuntos.forEach((adjunto: any) => {
          eventos.push({
            tipo: 'adjunto_entrega',
            evento: `Archivo Adjuntado (v${entrega.numero_version})`,
            fecha: adjunto.subido_en,
            usuario: adjunto.subido_por.nombre,
            icono: File,
            color: 'bg-green-400',
            detalles: adjunto.nombre_archivo
          })
        })
      }

      // Revisión QA de la entrega
      if (entrega.revision) {
        const esAprobado = entrega.revision.veredicto === 'APROBAR'
        eventos.push({
          tipo: 'revision',
          evento: esAprobado ? `Entrega v${entrega.numero_version} Aprobada` : `Cambios Solicitados (v${entrega.numero_version})`,
          fecha: entrega.revision.revisado_en,
          usuario: entrega.revision.revisor.nombre,
          icono: esAprobado ? CheckCircle : XCircle,
          color: esAprobado ? 'bg-emerald-500' : 'bg-red-500',
          detalles: entrega.revision.texto_retroalimentacion
        })
      }
    })

    // Ordenar por fecha (más reciente primero)
    return eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }

  const historialCompleto = construirHistorial()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Descripción</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{taskData.descripcion}</p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Fecha Límite</p>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="w-4 h-4" />
            {tarea?.fechaLimite
              ? new Date(tarea.fechaLimite).toLocaleDateString("es-ES")
              : "No especificada"}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Solicitante</p>
          {solicitante ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={solicitante.avatar} alt={solicitante.nombre} />
                <AvatarFallback className="text-xs">{solicitante.nombre[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{solicitante.nombre}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Sin datos</span>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Ejecutor</p>
          {ejecutor ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={ejecutor.avatar} alt={ejecutor.nombre} />
                <AvatarFallback className="text-xs">{ejecutor.nombre[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{ejecutor.nombre}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Sin asignar</span>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">QA</p>
          {qa ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={qa.avatar} alt={qa.nombre} />
                <AvatarFallback className="text-xs">{qa.nombre[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{qa.nombre}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Sin asignar</span>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Historial de Actividad</h3>
          <Badge variant="secondary" className="text-xs">
            {historialCompleto.length} evento{historialCompleto.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {isLoadingHistorial ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          </div>
        ) : historialCompleto.length > 0 ? (
          <div className="space-y-3">
            {historialCompleto.map((item, idx) => {
              const Icono = item.icono
              return (
                <div key={idx} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <Icono className="w-4 h-4 text-white" />
                    </div>
                    {idx < historialCompleto.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{item.evento}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.usuario} • {new Date(item.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {item.detalles && (
                          <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/50 rounded border-l-2 border-primary/50">
                            {item.detalles}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Sin actividad registrada</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Archivos Relacionados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Archivos Relacionados</h3>
          {adjuntos.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-200">
              {adjuntosPorContexto.SOLICITUD.length +
                adjuntosPorContexto.ENTREGA.length +
                adjuntosPorContexto.REVISION.length} archivo
              {(adjuntosPorContexto.SOLICITUD.length +
                adjuntosPorContexto.ENTREGA.length +
                adjuntosPorContexto.REVISION.length) !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {isLoadingAdjuntos ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-muted-foreground">Cargando archivos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Archivos de Solicitud */}
            {adjuntosPorContexto.SOLICITUD.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                  <Badge className="bg-blue-950 text-blue-300 border-blue-500/50 text-xs font-semibold px-3 py-1">
                    Solicitud ({adjuntosPorContexto.SOLICITUD.length})
                  </Badge>
                  <div className="h-px flex-1 bg-gradient-to-l from-blue-500/30 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  {adjuntosPorContexto.SOLICITUD.map((archivo) => renderAdjunto(archivo, 'SOLICITUD'))}
                </div>
              </div>
            )}

            {/* Archivos de Entrega */}
            {adjuntosPorContexto.ENTREGA.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-green-500/30 to-transparent"></div>
                  <Badge className="bg-green-950 text-green-300 border-green-500/50 text-xs font-semibold px-3 py-1">
                   Entregas ({adjuntosPorContexto.ENTREGA.length})
                  </Badge>
                  <div className="h-px flex-1 bg-gradient-to-l from-green-500/30 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  {adjuntosPorContexto.ENTREGA.map((archivo) => renderAdjunto(archivo, 'ENTREGA'))}
                </div>
              </div>
            )}

            {/* Archivos de Revisión */}
            {adjuntosPorContexto.REVISION.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent"></div>
                  <Badge className="bg-purple-950 text-purple-300 border-purple-500/50 text-xs font-semibold px-3 py-1">
                    Revisión ({adjuntosPorContexto.REVISION.length})
                  </Badge>
                  <div className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent"></div>
                </div>
                <div className="space-y-2">
                  {adjuntosPorContexto.REVISION.map((archivo) => renderAdjunto(archivo, 'REVISION'))}
                </div>
              </div>
            )}

            {adjuntosPorContexto.SOLICITUD.length +
              adjuntosPorContexto.ENTREGA.length +
              adjuntosPorContexto.REVISION.length === 0 && (
              <div className="text-center py-12 bg-slate-900/30 rounded-lg border-2 border-dashed border-slate-700">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Sin archivos adjuntos</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Los archivos aparecerán aquí cuando se suban
                </p>
              </div>
            )}
          </div>
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
