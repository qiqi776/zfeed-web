import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  user_id: string;
  nickname: string;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  expired_at: number | null;
  login: (token: string, user: User, expired_at?: number) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expired_at: null,
      login: (token, user, expired_at) => set({ token, user, expired_at }),
      logout: () => set({ token: null, user: null, expired_at: null }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    {
      name: "auth-storage", // local storage key name
    },
  ),
);
