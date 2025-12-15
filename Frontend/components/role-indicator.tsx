"use client"

interface RoleIndicatorProps {
  role: "ORGANIZADOR" | "EJECUTOR" | "QA"
}

const roleDescriptions = {
  ORGANIZADOR: "You are viewing as Organizer - You can create projects, assign tasks, and manage team members",
  EJECUTOR: "You are viewing as Executor - You can accept and complete assigned tasks",
  QA: "You are viewing as QA Reviewer - You can review and validate delivered work",
}

export function RoleIndicator({ role }: RoleIndicatorProps) {
  return (
    <div className="px-6 py-3 bg-muted/30 border-b border-border text-sm text-muted-foreground">
      {roleDescriptions[role]}
    </div>
  )
}
