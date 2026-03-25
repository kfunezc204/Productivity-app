import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useReportStore } from "@/stores/reportStore";
import { formatMinutes } from "@/lib/timeUtils";

const PAGE_SIZE = 50;

export default function SessionHistoryTable() {
  const sessions = useReportStore((s) => s.sessions);
  const isLoaded = useReportStore((s) => s.isLoaded);
  const [limit, setLimit] = useState(PAGE_SIZE);

  if (!isLoaded) {
    return <div className="h-40 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] animate-pulse" />;
  }

  if (sessions.length === 0) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6 text-center">
        <p className="text-sm text-white/30">No sessions in this period</p>
      </Card>
    );
  }

  const visible = sessions.slice(0, limit);

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <div className="p-4 border-b border-[#2A2A2A]">
        <h3 className="text-sm font-semibold text-white/70">Session History</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-[#2A2A2A] hover:bg-transparent">
            <TableHead className="text-white/40 text-xs font-medium">Date / Time</TableHead>
            <TableHead className="text-white/40 text-xs font-medium">Task</TableHead>
            <TableHead className="text-white/40 text-xs font-medium">Type</TableHead>
            <TableHead className="text-white/40 text-xs font-medium text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((session) => (
            <TableRow key={session.id} className="border-[#2A2A2A] hover:bg-white/3">
              <TableCell className="text-xs text-white/50">
                {format(parseISO(session.startedAt), "MMM d, h:mm a")}
              </TableCell>
              <TableCell className="text-xs text-white/80 max-w-[200px] truncate">
                {session.taskTitle ?? <span className="text-white/30 italic">No task</span>}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={`text-[10px] border-0 ${
                    session.sessionType === "focus"
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {session.sessionType === "focus" ? "Focus" : "Break"}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-white/50 text-right">
                {session.durationMinutes != null
                  ? formatMinutes(session.durationMinutes)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {sessions.length > limit && (
        <div className="p-4 border-t border-[#2A2A2A] text-center">
          <button
            onClick={() => setLimit((l) => l + PAGE_SIZE)}
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Load more ({sessions.length - limit} remaining)
          </button>
        </div>
      )}
    </Card>
  );
}
