"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { fetchProyectos, testConnection, fetchUsuarioActual, fetchTareas } from "./api"

export type Rol = "ORGANIZADOR" | "EJECUTOR" | "QA"
export type EstadoTarea =
  | "BACKLOG"
  | "ASIGNADA"
  | "EN_PROGRESO"
  | "PENDIENTE_QA"
  | "EN_REVISION"
  | "CORRECCION_NECESARIA"
  | "COMPLETADA"
export type Prioridad = "BAJA" | "MEDIA" | "ALTA" | "CRITICA"

export interface Usuario {
  id: string
  codigo: string
  nombre: string
  email: string
  avatar: string
}

export interface Miembro {
  usuarioId: string
  nombre: string
  email: string
  avatar: string
  rol: Rol
}

export interface Adjunto {
  id: string
  nombreArchivo: string
  contexto: "SOLICITUD_TAREA" | "EVIDENCIA_ENTREGA"
  subidoPor: string
  fechaSubida: string
}

export interface EntregaTarea {
  id: string
  resumen: string
  metodologia: string
  evidencia: Adjunto[]
  entregadoEn: string
}

export interface RevisionQA {
  id: string
  veredicto: "APROBADO" | "RECHAZADO"
  textoRetroalimentacion?: string
  revisadoEn: string
}

export interface Tarea {
  id: string
  titulo: string
  descripcion: string
  prioridad: Prioridad
  estado: EstadoTarea
  ejecutorId?: string
  qaId?: string
  solicitanteId: string
  fechaLimite?: string
  creadoEn: string
  adjuntos: Adjunto[]
  entrega?: EntregaTarea
  revision?: RevisionQA
}

export interface Proyecto {
  id: string
  nombre: string
  descripcion: string
  estado: "ABIERTO" | "EN_PROGRESO" | "COMPLETADO" | "CANCELADO"
  creadorId?: string
  miembros: Miembro[]
  tareas?: Tarea[]
  creadoEn: string
  creado_en?: string
}

