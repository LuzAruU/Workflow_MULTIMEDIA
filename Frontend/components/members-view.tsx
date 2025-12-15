"use client"

import { useAppContext } from "@/lib/app-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, MoreVertical } from "lucide-react"

export function MembersView() {
  const { proyectoSeleccionado } = useAppContext()
  const members = proyectoSeleccionado?.miembros || []

  const rolColors: Record<string, string> = {
    ORGANIZADOR: "bg-blue-100 text-blue-800",
    EJECUTOR: "bg-green-100 text-green-800",
    QA: "bg-purple-100 text-purple-800",
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Miembros del Equipo</h2>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay miembros en este proyecto</p>
        </div>
      ) : (
        members.map((member) => (
          <Card key={member.usuarioId}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.nombre} />
                    <AvatarFallback>{member.nombre[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{member.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={rolColors[member.rol] || "bg-gray-100"}>{member.rol}</Badge>
                  <Button variant="ghost" size="sm">
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
