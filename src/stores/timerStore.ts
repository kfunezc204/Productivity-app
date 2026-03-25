import { create } from "zustand";

export type TimerPhase = "focus" | "short_break" | "long_break";
export type TimerStatus = "idle" | "running" | "paused";

export type TimerState = {
  phase: TimerPhase;
  status: TimerStatus;
  secondsRemaining: number;
  currentCycle: number;
  activeTaskId: string | null;
};

// Timer actions implemented in Milestone 3
export const useTimerStore = create<TimerState>(() => ({
  phase: "focus",
  status: "idle",
  secondsRemaining: 25 * 60,
  currentCycle: 1,
  activeTaskId: null,
}));
