import { AppShell } from "@/components/app-shell"
import { CalendarContent } from "@/components/calendar-content"
import { AuthGuard } from "@/components/auth-guard"

export default function CalendarPage() {
  return (
    <AuthGuard>
      <AppShell>
        <CalendarContent />
      </AppShell>
    </AuthGuard>
  )
}
