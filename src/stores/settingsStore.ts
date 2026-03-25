import { create } from "zustand";
import { getSetting, setSetting } from "@/lib/db";

type Theme = "dark" | "light";

type SettingsState = {
  theme: Theme;
  pomodoroFocusMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroCyclesBeforeLongBreak: number;
  weekStart: number; // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean;
  lockerDuringBreaks: boolean;
  isLoaded: boolean;
};

type SettingsActions = {
  loadSettings: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setLockerDuringBreaks: (val: boolean) => Promise<void>;
};

export const useSettingsStore = create<SettingsState & SettingsActions>(
  (set) => ({
    theme: "dark",
    pomodoroFocusMinutes: 25,
    pomodoroShortBreakMinutes: 5,
    pomodoroLongBreakMinutes: 15,
    pomodoroCyclesBeforeLongBreak: 4,
    weekStart: 1,
    notificationsEnabled: true,
    lockerDuringBreaks: false,
    isLoaded: false,

    loadSettings: async () => {
      const [
        theme,
        focusMin,
        shortBreakMin,
        longBreakMin,
        cycles,
        weekStart,
        notifs,
        lockerBreaks,
      ] = await Promise.all([
        getSetting("theme"),
        getSetting("pomodoro_focus_minutes"),
        getSetting("pomodoro_short_break_minutes"),
        getSetting("pomodoro_long_break_minutes"),
        getSetting("pomodoro_cycles_before_long_break"),
        getSetting("week_start"),
        getSetting("notifications_enabled"),
        getSetting("locker_during_breaks"),
      ]);

      const resolvedTheme: Theme =
        theme === "light" ? "light" : "dark";

      // Apply theme to DOM
      document.documentElement.classList.toggle(
        "dark",
        resolvedTheme === "dark"
      );

      set({
        theme: resolvedTheme,
        pomodoroFocusMinutes: focusMin ? parseInt(focusMin) : 25,
        pomodoroShortBreakMinutes: shortBreakMin ? parseInt(shortBreakMin) : 5,
        pomodoroLongBreakMinutes: longBreakMin ? parseInt(longBreakMin) : 15,
        pomodoroCyclesBeforeLongBreak: cycles ? parseInt(cycles) : 4,
        weekStart: weekStart ? parseInt(weekStart) : 1,
        notificationsEnabled: notifs !== "false",
        lockerDuringBreaks: lockerBreaks === "true",
        isLoaded: true,
      });
    },

    setTheme: async (theme: Theme) => {
      await setSetting("theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
      set({ theme });
    },

    setLockerDuringBreaks: async (val: boolean) => {
      await setSetting("locker_during_breaks", String(val));
      set({ lockerDuringBreaks: val });
    },
  })
);
