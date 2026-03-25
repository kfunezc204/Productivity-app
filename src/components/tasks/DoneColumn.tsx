import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useTaskStore, type Task } from "@/stores/taskStore";
import { formatMinutes } from "@/lib/timeUtils";
import { format, parseISO } from "date-fns";

export default function DoneColumn() {
  const { doneTasks, uncompleteTask } = useTaskStore();

  async function handleUncheck(task: Task) {
    await uncompleteTask(task.id, "backlog");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-w-[280px] flex-1"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full flex-shrink-0 bg-emerald-500" />
        <span className="text-sm font-semibold text-white/80">Done</span>
        <span className="text-xs text-white/30 tabular-nums">{doneTasks.length}</span>
      </div>

      {/* Cards */}
      <div className="flex-1 rounded-lg border border-[#2A2A2A] bg-[#111111]">
        <ScrollArea className="h-full max-h-[calc(100vh-220px)]">
          <div className="flex flex-col gap-2 p-2">
            {doneTasks.length === 0 && (
              <p className="text-xs text-white/20 text-center py-4">No completed tasks</p>
            )}
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] p-3 opacity-60"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0">
                    <Checkbox
                      checked={true}
                      onCheckedChange={() => handleUncheck(task)}
                      className="border-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/50 line-through line-clamp-2 break-words">
                      {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {task.estimatedMinutes != null && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px] bg-white/5 text-white/30 border-0">
                          {formatMinutes(task.estimatedMinutes)}
                        </Badge>
                      )}
                      {task.completedAt && (
                        <span className="text-[10px] text-white/25">
                          {format(parseISO(task.completedAt), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
}
