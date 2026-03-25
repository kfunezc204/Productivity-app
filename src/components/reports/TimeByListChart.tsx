import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { useReportStore } from "@/stores/reportStore";
import { formatMinutes } from "@/lib/timeUtils";

export default function TimeByListChart() {
  const timeByList = useReportStore((s) => s.timeByList);
  const isLoaded = useReportStore((s) => s.isLoaded);
  const totalFocusMinutes = useReportStore((s) => s.stats.totalFocusMinutes);

  if (!isLoaded) {
    return <div className="h-64 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] animate-pulse" />;
  }

  if (timeByList.length === 0) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 flex flex-col items-center justify-center h-64">
        <p className="text-sm text-white/30">No focus sessions in this period</p>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
      <h3 className="text-sm font-semibold text-white/70 mb-4">Focus Time by List</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={timeByList}
              dataKey="minutes"
              nameKey="listName"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
            >
              {timeByList.map((entry) => (
                <Cell key={entry.listId} fill={entry.listColor} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(value) => [formatMinutes(Number(value)), "Focus Time"]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-white/30 mt-1">
        Total: {formatMinutes(totalFocusMinutes)}
      </p>
    </Card>
  );
}
