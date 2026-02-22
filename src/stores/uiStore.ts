import { create } from "zustand";

const THEME_KEY = "khetibuddy-theme";

function getStoredTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
  return stored === "dark" || stored === "light" ? stored : "light";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(THEME_KEY, theme);
}

interface UiState {
  sidebarOpen: boolean;
  activeRoute: string;
  theme: "light" | "dark";
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setActiveRoute: (route: string) => void;
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  activeRoute: "/dashboard",
  theme: getStoredTheme(),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setActiveRoute: (activeRoute) => set({ activeRoute }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    }),
}));

// Apply stored theme on load (for SSR/hydration or if store is used before React mounts)
if (typeof document !== "undefined") {
  applyTheme(getStoredTheme());
}
