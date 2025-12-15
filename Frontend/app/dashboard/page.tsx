import { AppShell } from "@/components/app-shell"
import { DashboardContent } from "@/components/dashboard-content"
import { AuthGuard } from "@/components/auth-guard"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </AuthGuard>
  )
}
