"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter, Search, X } from "lucide-react"
import type { Prioridad, EstadoTarea } from "@/lib/app-context"

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFiltersState) => void
  totalCount: number
}

export interface TaskFiltersState {
  search: string
  prioridades: Prioridad[]
  estados: EstadoTarea[]
  asignadas: boolean | null
}

export function TaskFilters({ onFilterChange, totalCount }: TaskFiltersProps) {
  const [search, setSearch] = useState("")
  const [prioridades, setPrioridades] = useState<Prioridad[]>([])
  const [estados, setEstados] = useState<EstadoTarea[]>([])
  const [asignadas, setAsignadas] = useState<boolean | null>(null)

  const prioridadOptions: Prioridad[] = ["BAJA", "MEDIA", "ALTA", "CRITICA"]
  const estadoOptions: EstadoTarea[] = [
    "BACKLOG",
    "ASIGNADA",
    "EN_PROGRESO",
    "PENDIENTE_QA",
    "EN_REVISION",
    "CORRECCION_NECESARIA",
    "COMPLETADA",
  ]

  const handlePrioridadToggle = (prioridad: Prioridad) => {
    const newPrioridades = prioridades.includes(prioridad)
      ? prioridades.filter((p) => p !== prioridad)
      : [...prioridades, prioridad]
    setPrioridades(newPrioridades)
    onFilterChange({ search, prioridades: newPrioridades, estados, asignadas })
  }

  const handleEstadoToggle = (estado: EstadoTarea) => {
    const newEstados = estados.includes(estado) ? estados.filter((e) => e !== estado) : [...estados, estado]
    setEstados(newEstados)
    onFilterChange({ search, prioridades, estados: newEstados, asignadas })
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange({ search: value, prioridades, estados, asignadas })
  }

  const handleClear = () => {
    setSearch("")
    setPrioridades([])
    setEstados([])
    setAsignadas(null)
    onFilterChange({ search: "", prioridades: [], estados: [], asignadas: null })
  }

  const activeFilters = (search ? 1 : 0) + prioridades.length + estados.length + (asignadas !== null ? 1 : 0)

  return (
    <div className="space-y-3 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1">
            <X className="w-4 h-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Filter className="w-4 h-4" />
              Prioridad
              {prioridades.length > 0 && <Badge variant="secondary">{prioridades.length}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Filtrar por Prioridad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {prioridadOptions.map((prioridad) => (
              <DropdownMenuCheckboxItem
                key={prioridad}
                checked={prioridades.includes(prioridad)}
                onCheckedChange={() => handlePrioridadToggle(prioridad)}
              >
                {prioridad === "BAJA" && "Baja"}
                {prioridad === "MEDIA" && "Media"}
                {prioridad === "ALTA" && "Alta"}
                {prioridad === "CRITICA" && "Crítica"}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 bg-transparent">
              <Filter className="w-4 h-4" />
              Estado
              {estados.length > 0 && <Badge variant="secondary">{estados.length}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-64 overflow-y-auto">
            <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {estadoOptions.map((estado) => (
              <DropdownMenuCheckboxItem
                key={estado}
                checked={estados.includes(estado)}
                onCheckedChange={() => handleEstadoToggle(estado)}
              >
                {estado === "BACKLOG" && "Pendiente"}
                {estado === "ASIGNADA" && "Asignada"}
                {estado === "EN_PROGRESO" && "En Progreso"}
                {estado === "PENDIENTE_QA" && "Esperando QA"}
                {estado === "EN_REVISION" && "En Revisión"}
                {estado === "CORRECCION_NECESARIA" && "Correcciones"}
                {estado === "COMPLETADA" && "Completada"}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="text-sm text-muted-foreground ml-auto">{totalCount} tareas</div>
      </div>
    </div>
  )
}
