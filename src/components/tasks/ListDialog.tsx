import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Inbox,
  Briefcase,
  Home,
  Star,
  Heart,
  BookOpen,
  Code2,
  Music,
  Zap,
  ShoppingCart,
  Dumbbell,
  Plane,
} from "lucide-react";
import { useListStore, type List } from "@/stores/listStore";

const PRESET_COLORS = [
  "#6B7280", // gray
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
];

const ICON_OPTIONS = [
  { name: "inbox", Icon: Inbox },
  { name: "briefcase", Icon: Briefcase },
  { name: "home", Icon: Home },
  { name: "star", Icon: Star },
  { name: "heart", Icon: Heart },
  { name: "book", Icon: BookOpen },
  { name: "code", Icon: Code2 },
  { name: "music", Icon: Music },
  { name: "zap", Icon: Zap },
  { name: "cart", Icon: ShoppingCart },
  { name: "gym", Icon: Dumbbell },
  { name: "travel", Icon: Plane },
];

type Props = {
  open: boolean;
  onClose: () => void;
  editingList?: List | null;
};

export default function ListDialog({ open, onClose, editingList }: Props) {
  const { createList, updateList } = useListStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState("inbox");

  useEffect(() => {
    if (open) {
      setName(editingList?.name ?? "");
      setColor(editingList?.color ?? PRESET_COLORS[0]);
      setIcon(editingList?.icon ?? "inbox");
    }
  }, [open, editingList]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editingList) {
      await updateList(editingList.id, { name: trimmed, color, icon });
    } else {
      await createList(trimmed, color, icon);
    }
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-sm">
            {editingList ? "Edit List" : "New List"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Name */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 30))}
              onKeyDown={handleKeyDown}
              placeholder="List name"
              autoFocus
              className="bg-[#111] border-[#2A2A2A] focus:border-orange-500/50 text-white placeholder:text-white/25"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform hover:scale-110 relative"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white/80" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 block">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map(({ name: iconName, Icon }) => (
                <button
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                    icon === iconName
                      ? "bg-orange-500/20 text-orange-400"
                      : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
                  }`}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {editingList ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
