import { api } from "../lib/axios";
import { normalizeId } from "../lib/ids";

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

export interface FollowListItem {
  user_id: string;
  nickname: string;
  avatar: string;
  bio: string;
  is_following: boolean;
}

export interface FollowListResponse {
  items: FollowListItem[];
  next_cursor: string;
  has_more: boolean;
}

interface RawUserProfileResponse extends Omit<UserProfileResponse, "user_profile"> {
  user_profile: Omit<UserProfileResponse["user_profile"], "user_id"> & {
    user_id: string | number;
  };
}

interface UpdateProfileResponse {
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
}

interface RawUpdateProfileResponse extends Omit<UpdateProfileResponse, "user_info"> {
  user_info: Omit<UpdateProfileResponse["user_info"], "user_id"> & {
    user_id: string | number;
  };
}

interface RawFollowListItem extends Omit<FollowListItem, "user_id"> {
  user_id: string | number;
}

interface RawFollowListResponse {
  items: RawFollowListItem[];
  next_cursor: string | number;
  has_more: boolean;
}

export const userApi = {
  getProfile: async (userId: string): Promise<UserProfileResponse> => {
    const data = (await api.get(
      `/user/profile/${userId}`,
    )) as RawUserProfileResponse;
    return {
      ...data,
      user_profile: {
        ...data.user_profile,
        user_id: normalizeId(data.user_profile.user_id),
      },
    };
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
  }): Promise<UpdateProfileResponse> => {
    const response = (await api.put(
      "/users/me/profile",
      data,
    )) as RawUpdateProfileResponse;

    return {
      ...response,
      user_info: {
        ...response.user_info,
        user_id: normalizeId(response.user_info.user_id),
      },
    };
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

  getFollowings: async (params: {
    user_id: string;
    cursor?: string | number;
    page_size?: number;
  }): Promise<FollowListResponse> => {
    const response = (await api.post("/user/followings", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? undefined : Number(params.cursor),
    })) as RawFollowListResponse;

    return {
      items: response.items.map((item) => ({
        ...item,
        user_id: normalizeId(item.user_id),
      })),
      next_cursor: normalizeId(response.next_cursor),
      has_more: response.has_more,
    };
  },

  getFollowers: async (params: {
    user_id: string;
    cursor?: string | number;
    page_size?: number;
  }): Promise<FollowListResponse> => {
    const response = (await api.post("/user/followers", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? undefined : Number(params.cursor),
    })) as RawFollowListResponse;

    return {
      items: response.items.map((item) => ({
        ...item,
        user_id: normalizeId(item.user_id),
      })),
      next_cursor: normalizeId(response.next_cursor),
      has_more: response.has_more,
    };
  },
};
