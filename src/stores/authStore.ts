import { create } from "zustand";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  role: UserRole | null;
  tenantId: string | null;
  token: string | null;
  setAuth: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  tenantId: null,
  token: null,
  setAuth: (user) =>
    set({
      user,
      role: user?.role ?? null,
      tenantId: user?.tenant_id ?? null,
      token: user ? "cookie" : null,
    }),
  logout: () =>
    set({
      user: null,
      role: null,
      tenantId: null,
      token: null,
    }),
}));
