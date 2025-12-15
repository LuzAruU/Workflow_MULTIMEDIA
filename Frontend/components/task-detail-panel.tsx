"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TaskDetailLeft } from "@/components/task-detail-left"
import { TaskDetailRight } from "@/components/task-detail-right"
import { Badge } from "@/components/ui/badge"

interface TaskDetailPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  taskNumber: number
  taskTitle: string
  estado: string
}

export function TaskDetailPanel({ open, onOpenChange, taskId, taskNumber, taskTitle, estado }: TaskDetailPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-5xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-muted-foreground">#{taskNumber}</span>
              <SheetTitle className="flex-1 text-xl">{taskTitle}</SheetTitle>
            </div>
          </SheetHeader>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Column - Task Details (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <TaskDetailLeft taskId={taskId} taskNumber={taskNumber} estado={estado} />
          </div>

          {/* Right Column - Actions & Status (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <TaskDetailRight taskId={taskId} estado={estado} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
