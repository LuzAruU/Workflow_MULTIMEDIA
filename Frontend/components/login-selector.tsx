"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppContext } from "@/lib/app-context"
import { fetchUsuarioActual } from "@/lib/api"

const usuarios = [
  { email: 'juan@veriflow.com', nombre: 'Juan Pérez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan' },
  { email: 'maria@veriflow.com', nombre: 'María García', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria' },
  { email: 'carlos@veriflow.com', nombre: 'Carlos López', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos' },
]

export function LoginSelector() {
  const [isLoading, setIsLoading] = useState(false)
  const { setUsuarioActual } = useAppContext()

  const handleLogin = async (email: string) => {
    setIsLoading(true)
    try {
      const usuarioData = await fetchUsuarioActual(email)
      setUsuarioActual({
        id: usuarioData.id,
        codigo: usuarioData.codigo,
        nombre: usuarioData.nombre,
        email: usuarioData.email,
        avatar: usuarioData.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1'
      })
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error al iniciar sesión:', error)
      alert('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Seleccionar Usuario</CardTitle>
          <CardDescription>Elige con qué usuario deseas iniciar sesión</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {usuarios.map((usuario) => (
            <button
              key={usuario.email}
              onClick={() => handleLogin(usuario.email)}
              disabled={isLoading}
              className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all text-left flex items-center gap-3 hover:bg-muted/50"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={usuario.avatar} alt={usuario.nombre} />
                <AvatarFallback>{usuario.nombre[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{usuario.nombre}</p>
                <p className="text-sm text-muted-foreground">{usuario.email}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
