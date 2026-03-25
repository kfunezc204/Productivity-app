import { Clock, CheckCircle, Target, Flame } from "lucide-react";
import StatCard from "./StatCard";
import { useReportStore } from "@/stores/reportStore";
import { formatMinutes } from "@/lib/timeUtils";

export default function StatsRow() {
  const stats = useReportStore((s) => s.stats);
  const isLoaded = useReportStore((s) => s.isLoaded);

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] animate-pulse" />
        ))}
      </div>
    );
  }

  const accuracyDisplay =
    stats.avgEstAccuracy != null ? `${Math.round(stats.avgEstAccuracy)}%` : "—";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={Clock}
        label="Focus Time"
        value={formatMinutes(stats.totalFocusMinutes)}
        subtitle="total this period"
      />
      <StatCard
        icon={CheckCircle}
        label="Tasks Done"
        value={String(stats.tasksCompleted)}
        subtitle="completed"
      />
      <StatCard
        icon={Target}
        label="EST Accuracy"
        value={accuracyDisplay}
        subtitle={stats.avgEstAccuracy != null ? "estimated vs actual" : "no data yet"}
      />
      <StatCard
        icon={Flame}
        label="Streak"
        value={String(stats.currentStreak)}
        subtitle={stats.currentStreak === 1 ? "day" : "days"}
      />
    </div>
  );
}
