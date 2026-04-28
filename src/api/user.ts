import { api } from "../lib/axios";

export interface UserProfileCounts {
  followee_count: number;
  follower_count: number;
  like_received_count: number;
  favorite_received_count: number;
  content_count: number;
}

export interface UserProfileResponse {
  user_profile: {
    user_id: string;
    nickname: string;
    avatar: string;
    bio: string;
    gender: number;
    birthday: string;
  };
  counts: UserProfileCounts;
  viewer: {
    is_following: boolean;
  };
}

export const userApi = {
  getProfile: async (userId: string): Promise<UserProfileResponse> => {
    return api.get(`/user/profile/${userId}`);
  },

  followUser: async (
    target_user_id: string,
  ): Promise<{ is_followed: boolean }> => {
    return api.post("/interaction/followings", { target_user_id });
  },

  unfollowUser: async (
    target_user_id: string,
  ): Promise<{ is_followed: boolean }> => {
    return api.delete("/interaction/followings", { data: { target_user_id } });
  },

  updateProfile: async (data: {
    nickname?: string;
    bio?: string;
    avatar?: string;
  }): Promise<any> => {
    return api.put("/users/me/profile", data);
  },

  uploadAvatar: async (
    file: File,
  ): Promise<{ url: string; object_key: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/users/avatar/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  getFollowers: async (params: {
    user_id: string;
    cursor?: string;
    page_size?: number;
  }): Promise<{ items: any[]; next_cursor: string; has_more: boolean }> => {
    return api.post("/user/followers", params);
  },
};
