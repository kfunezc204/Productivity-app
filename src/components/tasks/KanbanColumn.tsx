import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import TaskCard from "./TaskCard";
import InlineTaskAdd from "./InlineTaskAdd";
import { type Task, type TaskStatus } from "@/stores/taskStore";

type Props = {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor?: string;
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "#6B7280",
  this_week: "#3B82F6",
  today: "#F97316",
  done: "#22C55E",
};

export default function KanbanColumn({ status, title, tasks, accentColor }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const color = accentColor ?? STATUS_COLORS[status];
  const itemIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div className="flex flex-col min-w-[280px] flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-white/80">{title}</span>
          <span className="text-xs text-white/30 tabular-nums">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-lg border transition-colors ${
          isOver ? "border-orange-500/30 bg-orange-500/5" : "border-[#2A2A2A] bg-[#111111]"
        }`}
      >
        <ScrollArea className="h-full">
          <SortableContext
            items={itemIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2 p-2">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columnStatus={status}
                  columnTasks={tasks}
                />
              ))}
              <InlineTaskAdd status={status} />
            </div>
          </SortableContext>
        </ScrollArea>
      </div>
    </div>
  );
}
