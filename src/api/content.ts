import { api } from "../lib/axios";

export interface ContentDetail {
  content_id: string;
  content_type: number;
  author_id: string;
  author_name: string;
  author_avatar: string;
  title: string;
  description: string;
  cover_url: string;
  article_content: string;
  video_url: string;
  video_duration: number;
  published_at: number;
  like_count: number;
  favorite_count: number;
  comment_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  is_following_author: boolean;
}

export const contentApi = {
  getDetail: async (content_id: string): Promise<ContentDetail> => {
    return api.post("/content/detail", { content_id });
  }
};
