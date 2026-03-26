import { useEffect } from "react";
import FloatingTimer from "@/components/focus/FloatingTimer";

export default function FloatingTimerPage() {
  useEffect(() => {
    // Make window background transparent
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-transparent">
      <FloatingTimer />
    </div>
  );
}
