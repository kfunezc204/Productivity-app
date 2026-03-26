import { useEffect, useState } from "react";
import { Play, Pause, SkipForward, Maximize2, X } from "lucide-react";
import { onTimerState, sendTimerAction } from "@/lib/timerBridge";
import type { TimerSnapshot } from "@/lib/timerBridge";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const PHASE_DOT: Record<string, string> = {
  focus: "bg-orange-500",
  short_break: "bg-blue-400",
  long_break: "bg-purple-400",
};

export default function FloatingTimer() {
  const [snapshot, setSnapshot] = useState<TimerSnapshot | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    onTimerState((s) => setSnapshot(s)).then((fn) => {
      unlisten = fn;
    });
    return () => {
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === " ") {
        e.preventDefault();
        if (snapshot?.status === "running") sendTimerAction("pause").catch(console.warn);
        else if (snapshot?.status === "paused") sendTimerAction("resume").catch(console.warn);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [snapshot?.status]);

  if (!snapshot || snapshot.status === "idle") return null;

  const progress =
    snapshot.totalSeconds > 0
      ? (snapshot.totalSeconds - snapshot.secondsRemaining) / snapshot.totalSeconds
      : 0;

  const phaseLabel =
    snapshot.phase === "focus"
      ? (snapshot.currentSubtaskTitle ?? snapshot.activeTaskTitle ?? "Focus time")
      : snapshot.phase === "short_break"
      ? "Short break"
      : "Long break";

  return (
    <div
      className="w-[340px] h-[88px] rounded-xl bg-[#1A1A1A]/95 backdrop-blur-sm border border-white/10 flex flex-col select-none overflow-hidden shadow-2xl"
      data-tauri-drag-region
    >
      {/* Main row */}
      <div className="flex items-center gap-2.5 px-3 pt-3 flex-1" data-tauri-drag-region>
        {/* Phase dot */}
        <span
          className={`h-2 w-2 rounded-full flex-shrink-0 ${PHASE_DOT[snapshot.phase] ?? "bg-white/20"}`}
        />

        {/* Task / subtask title */}
        <span
          className="flex-1 text-[11px] text-white/60 truncate min-w-0"
          data-tauri-drag-region
        >
          {phaseLabel}
        </span>

        {/* Subtask progress badge */}
        {snapshot.subtaskProgress && (
          <span className="text-[10px] text-white/30 flex-shrink-0 tabular-nums">
            {snapshot.subtaskProgress.done}/{snapshot.subtaskProgress.total}
          </span>
        )}

        {/* EXTRA badge */}
        {snapshot.isExtraTime && (
          <span className="text-[9px] font-semibold text-orange-400 flex-shrink-0 tracking-widest uppercase">
            EXTRA
          </span>
        )}

        {/* MM:SS */}
        <span className="font-mono text-sm font-semibold text-white tabular-nums flex-shrink-0">
          {formatTime(snapshot.secondsRemaining)}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() =>
              snapshot.status === "running"
                ? sendTimerAction("pause").catch(console.warn)
                : sendTimerAction("resume").catch(console.warn)
            }
            className="h-6 w-6 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {snapshot.status === "running" ? <Pause size={11} /> : <Play size={11} />}
          </button>
          <button
            onClick={() => sendTimerAction("skip").catch(console.warn)}
            className="h-6 w-6 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SkipForward size={11} />
          </button>
          <button
            onClick={() => sendTimerAction("expand").catch(console.warn)}
            className="h-6 w-6 flex items-center justify-center rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 size={11} />
          </button>
          <button
            onClick={() => sendTimerAction("exit").catch(console.warn)}
            className="h-6 w-6 flex items-center justify-center rounded text-white/50 hover:text-orange-400 hover:bg-white/10 transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-3 mb-2">
        <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
