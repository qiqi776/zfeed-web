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
  
  followUser: async (target_user_id: string): Promise<{ is_followed: boolean }> => {
    return api.post("/interaction/followings", { target_user_id });
  },

  unfollowUser: async (target_user_id: string): Promise<{ is_followed: boolean }> => {
    return api.delete("/interaction/followings", { data: { target_user_id } });
  }
};
