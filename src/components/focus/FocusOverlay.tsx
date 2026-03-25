import { useEffect } from "react";
import { useTimerStore } from "@/stores/timerStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTaskStore } from "@/stores/taskStore";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import TaskQueue from "./TaskQueue";
import SessionLog from "./SessionLog";
import LockerBadge from "./LockerBadge";

type Props = {
  onExit: () => void;
};

export default function FocusOverlay({ onExit }: Props) {
  const phase = useTimerStore((s) => s.phase);
  const status = useTimerStore((s) => s.status);
  const secondsRemaining = useTimerStore((s) => s.secondsRemaining);
  const totalSeconds = useTimerStore((s) => s.totalSeconds);
  const currentCycle = useTimerStore((s) => s.currentCycle);
  const activeTaskId = useTimerStore((s) => s.activeTaskId);
  const activeLockerProfileId = useTimerStore((s) => s.activeLockerProfileId);
  const { pause, resume } = useTimerStore.getState();

  const cyclesBeforeLong = useSettingsStore((s) => s.pomodoroCyclesBeforeLongBreak);
  const activeTask = useTaskStore((s) => s.tasks.find((t) => t.id === activeTaskId));

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't fire if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          if (status === "running") pause();
          else if (status === "paused") resume();
          break;
        case "s":
        case "S":
          useTimerStore.getState().skip();
          break;
        case "d":
        case "D":
          if (phase === "focus") useTimerStore.getState().markDone();
          break;
        case "Escape":
          onExit();
          break;
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [status, phase, pause, resume, onExit]);

  // Cycle dots
  const dots = Array.from({ length: cyclesBeforeLong }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold text-white/40 tracking-wider">BlitzDesk</span>
        {activeLockerProfileId && <LockerBadge />}
        <div className="flex items-center gap-1.5">
          {dots.map((dot) => (
            <span
              key={dot}
              className={`h-2 w-2 rounded-full transition-colors ${
                dot <= currentCycle ? "bg-orange-500" : "bg-white/10"
              }`}
            />
          ))}
          <span className="ml-2 text-xs text-white/30">
            Cycle {currentCycle}/{cyclesBeforeLong}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — Task Queue */}
        <div className="hidden lg:flex w-64 flex-col border-r border-white/5 p-6">
          <TaskQueue />
        </div>

        {/* Center — Timer */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8">
          {/* Task title */}
          <div className="text-center max-w-lg">
            {phase === "focus" ? (
              <p className="text-xl font-medium text-white/80 leading-snug">
                {activeTask?.title ?? "Focus time"}
              </p>
            ) : (
              <p className="text-lg text-white/40">
                {phase === "short_break" ? "Take a short break" : "Take a long break — you earned it"}
              </p>
            )}
          </div>

          {/* Timer */}
          <TimerDisplay
            secondsRemaining={secondsRemaining}
            totalSeconds={totalSeconds}
            phase={phase}
          />

          {/* Controls */}
          <TimerControls onExit={onExit} />

          {/* Keyboard hints */}
          <div className="flex gap-4 text-[10px] text-white/20">
            <span>Space — pause/resume</span>
            <span>S — skip</span>
            {phase === "focus" && <span>D — done</span>}
            <span>Esc — exit</span>
          </div>
        </div>

        {/* Right panel — Session Log */}
        <div className="hidden lg:flex w-64 flex-col border-l border-white/5 p-6">
          <SessionLog />
        </div>
      </div>
    </div>
  );
}
