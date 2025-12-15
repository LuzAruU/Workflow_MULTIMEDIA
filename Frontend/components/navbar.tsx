"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Settings, LogOut, User, Bell } from "lucide-react"
import { useAppContext } from "@/lib/app-context"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { usuarioActual, rolEnProyecto, logout } = useAppContext()
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const rolLabels: Record<string, string> = {
    ORGANIZADOR: "📋 Organizador",
    EJECUTOR: "⚙️ Ejecutor",
    QA: "✅ QA",
  }

  const hasNotifications = false

  if (!isClient) {
    return null
  }

  return (
    <nav className="h-16 border-b border-border/50 px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar... (Ctrl+K)"
            className="pl-10 bg-background/50"
          />
        </div>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {hasNotifications && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          )}
        </Button>

        {/* Settings */}
        <Link href="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        {/* Role Badge */}
        {rolEnProyecto && (
          <Badge variant="secondary" className="gap-1.5">
            {rolLabels[rolEnProyecto] || rolEnProyecto}
          </Badge>
        )}

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 pl-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={usuarioActual?.avatar} alt={usuarioActual?.nombre} />
                <AvatarFallback>
                  {usuarioActual?.nombre?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{usuarioActual?.nombre || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">{usuarioActual?.email || ''}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2">
              <Settings className="w-4 h-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
