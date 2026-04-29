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

export interface PublishArticleParams {
  title: string;
  content: string;
  cover?: string;
  visibility?: number;
  description?: string;
}

export interface PublishVideoParams {
  title: string;
  video_url: string;
  cover_url: string;
  visibility?: number;
  description?: string;
  duration?: number;
}

export const contentApi = {
  getDetail: async (content_id: string): Promise<ContentDetail> => {
    return api.post("/content/detail", { content_id });
  },
  publishArticle: async (
    params: PublishArticleParams,
  ): Promise<{ content_id: string }> => {
    return api.post("/content/article/publish", params);
  },
  publishVideo: async (
    params: PublishVideoParams,
  ): Promise<{ content_id: string }> => {
    return api.post("/content/video/publish", params);
  },
  editArticle: async (
    content_id: string,
    params: { title?: string; description?: string; cover?: string; content?: string }
  ): Promise<{ content_id: string }> => {
    return api.put(`/content/article/${content_id}`, params);
  },
  editVideo: async (
    content_id: string,
    params: { title?: string; description?: string; video_url?: string; cover_url?: string; duration?: number }
  ): Promise<{ content_id: string }> => {
    return api.put(`/content/video/${content_id}`, params);
  },
  deletePost: async (content_id: string): Promise<void> => {
    return api.delete(`/content/${content_id}`);
  },
};
