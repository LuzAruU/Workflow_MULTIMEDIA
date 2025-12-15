"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/lib/app-context"
import { cambiarEstadoTarea, fetchEntregas } from "@/lib/api"
import { PlayCircle, CheckCircle, XCircle, Upload, Paperclip, PackageCheck, ClipboardCheck } from "lucide-react"
import { UploadAdjuntoDialog } from "@/components/upload-adjunto-dialog"
import { CrearEntregaDialog } from "@/components/crear-entrega-dialog"
import { CrearRevisionDialog } from "@/components/crear-revision-dialog"

interface TaskActionsProps {
  tareaId: string
  estadoActual: string
}

export function TaskActions({ tareaId, estadoActual }: TaskActionsProps) {
  const { proyectoSeleccionado, actualizarTarea, usuarioActual } = useAppContext()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isEntregaOpen, setIsEntregaOpen] = useState(false)
  const [isRevisionOpen, setIsRevisionOpen] = useState(false)
  const [ultimaEntrega, setUltimaEntrega] = useState<any>(null)
  const [contextoAdjunto, setContextoAdjunto] = useState<"SOLICITUD" | "ENTREGA" | "REVISION">("ENTREGA")
  
  const tarea = proyectoSeleccionado?.tareas?.find((t) => t.id === tareaId)
  const miembro = proyectoSeleccionado?.miembros?.find((m) => m.usuarioId === usuarioActual?.id)

  // Cargar la última entrega cuando la tarea está en revisión
  useEffect(() => {
    const cargarUltimaEntrega = async () => {
      if (estadoActual === 'EN_REVISION') {
        try {
          const entregas = await fetchEntregas(tareaId)
          if (entregas && entregas.length > 0) {
            // Obtener la última entrega (mayor versión)
            const ultima = entregas.sort((a: any, b: any) => b.numero_version - a.numero_version)[0]
            setUltimaEntrega(ultima)
          }
        } catch (error) {
          console.error('Error cargando entregas:', error)
        }
      }
    }

    cargarUltimaEntrega()
  }, [tareaId, estadoActual])

  const handleIniciarTarea = () => {
    setIsEntregaOpen(true)
  }

  const handleCambiarEstado = async (nuevoEstado: string) => {
    try {
      await cambiarEstadoTarea(tareaId, nuevoEstado)
      
      if (tarea && proyectoSeleccionado) {
        const tareaActualizada = {
          ...tarea,
          estado: mapEstadoFrontend(nuevoEstado)
        }
        actualizarTarea(proyectoSeleccionado.id, tareaActualizada)
      }
      
      alert('Estado actualizado exitosamente')
      window.location.reload()
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    }
  }

  const handleEntregaCreada = () => {
    window.location.reload()
  }

  const handleRevisionCreada = () => {
    window.location.reload()
  }

  // Solo mostrar acciones si el usuario es miembro
  if (!miembro || !tarea) return null

  const esEjecutor = tarea.ejecutorId === usuarioActual?.id
  const esQA = tarea.qaId === usuarioActual?.id

  return (
    <div className="space-y-2">
      {/* Ejecutor: Iniciar tarea (abre diálogo de entrega) */}
      {esEjecutor && estadoActual === 'BACKLOG' && (
        <Button 
          className="w-full gap-2" 
          onClick={handleIniciarTarea}
        >
          <PlayCircle className="w-4 h-4" />
          Iniciar Tarea
        </Button>
      )}

      {/* Ejecutor: Crear entrega adicional */}
      {esEjecutor && estadoActual === 'EN_PROGRESO' && (
        <Button 
          className="w-full gap-2" 
          onClick={() => setIsEntregaOpen(true)}
        >
          <PackageCheck className="w-4 h-4" />
          Crear Entrega
        </Button>
      )}

      {/* QA: Iniciar revisión */}
      {esQA && estadoActual === 'PENDIENTE_QA' && (
        <Button 
          className="w-full gap-2" 
          onClick={() => handleCambiarEstado('TAREA_EN_REVISION')}
        >
          <PlayCircle className="w-4 h-4" />
          Iniciar Revisión
        </Button>
      )}

      {/* QA: Revisar entrega */}
      {esQA && estadoActual === 'EN_REVISION' && ultimaEntrega && !ultimaEntrega.revision && (
        <Button 
          className="w-full gap-2" 
          onClick={() => setIsRevisionOpen(true)}
        >
          <ClipboardCheck className="w-4 h-4" />
          Revisar Entrega v{ultimaEntrega.numero_version}
        </Button>
      )}

      {/* Ejecutor: Reiniciar desde correcciones */}
      {esEjecutor && estadoActual === 'CORRECCION_NECESARIA' && (
        <Button 
          className="w-full gap-2" 
          onClick={() => setIsEntregaOpen(true)}
        >
          <PlayCircle className="w-4 h-4" />
          Nueva Entrega (Correcciones)
        </Button>
      )}

      {/* Dialogs */}
      <CrearEntregaDialog
        open={isEntregaOpen}
        onOpenChange={setIsEntregaOpen}
        tareaId={tareaId}
        onEntregaCreada={handleEntregaCreada}
        esInicioTarea={estadoActual === 'BACKLOG'}
      />

      {ultimaEntrega && (
        <CrearRevisionDialog
          open={isRevisionOpen}
          onOpenChange={setIsRevisionOpen}
          entregaId={ultimaEntrega.id}
          numeroVersion={ultimaEntrega.numero_version}
          onRevisionCreada={handleRevisionCreada}
        />
      )}

      <UploadAdjuntoDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        tareaId={tareaId}
        contexto={contextoAdjunto}
        onAdjuntoSubido={() => window.location.reload()}
      />
    </div>
  )
}

function mapEstadoFrontend(estadoBackend: string): any {
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
