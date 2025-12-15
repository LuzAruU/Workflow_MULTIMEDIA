import { AppShell } from "@/components/app-shell"
import { ProjectsContent } from "@/components/projects-content"
import { AuthGuard } from "@/components/auth-guard"

export default function ProjectsPage() {
  return (
    <AuthGuard>
      <AppShell>
        <ProjectsContent />
      </AppShell>
    </AuthGuard>
  )
}
