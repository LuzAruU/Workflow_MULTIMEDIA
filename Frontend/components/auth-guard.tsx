"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/lib/app-context"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { usuarioActual } = useAppContext()
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
    
    if (!token) {
      router.push('/')
    }
  }, [usuarioActual, router])

  // Mostrar loading mientras se verifica la autenticación
  if (!usuarioActual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
