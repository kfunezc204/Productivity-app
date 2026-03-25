import { ShieldCheck } from "lucide-react";

export default function LockerBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1">
      <ShieldCheck size={12} className="text-orange-500" />
      <span className="text-[10px] font-semibold tracking-wider text-orange-400 uppercase">
        Locker ON
      </span>
    </div>
  );
}
