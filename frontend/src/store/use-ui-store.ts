import { create } from "zustand";

interface UIStore {
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  
  isConfirmOpen: boolean;
  confirmConfig: {
    message: string;
    title?: string;
  };
  resolveConfirm: ((value: boolean) => void) | null;
  confirm: (message: string, title?: string) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),

  isConfirmOpen: false,
  confirmConfig: { message: "" },
  resolveConfirm: null,

  confirm: (message, title) => {
    return new Promise<boolean>((resolve) => {
      set({
        isConfirmOpen: true,
        confirmConfig: { message, title },
        resolveConfirm: resolve,
      });
    });
  },

  closeConfirm: (result) => {
    const { resolveConfirm } = get();
    if (resolveConfirm) {
      resolveConfirm(result);
    }
    set({
      isConfirmOpen: false,
      resolveConfirm: null,
    });
  },
}));
