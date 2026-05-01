import { api } from "../lib/axios";
import { normalizeId } from "../lib/ids";

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

interface RawAuthResponse extends Omit<AuthResponse, "user_id"> {
  user_id: string | number;
}

interface GetMeResponse {
  user_info: {
    user_id: string;
    mobile: string;
    nickname: string;
    avatar: string;
    bio: string;
    gender: number;
    status: number;
    email: string;
    birthday: number;
  };
  followee_count: number;
  follower_count: number;
  like_received_count: number;
  favorite_received_count: number;
  content_count: number;
}

interface RawGetMeResponse extends Omit<GetMeResponse, "user_info"> {
  user_info: Omit<GetMeResponse["user_info"], "user_id"> & {
    user_id: string | number;
  };
}

function normalizeAuthResponse(data: RawAuthResponse): AuthResponse {
  return {
    ...data,
    user_id: normalizeId(data.user_id),
  };
}

export const authApi = {
  login: async (data: LoginParams): Promise<AuthResponse> => {
    const response = (await api.post("/login", data)) as RawAuthResponse;
    return normalizeAuthResponse(response);
  },
  
  register: async (data: RegisterParams): Promise<AuthResponse> => {
    const response = (await api.post("/users", data)) as RawAuthResponse;
    return normalizeAuthResponse(response);
  },

  logout: async (): Promise<void> => {
    return api.post("/logout");
  },

  getMe: async (): Promise<GetMeResponse> => {
    const data = (await api.get("/users/me")) as RawGetMeResponse;
    return {
      ...data,
      user_info: {
        ...data.user_info,
        user_id: normalizeId(data.user_info.user_id),
      },
    };
  }
};