interface AppContextType {
  usuarioActual: Usuario | null
  proyectos: Proyecto[]
  proyectoSeleccionado: Proyecto | null
  rolEnProyecto: Rol | null
  setUsuarioActual: (usuario: Usuario) => void
  setProyectoSeleccionado: (proyecto: Proyecto | null) => void
  setRolEnProyecto: (rol: Rol) => void
  agregarProyecto: (proyecto: Proyecto) => void
  actualizarProyecto: (proyecto: Proyecto) => void
  agregarTarea: (proyectoId: string, tarea: Tarea) => void
  actualizarTarea: (proyectoId: string, tarea: Tarea) => void
  logout: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuarioActual, setUsuarioActualState] = useState<Usuario | null>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>([]) // Array vacío, sin datos demo
  const [proyectoSeleccionado, setProyectoSeleccionadoState] = useState<Proyecto | null>(null)
  const [rolEnProyecto, setRolEnProyectoState] = useState<Rol | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario y proyectos desde la API al iniciar
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setIsLoading(true)
        
        // Verificar si hay token de autenticación
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
        
        if (!token) {
          console.log('No hay token de autenticación')
          setIsLoading(false)
          return
        }

        console.log('Testing API connection...')
        await testConnection()
        
        console.log('Loading usuario actual...')
        const usuarioData = await fetchUsuarioActual()
        console.log('Usuario loaded:', usuarioData)
        setUsuarioActualState({
          id: usuarioData.id,
          codigo: usuarioData.codigo,
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          avatar: usuarioData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
        })
        
        // Luego cargar proyectos
        console.log('Loading proyectos...')
        const data = await fetchProyectos()
        console.log('Proyectos loaded:', data)
        
        if (Array.isArray(data)) {
          const proyectosTransformados = data.map((p: any) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: p.descripcion || '',
            estado: p.estado,
            creadorId: p.miembros?.find((m: any) => m.rol === 'ORGANIZADOR')?.usuarioId || '',
            miembros: p.miembros || [],
            tareas: [],
            creadoEn: p.creado_en || p.creadoEn
          }))
          
          console.log('Proyectos transformados:', proyectosTransformados)
          setProyectos(proyectosTransformados)
        } else {
          console.warn('Datos de proyectos no es un array:', data)
          setProyectos([])
        }
      } catch (error: any) {
        console.error('Error cargando datos:', error)
        setProyectos([]) // Asegurar array vacío en caso de error
        
        // Si hay error de autenticación, limpiar token y redirigir
        if (typeof window !== 'undefined' && 
            (error.message.includes('autenticado') || error.message.includes('401'))) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('usuarioEmail')
          window.location.href = '/'
        }
      } finally {
        setIsLoading(false)
      }
    }
    cargarDatos()
  }, [])

  const setUsuarioActual = (usuario: Usuario) => {
    setUsuarioActualState(usuario)
    if (typeof window !== 'undefined') {
      localStorage.setItem('usuarioEmail', usuario.email)
    }
  }

  const setProyectoSeleccionado = async (proyecto: Proyecto | null) => {
    if (proyecto) {
      // Cargar las tareas del proyecto
      try {
        const tareasData = await fetchTareas(proyecto.id)
        const tareasFormateadas = tareasData.map((t: any) => ({
          id: t.id,
          titulo: t.titulo,
          descripcion: t.descripcion || '',
          prioridad: mapPrioridad(t.prioridad),
          estado: mapEstado(t.estado),
          ejecutorId: t.ejecutor?.id,
          qaId: t.qa?.id,
          solicitanteId: t.solicitante,
          fechaLimite: t.fecha_limite,
          creadoEn: new Date().toISOString(),
          adjuntos: []
        }))
        
        proyecto.tareas = tareasFormateadas
      } catch (error) {
        console.error('Error cargando tareas:', error)
        proyecto.tareas = []
      }
    }
    setProyectoSeleccionadoState(proyecto)
  }

  const setRolEnProyecto = (rol: Rol) => {
    setRolEnProyectoState(rol)
  }

  const logout = () => {
    setUsuarioActualState(null)
    setProyectoSeleccionadoState(null)
    setRolEnProyectoState(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('usuarioEmail')
      window.location.href = "/"
    }
  }

  const agregarProyecto = (proyecto: Proyecto) => {
    const proyectoFormateado = {
      ...proyecto,
      tareas: proyecto.tareas || [],
      creadoEn: proyecto.creado_en || proyecto.creadoEn || new Date().toISOString()
    }
    console.log('Agregando proyecto al estado:', proyectoFormateado)
    setProyectos(prev => [...prev, proyectoFormateado])
  }

  const actualizarProyecto = (proyecto: Proyecto) => {
    console.log('Actualizando proyecto en el estado:', proyecto)
    setProyectos(prev => prev.map((p) => (p.id === proyecto.id ? proyecto : p)))
  }

  const agregarTarea = (proyectoId: string, tarea: Tarea) => {
    setProyectos(proyectos.map((p) => {
      if (p.id === proyectoId) {
        const tareasActualizadas = [...(p.tareas || []), tarea]
        return { ...p, tareas: tareasActualizadas }
      }
      return p
    }))
    
    // Actualizar proyecto seleccionado si es el mismo
    if (proyectoSeleccionado?.id === proyectoId) {
      setProyectoSeleccionadoState({
        ...proyectoSeleccionado,
        tareas: [...(proyectoSeleccionado.tareas || []), tarea]
      })
    }
  }

  const actualizarTarea = (proyectoId: string, tarea: Tarea) => {
    setProyectos(
      proyectos.map((p) =>
        p.id === proyectoId ? { ...p, tareas: p.tareas.map((t) => (t.id === tarea.id ? tarea : t)) } : p,
      ),
    )
  }

  // Mostrar loading mientras se cargan los datos iniciales
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{
        usuarioActual,
        proyectos,
        proyectoSeleccionado,
        rolEnProyecto,
        setUsuarioActual,
        setProyectoSeleccionado,
        setRolEnProyecto,
        agregarProyecto,
        actualizarProyecto,
        agregarTarea,
        actualizarTarea,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext debe usarse dentro de AppProvider")
  }
  return context
}

// Funciones auxiliares para mapear estados y prioridades
function mapEstado(estadoBackend: string): EstadoTarea {
  const mapeo: Record<string, EstadoTarea> = {
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

function mapPrioridad(prioridadBackend: string): Prioridad {
  const mapeo: Record<string, Prioridad> = {
    'BAJA': 'BAJA',
    'MEDIA': 'MEDIA',
    'ALTA': 'ALTA',
    'CRÍTICA': 'CRITICA'
  }
  return mapeo[prioridadBackend] || 'MEDIA'
}
