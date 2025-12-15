"use client"

import { AppShell } from "@/components/app-shell"
import { WorkspaceContent } from "@/components/workspace-content"
import { AuthGuard } from "@/components/auth-guard"

export default function WorkspacePage() {
  return (
    <AuthGuard>
      <AppShell>
        <WorkspaceContent />
      </AppShell>
    </AuthGuard>
  )
}
