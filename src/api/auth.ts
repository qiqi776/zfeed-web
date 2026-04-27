import { api } from "../lib/axios";

export interface LoginParams {
  mobile: string;
  password?: string;
}

export interface RegisterParams {
  mobile: string;
  password?: string;
  nickname?: string;
}

export interface AuthResponse {
  user_id: string;
  token: string;
  expired_at: number;
  nickname?: string;
  avatar?: string;
}

export const authApi = {
  login: async (data: LoginParams): Promise<AuthResponse> => {
    return api.post("/login", data);
  },
  
  register: async (data: RegisterParams): Promise<AuthResponse> => {
    return api.post("/users", data);
  },

  logout: async (): Promise<void> => {
    return api.post("/logout");
  },

  getMe: async (): Promise<any> => {
    return api.get("/users/me");
  }
};
