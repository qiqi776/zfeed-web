import { api } from "../lib/axios";
import { normalizeId } from "../lib/ids";

export interface CommentItem {
  comment_id: string;
  content_id: string;
  user_id: string;
  reply_to_user_id?: string;
  parent_id?: string;
  root_id?: string;
  comment: string;
  created_at: number;
  status: number;
  user_name: string;
  user_avatar: string;
  reply_count: number;
  like_count?: number;
  is_liked?: boolean;
}

export interface CommentListParams {
  content_id: string;
  scene: string;
  cursor?: string | number;
  page_size?: number;
}

export interface ReplyListParams {
  comment_id: string;
  cursor?: string | number;
  page_size?: number;
}

export interface CommentListResponse {
  comments: CommentItem[];
  next_cursor: string;
  has_more: boolean;
}

export interface PostCommentParams {
  content_id: string;
  content_user_id?: string;
  scene?: string;
  comment: string;
  parent_id?: string;
  root_id?: string;
  reply_to_user_id?: string;
}

export interface PostCommentResponse {
  comment_id: string;
}

export interface InteractionParams {
  content_id: string;
  scene?: string; // e.g. ARTICLE
  content_user_id?: string;
}

export interface DeleteCommentParams {
  comment_id: string;
  content_id: string;
  scene?: string;
  root_id?: string;
  parent_id?: string;
}

interface RawCommentItem
  extends Omit<
    CommentItem,
    "comment_id" | "content_id" | "user_id" | "reply_to_user_id" | "parent_id" | "root_id"
  > {
  comment_id: string | number;
  content_id: string | number;
  user_id: string | number;
  reply_to_user_id?: string | number;
  parent_id?: string | number;
  root_id?: string | number;
}

interface RawCommentListResponse {
  comments: RawCommentItem[];
  next_cursor: string | number;
  has_more: boolean;
}

interface RawPostCommentResponse {
  comment_id: string | number;
}

function normalizeCommentItem(item: RawCommentItem): CommentItem {
  return {
    ...item,
    comment_id: normalizeId(item.comment_id),
    content_id: normalizeId(item.content_id),
    user_id: normalizeId(item.user_id),
    reply_to_user_id: item.reply_to_user_id
      ? normalizeId(item.reply_to_user_id)
      : undefined,
    parent_id: item.parent_id ? normalizeId(item.parent_id) : undefined,
    root_id: item.root_id ? normalizeId(item.root_id) : undefined,
  };
}

function normalizeCommentListResponse(
  data: RawCommentListResponse,
): CommentListResponse {
  return {
    comments: data.comments.map(normalizeCommentItem),
    next_cursor: normalizeId(data.next_cursor),
    has_more: data.has_more,
  };
}

export const interactionApi = {
  getComments: async (params: CommentListParams): Promise<CommentListResponse> => {
    const response = (await api.post("/interaction/comment/list", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? 0 : Number(params.cursor),
      page_size: params.page_size ?? 50,
    })) as RawCommentListResponse;
    return normalizeCommentListResponse(response);
  },

  getReplyComments: async (params: ReplyListParams): Promise<CommentListResponse> => {
    const response = (await api.post("/interaction/comment/reply/list", {
      ...params,
      cursor:
        params.cursor === undefined || params.cursor === "" ? 0 : Number(params.cursor),
      page_size: params.page_size ?? 50,
    })) as RawCommentListResponse;
    return normalizeCommentListResponse(response);
  },

  postComment: async (params: PostCommentParams): Promise<PostCommentResponse> => {
    const response = (await api.post(
      "/interaction/comment",
      params,
    )) as RawPostCommentResponse;
    return {
      comment_id: normalizeId(response.comment_id),
    };
  },

  like: async (params: InteractionParams) => {
    return api.post("/interaction/like", params);
  },

  unlike: async (params: InteractionParams) => {
    return api.post("/interaction/unlike", params);
  },

  favorite: async (params: InteractionParams) => {
    return api.post("/interaction/favorite", params);
  },

  unfavorite: async (params: InteractionParams) => {
    return api.delete("/interaction/favorite", { data: params });
  },

  deleteComment: async (params: DeleteCommentParams): Promise<void> => {
    return api.delete("/interaction/comment", { data: params });
  }
};
