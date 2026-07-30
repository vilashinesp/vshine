import { api } from "@/lib/api";
import { User } from "@/types";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export function storeSession(tokens: TokenPair) {
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  document.cookie = `access_token=${tokens.access_token}; path=/; max-age=1800`;
  document.cookie = `user_role=${tokens.user.role}; path=/; max-age=2592000`;
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
}

export async function signup(data: { email: string; password: string; full_name: string; phone?: string; role: string }) {
  const res = await api.post<TokenPair>("/auth/signup", data);
  storeSession(res.data);
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post<TokenPair>("/auth/login", { email, password });
  storeSession(res.data);
  return res.data;
}

export async function googleLogin(idToken: string) {
  const res = await api.post<TokenPair>("/auth/google", { id_token: idToken });
  storeSession(res.data);
  return res.data;
}

export async function logout() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (refreshToken) {
    await api.post("/auth/logout", { refresh_token: refreshToken }).catch(() => {});
  }
  clearSession();
}

export async function forgotPassword(email: string) {
  await api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, new_password: string) {
  await api.post("/auth/reset-password", { token, new_password });
}

export async function getMe() {
  const res = await api.get<User>("/auth/me");
  return res.data;
}
