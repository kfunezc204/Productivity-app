import { useTimerStore } from "@/stores/timerStore";
import { useTaskStore } from "@/stores/taskStore";

export default function TaskQueue() {
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const taskQueue = useTimerStore((s) => s.taskQueue);
  const tasks = useTaskStore((s) => s.tasks);

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const queuedTasks = taskQueue
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
        Task Queue
      </span>

      {/* Active task */}
      {activeTask && (
        <div className="flex items-center gap-2 py-1.5 border-b border-white/5">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          <span className="flex-1 truncate text-xs text-white/80 font-medium">
            {activeTask.title}
          </span>
          <span className="text-[10px] text-orange-500/70">now</span>
        </div>
      )}

      {/* Queued tasks */}
      {queuedTasks.length === 0 && !activeTask && (
        <div className="text-xs text-white/20 text-center py-4">No tasks queued</div>
      )}

      {queuedTasks.map((task, i) => (
        <div
          key={task!.id}
          className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white/20 flex-shrink-0" />
          <span className="flex-1 truncate text-xs text-white/40">{task!.title}</span>
          <span className="text-[10px] text-white/20">#{i + 2}</span>
        </div>
      ))}
    </div>
  );
}
