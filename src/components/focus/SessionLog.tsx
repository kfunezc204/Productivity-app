import { format, parseISO } from "date-fns";
import { Focus, Coffee } from "lucide-react";
import { useTimerStore, type CompletedInterval } from "@/stores/timerStore";

function IntervalRow({ interval }: { interval: CompletedInterval }) {
  const isFocus = interval.phase === "focus";
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span
        className={`flex-shrink-0 ${isFocus ? "text-orange-500/70" : "text-blue-400/70"}`}
      >
        {isFocus ? <Focus size={12} /> : <Coffee size={12} />}
      </span>
      <span className="flex-1 truncate text-xs text-white/60">
        {interval.taskTitle ?? (isFocus ? "Focus" : "Break")}
      </span>
      <span className="flex-shrink-0 text-[10px] text-white/30">
        {interval.durationMinutes}m
      </span>
      <span className="flex-shrink-0 text-[10px] text-white/20">
        {format(parseISO(interval.endedAt), "HH:mm")}
      </span>
    </div>
  );
}

export default function SessionLog() {
  const intervals = useTimerStore((s) => s.completedIntervals);

  if (intervals.length === 0) {
    return (
      <div className="text-xs text-white/20 text-center py-4">
        Completed intervals will appear here
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold tracking-widest text-white/30 uppercase mb-2">
        Session Log
      </span>
      <div className="max-h-40 overflow-y-auto">
        {[...intervals].reverse().map((interval) => (
          <IntervalRow key={interval.sessionId} interval={interval} />
        ))}
      </div>
    </div>
  );
}
