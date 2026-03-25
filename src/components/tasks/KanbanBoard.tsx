import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import KanbanColumn from "./KanbanColumn";
import DoneColumn from "./DoneColumn";
import { useTaskStore, useTasksByColumn, type TaskStatus, type Task } from "@/stores/taskStore";

const COLUMNS: Array<{ status: TaskStatus; title: string }> = [
  { status: "backlog", title: "Backlog" },
  { status: "this_week", title: "This Week" },
  { status: "today", title: "Today" },
];

export default function KanbanBoard() {
  const showDone = useTaskStore((s) => s.showDone);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const toggleShowDone = useTaskStore((s) => s.toggleShowDone);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const backlogTasks = useTasksByColumn("backlog");
  const thisWeekTasks = useTasksByColumn("this_week");
  const todayTasks = useTasksByColumn("today");

  const columnTasksMap: Record<TaskStatus, Task[]> = {
    backlog: backlogTasks,
    this_week: thisWeekTasks,
    today: todayTasks,
    done: [],
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    const allTasks = [...backlogTasks, ...thisWeekTasks, ...todayTasks];
    setActiveTask(allTasks.find((t) => t.id === id) ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source task
    const allTasks = [...backlogTasks, ...thisWeekTasks, ...todayTasks];
    const sourceTask = allTasks.find((t) => t.id === activeId);
    if (!sourceTask) return;

    // Determine target column
    const targetStatus = (["backlog", "this_week", "today"].includes(overId)
      ? overId
      : allTasks.find((t) => t.id === overId)?.status) as TaskStatus | undefined;

    if (!targetStatus || targetStatus === sourceTask.status) return;

    // Optimistic cross-column move
    const { reorderTasks: storeReorder } = useTaskStore.getState();
    const targetCol = columnTasksMap[targetStatus];
    const newPos = targetCol.length;
    storeReorder([{ id: activeId, position: newPos, status: targetStatus }]);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Re-read state after potential handleDragOver mutation
    const freshTasks = useTaskStore.getState().tasks;
    const activeTask = freshTasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const status = activeTask.status;
    const colTasks = freshTasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);

    if (activeId === overId) {
      // No movement — just persist current order
      const updates = colTasks.map((t, i) => ({ id: t.id, position: i, status }));
      await reorderTasks(updates);
      return;
    }

    // Reorder within column
    const oldIndex = colTasks.findIndex((t) => t.id === activeId);
    const newIndex = colTasks.findIndex((t) => t.id === overId);

    if (oldIndex === -1) return;

    const reordered = [...colTasks];
    if (newIndex !== -1) {
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, activeTask);
    }

    const updates = reordered.map((t, i) => ({ id: t.id, position: i, status }));
    await reorderTasks(updates);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-end px-4 py-2 border-b border-[#2A2A2A] flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleShowDone}
            className="gap-2 text-xs text-white/40 hover:text-white/70"
          >
            {showDone ? <EyeOff size={13} /> : <Eye size={13} />}
            {showDone ? "Hide Done" : "Show Done"}
          </Button>
        </div>

        {/* Columns */}
        <div className="flex gap-4 p-4 flex-1 overflow-x-auto overflow-y-hidden">
          {COLUMNS.map(({ status, title }) => (
            <KanbanColumn
              key={status}
              status={status}
              title={title}
              tasks={columnTasksMap[status]}
            />
          ))}

          <AnimatePresence>
            {showDone && <DoneColumn key="done" />}
          </AnimatePresence>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeTask && (
          <div className="rotate-1 opacity-90">
            <div className="rounded-lg border border-orange-500/30 bg-[#1E1E1E] p-3 shadow-xl min-w-[260px]">
              <p className="text-sm text-white/90 truncate">{activeTask.title}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
