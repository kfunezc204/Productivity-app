import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useReportStore, type DateRangeLabel } from "@/stores/reportStore";
import { useSettingsStore } from "@/stores/settingsStore";

type Preset = { label: string; id: DateRangeLabel };

const PRESETS: Preset[] = [
  { label: "Today", id: "today" },
  { label: "This Week", id: "this_week" },
  { label: "This Month", id: "this_month" },
  { label: "Custom", id: "custom" },
];

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useReportStore.getState();
  const activeLabel = useReportStore((s) => s.dateRange.label);
  const weekStart = useSettingsStore((s) => s.weekStart) as 0 | 1;

  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [popoverOpen, setPopoverOpen] = useState(false);

  async function selectPreset(id: DateRangeLabel) {
    if (id === "custom") {
      setPopoverOpen(true);
      return;
    }
    const now = new Date();
    let from: Date, to: Date;
    if (id === "today") {
      from = startOfDay(now);
      to = endOfDay(now);
    } else if (id === "this_week") {
      from = startOfWeek(now, { weekStartsOn: weekStart });
      to = endOfWeek(now, { weekStartsOn: weekStart });
    } else {
      from = startOfMonth(now);
      to = endOfMonth(now);
    }
    await setDateRange({ from: from.toISOString(), to: to.toISOString(), label: id });
  }

  async function applyCustom() {
    if (!customFrom) return;
    const from = startOfDay(customFrom);
    const to = customTo ? endOfDay(customTo) : endOfDay(customFrom);
    await setDateRange({ from: from.toISOString(), to: to.toISOString(), label: "custom" });
    setPopoverOpen(false);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap print:hidden">
      <div className="flex items-center gap-1 rounded-lg border border-[#2A2A2A] p-1 bg-[#111]">
        {PRESETS.map((p) =>
          p.id === "custom" ? (
            <Popover key={p.id} open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-colors ${
                  activeLabel === "custom"
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <CalendarIcon size={11} />
                {activeLabel === "custom" ? (
                  <span>
                    {format(new Date(useReportStore.getState().dateRange.from), "MMM d")}
                    {" – "}
                    {format(new Date(useReportStore.getState().dateRange.to), "MMM d")}
                  </span>
                ) : (
                  "Custom"
                )}
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-4 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                align="start"
              >
                <p className="text-xs text-white/50 mb-3">Select date range</p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">From</p>
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      className="rounded-md border-[#2A2A2A]"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 mb-1 uppercase tracking-wider">To</p>
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      disabled={(d) => customFrom != null && d < customFrom}
                      className="rounded-md border-[#2A2A2A]"
                    />
                  </div>
                </div>
                <Button
                  onClick={applyCustom}
                  disabled={!customFrom}
                  className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
                >
                  Apply
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              className={`px-3 py-1 rounded-md text-xs transition-colors ${
                activeLabel === p.id
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {p.label}
            </button>
          )
        )}
      </div>

      {/* Export button */}
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A2A] text-xs text-white/40 hover:text-white/70 hover:border-[#3A3A3A] transition-colors ml-auto"
      >
        <Printer size={12} />
        Export PDF
      </button>
    </div>
  );
}
