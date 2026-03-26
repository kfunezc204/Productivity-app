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
import type React from "react";

export const ICON_MAP: Record<string, React.ElementType> = {
  inbox: Inbox,
  briefcase: Briefcase,
  home: Home,
  star: Star,
  heart: Heart,
  book: BookOpen,
  code: Code2,
  music: Music,
  zap: Zap,
  cart: ShoppingCart,
  gym: Dumbbell,
  travel: Plane,
};

export function ListIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = ICON_MAP[icon] ?? Inbox;
  return <Icon size={15} style={{ color }} className="flex-shrink-0" />;
}
