"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppContext } from "@/lib/app-context"
import { Copy, Check, User } from "lucide-react"

export function SettingsContent() {
  const { usuarioActual, proyectos } = useAppContext()
  const [copied, setCopied] = useState(false)
  const [estadisticas, setEstadisticas] = useState({
    proyectosActivos: 0,
    tareasCompletadas: 0
  })

  useEffect(() => {
    if (proyectos && usuarioActual) {
      // Calcular proyectos activos donde el usuario es miembro
      const proyectosActivosCount = proyectos.filter(p => 
        p.estado !== 'COMPLETADO' && 
        p.miembros.some(m => m.usuarioId === usuarioActual.id)
      ).length

      // Calcular tareas completadas del usuario
      let tareasCompletadasCount = 0
      proyectos.forEach(proyecto => {
        if (proyecto.tareas) {
          tareasCompletadasCount += proyecto.tareas.filter(t => 
            t.estado === 'COMPLETADA' && 
            (t.ejecutorId === usuarioActual.id || t.qaId === usuarioActual.id)
          ).length
        }
      })

      setEstadisticas({
        proyectosActivos: proyectosActivosCount,
        tareasCompletadas: tareasCompletadasCount
      })
    }
  }, [proyectos, usuarioActual])

  const handleCopyUserCode = () => {
    if (usuarioActual?.id) {
      navigator.clipboard.writeText(usuarioActual.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!usuarioActual) {
    return (
      <div className="p-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No hay usuario conectado</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-2">Gestiona tus preferencias y cuenta</p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-fit">
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tu Perfil</CardTitle>
              <CardDescription>Gestiona tu información de cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={usuarioActual.avatar} alt={usuarioActual.nombre} />
                  <AvatarFallback className="text-2xl">
                    {usuarioActual.nombre.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{usuarioActual.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{usuarioActual.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {usuarioActual.codigo}
                  </Badge>
                </div>
              </div>

              {/* Información del perfil */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input id="name" value={usuarioActual.nombre} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input id="email" value={usuarioActual.email} readOnly className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de Usuario</Label>
                  <Input id="codigo" value={usuarioActual.codigo} readOnly className="bg-muted/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Tu ID de Usuario</CardTitle>
              <CardDescription>
                Comparte este ID con organizadores para que te agreguen a proyectos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xs border border-border overflow-x-auto">
                  {usuarioActual.id}
                </div>
                <Button variant="outline" size="sm" onClick={handleCopyUserCode} className="px-3 bg-transparent">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Este ID único permite que los organizadores te agreguen a proyectos
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Resumen de tu actividad en VeriFlow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{estadisticas.proyectosActivos}</p>
                  <p className="text-sm text-muted-foreground">Proyectos activos</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{estadisticas.tareasCompletadas}</p>
                  <p className="text-sm text-muted-foreground">Tareas completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notificaciones por Correo</CardTitle>
              <CardDescription>Controla cuándo recibes notificaciones por correo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Asignación de Tareas</p>
                  <p className="text-xs text-muted-foreground">Cuando se te asigna una tarea</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Revisiones QA</p>
                  <p className="text-xs text-muted-foreground">Cuando tu trabajo es revisado</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Actualizaciones de Proyecto</p>
                  <p className="text-xs text-muted-foreground">Cambios en el estado del proyecto</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Notificaciones en la Aplicación</CardTitle>
              <CardDescription>Notificaciones en tiempo real dentro de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Correcciones Necesarias</p>
                  <p className="text-xs text-muted-foreground">Alertas críticas cuando se solicitan cambios</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
