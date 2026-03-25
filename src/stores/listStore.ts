import { create } from "zustand";
import {
  getAllLists,
  createList as dbCreateList,
  updateList as dbUpdateList,
  deleteList as dbDeleteList,
  reorderLists as dbReorderLists,
} from "@/lib/db";

export type List = {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

type ListState = {
  lists: List[];
  selectedListId: string | null;
  isLoaded: boolean;
};

type ListActions = {
  loadLists: () => Promise<void>;
  createList: (name: string, color: string, icon: string) => Promise<void>;
  updateList: (id: string, fields: Partial<{ name: string; color: string; icon: string }>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (ids: string[]) => Promise<void>;
  selectList: (id: string | null) => void;
};

export const useListStore = create<ListState & ListActions>((set, get) => ({
  lists: [],
  selectedListId: null,
  isLoaded: false,

  loadLists: async () => {
    try {
      const lists = await getAllLists();
      set({ lists, isLoaded: true });
    } catch (e) {
      console.error("loadLists failed:", e);
      set({ isLoaded: true }); // unblock UI
    }
  },

  createList: async (name, color, icon) => {
    const { lists } = get();
    const id = crypto.randomUUID();
    const position = lists.length;
    await dbCreateList(id, name, color, icon, position);
    await get().loadLists();
  },

  updateList: async (id, fields) => {
    await dbUpdateList(id, fields);
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === id ? { ...l, ...fields } : l
      ),
    }));
  },

  deleteList: async (id) => {
    await dbDeleteList(id);
    const { selectedListId } = get();
    if (selectedListId === id) {
      set({ selectedListId: null });
    }
    await get().loadLists();
    // Reload tasks — CASCADE removes them in DB
    const { useTaskStore } = await import("@/stores/taskStore");
    await useTaskStore.getState().loadTasks();
  },

  reorderLists: async (ids) => {
    const updates = ids.map((id, i) => ({ id, position: i }));
    await dbReorderLists(updates);
    set((state) => {
      const byId = new Map(state.lists.map((l) => [l.id, l]));
      const reordered = ids
        .map((id, i) => {
          const l = byId.get(id);
          return l ? { ...l, position: i } : null;
        })
        .filter((l): l is List => l !== null);
      return { lists: reordered };
    });
  },

  selectList: (id) => {
    set({ selectedListId: id });
  },
}));
