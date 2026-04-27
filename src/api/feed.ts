import { api } from "../lib/axios";

export interface FeedItem {
  content_id: string;
  content_type: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  cover_url: string;
  published_at: number;
  is_liked: boolean;
  like_count: number;
}

export interface RecommendFeedParams {
  cursor?: string;
  page_size?: number;
  snapshot_id?: string;
}

export interface RecommendFeedResponse {
  items: FeedItem[];
  next_cursor: string;
  has_more: boolean;
  snapshot_id?: string;
}

export const feedApi = {
  getRecommendFeed: async (params: RecommendFeedParams): Promise<RecommendFeedResponse> => {
    return api.post("/feed/recommend", params);
  }
};
