"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, FolderOpen, Calendar, Settings, LogOut } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/lib/app-context"

export function Sidebar() {
  const pathname = usePathname()
  const { usuarioActual, logout } = useAppContext()

  const links = [
    { href: "/dashboard", icon: Home, label: "Panel de Control" },
    { href: "/projects", icon: FolderOpen, label: "Proyectos" },
    { href: "/calendar", icon: Calendar, label: "Calendario" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      <div className="h-16 px-6 flex items-center border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-card">
            <img src="/icon.png" alt="veriflow" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-sidebar-foreground">veriflow</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname.startsWith(link.href)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={usuarioActual?.avatar || "/placeholder.svg"} />
            <AvatarFallback>{usuarioActual?.nombre[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{usuarioActual?.nombre}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{usuarioActual?.codigo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings" className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 rounded-md"
                aria-label="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>¿Cerrar sesión?</DialogTitle>
                <DialogDescription>Confirma que deseas cerrar tu sesión en veriflow.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="mr-2">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    onClick={() => {
                      logout()
                    }}
                  >
                    Cerrar sesión
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </aside>
  )
}
