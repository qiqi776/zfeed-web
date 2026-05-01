import { api } from "../lib/axios";
import { normalizeId } from "../lib/ids";

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

interface RawSearchUserItem extends Omit<SearchUserItem, "user_id"> {
  user_id: string | number;
}

interface RawSearchContentItem
  extends Omit<SearchContentItem, "content_id" | "author_id"> {
  content_id: string | number;
  author_id: string | number;
}

interface RawSearchUsersResponse {
  items: RawSearchUserItem[];
  next_cursor: string | number;
  has_more: boolean;
}

interface RawSearchContentsResponse {
  items: RawSearchContentItem[];
  next_cursor: string | number;
  has_more: boolean;
}

export const searchApi = {
  searchUsers: async (params: SearchUsersParams): Promise<SearchUsersResponse> => {
    const response = (await api.post("/search/users", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? undefined : Number(params.cursor),
    })) as RawSearchUsersResponse;

    return {
      items: response.items.map((item) => ({
        ...item,
        user_id: normalizeId(item.user_id),
      })),
      next_cursor: normalizeId(response.next_cursor),
      has_more: response.has_more,
    };
  },
  searchContents: async (params: SearchContentsParams): Promise<SearchContentsResponse> => {
    const response = (await api.post("/search/contents", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? undefined : Number(params.cursor),
    })) as RawSearchContentsResponse;

    return {
      items: response.items.map((item) => ({
        ...item,
        content_id: normalizeId(item.content_id),
        author_id: normalizeId(item.author_id),
      })),
      next_cursor: normalizeId(response.next_cursor),
      has_more: response.has_more,
    };
  },
};
