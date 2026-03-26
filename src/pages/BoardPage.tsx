import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskStore } from "@/stores/taskStore";
import { useListStore } from "@/stores/listStore";
import KanbanBoard from "@/components/tasks/KanbanBoard";
import TaskDetailPanel from "@/components/tasks/TaskDetailPanel";

export default function BoardPage() {
  const tasksLoaded = useTaskStore((s) => s.isLoaded);
  const listsLoaded = useListStore((s) => s.isLoaded);

  // Empty deps: run once on mount via getState() — avoids Zustand v5 reference instability
  useEffect(() => {
    useTaskStore.getState().loadTasks();
    useListStore.getState().loadLists();
  }, []);

  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);

  const ready = tasksLoaded && listsLoaded;

  if (!ready) {
    return (
      <div className="flex flex-1 h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-xs text-white/30">Loading board…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
        <KanbanBoard />
        <AnimatePresence>
          {selectedTaskId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-10 cursor-pointer"
              onClick={() => useTaskStore.getState().selectTask(null)}
            />
          )}
        </AnimatePresence>
      </div>
      <TaskDetailPanel />
    </div>
  );
}
