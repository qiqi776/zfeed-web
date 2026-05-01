import { api } from "../lib/axios";

export interface SearchUserItem {
  user_id: string;
  nickname: string;
  avatar: string;
  bio: string;
  is_following: boolean;
}

export interface SearchContentItem {
  content_id: string;
  content_type: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  cover_url: string;
  published_at: number;
}

export interface SearchUsersParams {
  query: string;
  cursor?: string;
  page_size?: number;
}

export interface SearchUsersResponse {
  items: SearchUserItem[];
  next_cursor: string;
  has_more: boolean;
}

export interface SearchContentsParams {
  query: string;
  cursor?: string;
  page_size?: number;
}

export interface SearchContentsResponse {
  items: SearchContentItem[];
  next_cursor: string;
  has_more: boolean;
}

export const searchApi = {
  searchUsers: async (params: SearchUsersParams): Promise<SearchUsersResponse> => {
    return api.post("/search/users", params);
  },
  searchContents: async (params: SearchContentsParams): Promise<SearchContentsResponse> => {
    return api.post("/search/contents", params);
  },
};
