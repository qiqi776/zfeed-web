import { api } from "../lib/axios";

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
}

export interface CommentListParams {
  content_id: string;
  scene?: string; // ARTICLE, VIDEO, COMMENT (default ARTICLE)
  cursor?: string;
  page_size?: number;
}

export interface ReplyListParams {
  comment_id: string;
  cursor?: string;
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

export const interactionApi = {
  getComments: async (params: CommentListParams): Promise<CommentListResponse> => {
    return api.post("/interaction/comment/list", params);
  },

  getReplyComments: async (params: ReplyListParams): Promise<CommentListResponse> => {
    return api.post("/interaction/comment/reply/list", params);
  },

  postComment: async (params: PostCommentParams): Promise<PostCommentResponse> => {
    return api.post("/interaction/comment", params);
  }
};
