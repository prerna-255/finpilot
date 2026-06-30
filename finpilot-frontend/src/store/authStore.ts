import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: string;
  is_email_verified: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        console.log("✅ setAuth called");
        console.log("User:", user);
        console.log("Access Token:", accessToken);

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);

          console.log(
            "Stored token:",
            localStorage.getItem("access_token")
          );
        }

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        console.log("✅ Auth state updated");
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, ...updates }
            : null,
        })),
    }),
    {
      name: "finpilot-auth",
    }
  )
);