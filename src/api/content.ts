import { api } from "../lib/axios";
import { normalizeId } from "../lib/ids";

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
  visibility: number;
  description?: string;
}

export interface PublishVideoParams {
  title: string;
  video_url: string;
  cover_url: string;
  visibility: number;
  description?: string;
  duration?: number;
}

interface RawContentDetail extends Omit<ContentDetail, "content_id" | "author_id"> {
  content_id: string | number;
  author_id: string | number;
}

interface RawContentDetailResponse {
  detail: RawContentDetail;
}

interface RawContentMutationResponse {
  content_id: string | number;
}

function normalizeContentDetail(detail: RawContentDetail): ContentDetail {
  return {
    ...detail,
    content_id: normalizeId(detail.content_id),
    author_id: normalizeId(detail.author_id),
  };
}

function normalizeContentMutationResponse(
  data: RawContentMutationResponse,
): { content_id: string } {
  return {
    content_id: normalizeId(data.content_id),
  };
}

export const contentApi = {
  getDetail: async (content_id: string): Promise<ContentDetail> => {
    const response = (await api.post("/content/detail", {
      content_id,
    })) as RawContentDetail | RawContentDetailResponse;
    const detail = "detail" in response ? response.detail : response;
    return normalizeContentDetail(detail);
  },
  publishArticle: async (
    params: PublishArticleParams,
  ): Promise<{ content_id: string }> => {
    const response = (await api.post(
      "/content/article/publish",
      params,
    )) as RawContentMutationResponse;
    return normalizeContentMutationResponse(response);
  },
  publishVideo: async (
    params: PublishVideoParams,
  ): Promise<{ content_id: string }> => {
    const response = (await api.post(
      "/content/video/publish",
      params,
    )) as RawContentMutationResponse;
    return normalizeContentMutationResponse(response);
  },
  editArticle: async (
    content_id: string,
    params: { title?: string; description?: string; cover?: string; content?: string }
  ): Promise<{ content_id: string }> => {
    const response = (await api.put(
      `/content/article/${content_id}`,
      params,
    )) as RawContentMutationResponse;
    return normalizeContentMutationResponse(response);
  },
  editVideo: async (
    content_id: string,
    params: { title?: string; description?: string; video_url?: string; cover_url?: string; duration?: number }
  ): Promise<{ content_id: string }> => {
    const response = (await api.put(
      `/content/video/${content_id}`,
      params,
    )) as RawContentMutationResponse;
    return normalizeContentMutationResponse(response);
  },
  deletePost: async (content_id: string): Promise<void> => {
    return api.delete(`/content/${content_id}`);
  },
};
