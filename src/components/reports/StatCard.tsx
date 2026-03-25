import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
};

export default function StatCard({ icon: Icon, label, value, subtitle }: Props) {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-500/20 flex items-center justify-center">
          <Icon size={18} className="text-orange-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-white/40 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white leading-none">{value}</p>
          {subtitle && <p className="text-xs text-white/30 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
}
