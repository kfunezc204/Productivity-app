import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import { useReportStore } from "@/stores/reportStore";
import { formatMinutes } from "@/lib/timeUtils";
import { format, parseISO } from "date-fns";

export default function TasksPerDayChart() {
  const tasksPerDay = useReportStore((s) => s.tasksPerDay);
  const isLoaded = useReportStore((s) => s.isLoaded);

  if (!isLoaded) {
    return <div className="h-64 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] animate-pulse" />;
  }

  const hasData = tasksPerDay.some((d) => d.focusMinutes > 0 || d.count > 0);

  if (!hasData) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 flex flex-col items-center justify-center h-64">
        <p className="text-sm text-white/30">No activity in this period</p>
      </Card>
    );
  }

  const xLabel = (date: string) => {
    try {
      return format(parseISO(date), "MMM d");
    } catch {
      return date;
    }
  };

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
      <h3 className="text-sm font-semibold text-white/70 mb-4">Focus Time per Day</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={tasksPerDay} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={xLabel}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v}m`}
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              labelFormatter={(label) => xLabel(String(label))}
              formatter={(value, name) => {
                if (name === "focusMinutes") return [formatMinutes(Number(value)), "Focus Time"];
                return [String(value), "Tasks Done"];
              }}
            />
            <Bar dataKey="focusMinutes" radius={[3, 3, 0, 0]} maxBarSize={40}>
              {tasksPerDay.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.focusMinutes > 0 ? "#F97316" : "rgba(249,115,22,0.15)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
