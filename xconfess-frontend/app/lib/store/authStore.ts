"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/app/lib/types/user";
import { AUTH_TOKEN_KEY, USER_DATA_KEY } from "@/app/lib/api/constants";

export interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setAuthenticated: (value) =>
        set({ isAuthenticated: value, error: value ? null : undefined }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_DATA_KEY);
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      hydrateFromStorage: () => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem(AUTH_TOKEN_KEY);
        const userJson = localStorage.getItem(USER_DATA_KEY);
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        try {
          const user = userJson ? (JSON.parse(userJson) as User) : null;
          set({ user, isAuthenticated: !!user });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "xconfess-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
