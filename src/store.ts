import { create } from "zustand";
import { setAuthToken } from "./api";

type AuthState = {
  token: string | null;
  userEmail: string | null;
  setAuth: (token: string, email: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("qr_token"),
  userEmail: localStorage.getItem("qr_email"),
  setAuth: (token, email) =>
    set(() => {
      localStorage.setItem("qr_token", token);
      localStorage.setItem("qr_email", email);
      setAuthToken(token);
      return { token, userEmail: email };
    }),
  logout: () =>
    set(() => {
      localStorage.removeItem("qr_token");
      localStorage.removeItem("qr_email");
      setAuthToken(null);
      return { token: null, userEmail: null };
    }),
}));

setAuthToken(localStorage.getItem("qr_token"));
