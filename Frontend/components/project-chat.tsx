"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export function ProjectChat() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-12 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground">Chat del proyecto</p>
        <p className="text-sm text-muted-foreground mt-1">Funcionalidad de chat próximamente</p>
      </CardContent>
    </Card>
  )
}
