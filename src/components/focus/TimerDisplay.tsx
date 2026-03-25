import { motion } from "framer-motion";
import { formatSeconds } from "@/lib/timeUtils";
import type { TimerPhase } from "@/stores/timerStore";

type Props = {
  secondsRemaining: number;
  totalSeconds: number;
  phase: TimerPhase;
};

const PHASE_LABEL: Record<TimerPhase, string> = {
  focus: "FOCUS",
  short_break: "SHORT BREAK",
  long_break: "LONG BREAK",
};

const PHASE_COLOR: Record<TimerPhase, string> = {
  focus: "text-orange-500",
  short_break: "text-blue-400",
  long_break: "text-blue-300",
};

const BAR_COLOR: Record<TimerPhase, string> = {
  focus: "bg-orange-500",
  short_break: "bg-blue-400",
  long_break: "bg-blue-300",
};

export default function TimerDisplay({ secondsRemaining, totalSeconds, phase }: Props) {
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phase label */}
      <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${PHASE_COLOR[phase]}`}>
        {PHASE_LABEL[phase]}
      </span>

      {/* MM:SS */}
      <span
        className={`font-mono text-8xl font-bold leading-none tabular-nums ${PHASE_COLOR[phase]}`}
      >
        {formatSeconds(secondsRemaining)}
      </span>

      {/* Progress bar */}
      <div className="relative h-1 w-72 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${BAR_COLOR[phase]}`}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
    </div>
  );
}
