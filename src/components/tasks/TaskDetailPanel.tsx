import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskStore, type TaskStatus } from "@/stores/taskStore";
import { useListStore } from "@/stores/listStore";
import { formatMinutes, parseEstimate } from "@/lib/timeUtils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  this_week: "This Week",
  today: "Today",
  done: "Done",
};

const RECURRENCE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

export default function TaskDetailPanel() {
  const tasks = useTaskStore((s) => s.tasks);
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId);
  const { selectTask, updateTask, deleteTask } = useTaskStore.getState();
  const lists = useListStore((s) => s.lists);
  const task = tasks.find((t) => t.id === selectedTaskId) ?? null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estInput, setEstInput] = useState("");
  const [calOpen, setCalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setEstInput(task.estimatedMinutes != null ? formatMinutes(task.estimatedMinutes) : "");
      setConfirmDelete(false);
    }
  }, [task?.id]);

  if (!task) return null;

  async function saveTitle() {
    if (!task) return;
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) {
      await updateTask(task.id, { title: trimmed });
    }
  }

  async function saveDescription() {
    if (!task) return;
    const val = description.trim() || null;
    if (val !== task.description) {
      await updateTask(task.id, { description: val });
    }
  }

  async function saveEst() {
    if (!task) return;
    const mins = parseEstimate(estInput);
    if (mins !== task.estimatedMinutes) {
      await updateTask(task.id, { estimatedMinutes: mins });
    }
  }

  async function handleStatusChange(s: string | null) {
    if (!task || !s) return;
    await updateTask(task.id, { status: s as TaskStatus });
  }

  async function handleListChange(listId: string | null) {
    if (!task || !listId) return;
    await updateTask(task.id, { listId });
  }

  async function handleDueDateSelect(date: Date | undefined) {
    if (!task) return;
    const val = date ? date.toISOString().split("T")[0] : null;
    await updateTask(task.id, { dueDate: val });
    setCalOpen(false);
  }

  async function handleRecurrenceChange(val: string | null) {
    if (!task || !val) return;
    await updateTask(task.id, { recurrenceRule: val === "none" ? null : val });
  }

  async function handleDelete() {
    if (!task) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteTask(task.id);
    selectTask(null);
  }

  const dueDateObj = task.dueDate ? parseISO(task.dueDate) : undefined;

  return (
    <AnimatePresence>
      {selectedTaskId && (
        <motion.aside
          key="detail"
          initial={{ x: 360, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 360, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-[340px] flex-shrink-0 border-l border-[#2A2A2A] bg-[#111111] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Task Detail
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white/30 hover:text-white"
              onClick={() => selectTask(null)}
            >
              <X size={13} />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {/* Title */}
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500/50 text-white text-sm"
              />
            </div>

            {/* Status + List row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                  Status
                </label>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 text-xs bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs text-white/80">
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                  List
                </label>
                <Select value={task.listId} onValueChange={handleListChange}>
                  <SelectTrigger className="h-8 text-xs bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {lists.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs text-white/80">
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* EST + Actual */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                  Estimate
                </label>
                <Input
                  value={estInput}
                  onChange={(e) => setEstInput(e.target.value)}
                  onBlur={saveEst}
                  onKeyDown={(e) => e.key === "Enter" && saveEst()}
                  placeholder="e.g. 30m, 1h"
                  className="h-8 text-xs bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500/50 text-white placeholder:text-white/25"
                />
              </div>
              <div>
                <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                  Actual
                </label>
                <div className="h-8 flex items-center px-3 rounded-md border border-[#2A2A2A] bg-[#1A1A1A]">
                  <span className="text-xs text-white/40">
                    {task.actualMinutes > 0 ? formatMinutes(task.actualMinutes) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Due Date
              </label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger className="flex items-center gap-2 w-full h-8 px-3 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] text-xs text-white/70 hover:border-[#3A3A3A] transition-colors text-left">
                    <Calendar size={12} className="text-white/30" />
                    {dueDateObj
                      ? format(dueDateObj, "MMM d, yyyy")
                      : <span className="text-white/25">Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2A2A2A]" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={dueDateObj}
                    onSelect={handleDueDateSelect}
                    initialFocus
                    className="text-white"
                  />
                  {task.dueDate && (
                    <div className="px-3 pb-3">
                      <button
                        onClick={() => handleDueDateSelect(undefined)}
                        className="text-xs text-white/40 hover:text-white/70 underline"
                      >
                        Clear date
                      </button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            {/* Recurrence */}
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Repeat
              </label>
              <Select
                value={task.recurrenceRule ?? "none"}
                onValueChange={handleRecurrenceChange}
              >
                <SelectTrigger className="h-8 text-xs bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {RECURRENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs text-white/80">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-wider mb-1 block">
                Notes
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                placeholder="Add notes…"
                rows={4}
                className="bg-[#1A1A1A] border-[#2A2A2A] focus:border-orange-500/50 text-white text-xs placeholder:text-white/25 resize-none"
              />
            </div>
          </div>

          {/* Footer — delete */}
          <div className="px-4 py-3 border-t border-[#2A2A2A]">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className={`w-full text-xs gap-2 ${
                confirmDelete
                  ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  : "text-white/30 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <Trash2 size={12} />
              {confirmDelete ? "Confirm delete?" : "Delete task"}
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
