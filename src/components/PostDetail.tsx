import { useState, type FC, type MouseEvent, type SyntheticEvent } from "react";
import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  MoreHorizontal,
  Share,
  CornerDownRight,
  Loader2,
  Bookmark,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Comment, Post } from "../data/mockData";
import { UserHoverCard } from "./UserHoverCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interactionApi, CommentItem } from "../api/interaction";
import { contentApi } from "../api/content";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

export function PostDetail({ post }: { post: Post }) {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(
    post.upvoteCount || parseInt(post.upvotes) || 0,
  );
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to like posts");
      return;
    }

    try {
      if (isLiked) {
        setIsLiked(false);
        setUpvoteCount((prev) => prev - 1);
        await interactionApi.unlike({ content_id: post.id, scene: "ARTICLE" });
      } else {
        setIsLiked(true);
        if (isDownvoted) {
          setIsDownvoted(false);
          setUpvoteCount((prev) => prev + 2);
        } else {
          setUpvoteCount((prev) => prev + 1);
        }
        await interactionApi.like({ content_id: post.id, scene: "ARTICLE" });
      }
    } catch (err) {
      setIsLiked(!isLiked);
      setUpvoteCount(isLiked ? upvoteCount + 1 : upvoteCount - 1);
      toast.error("Failed to update like status");
    }
  };

  const handleDownvote = (e: MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to downvote");
      return;
    }

    if (isDownvoted) {
      setIsDownvoted(false);
      setUpvoteCount((prev) => prev + 1);
    } else {
      setIsDownvoted(true);
      if (isLiked) {
        setIsLiked(false);
        setUpvoteCount((prev) => prev - 2);
        interactionApi
          .unlike({ content_id: post.id, scene: "ARTICLE" })
          .catch(() => {});
      } else {
        setUpvoteCount((prev) => prev - 1);
      }
    }
  };

  const handleFavorite = async (e: MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to save posts");
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        await interactionApi.unfavorite({
          content_id: post.id,
          scene: "ARTICLE",
        });
        toast.success("Post removed from favorites");
      } else {
        setIsFavorited(true);
        await interactionApi.favorite({
          content_id: post.id,
          scene: "ARTICLE",
        });
        toast.success("Post saved to favorites");
      }
    } catch (err) {
      setIsFavorited(!isFavorited);
      toast.error("Failed to update favorite status");
    }
  };

  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () =>
      interactionApi.getComments({ content_id: post.id, page_size: 50 }),
    enabled: !!post.id,
  });

  const postCommentMutation = useMutation({
    mutationFn: (text: string) =>
      interactionApi.postComment({ content_id: post.id, comment: text }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["comments", post.id] });
      toast.success("Comment posted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to post comment");
    },
  });

  const handlePostComment = (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!commentText.trim()) return;
    postCommentMutation.mutate(commentText);
  };

  const deletePostMutation = useMutation({
    mutationFn: () => contentApi.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Post deleted");
      navigate("/");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDeletePost = (e: MouseEvent) => {
    e.preventDefault();
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate();
    }
  };

  const displayComments = commentsData?.comments || [];

  return (
    <div className="flex w-full flex-col bg-[#0B1416] pb-20">
      {/* Post Main Body - similar to card but expanded, without hover effect */}
      <article className="flex flex-col bg-[#1A282D] sm:rounded-xl sm:border sm:border-[#34444E] mb-4 overflow-hidden">
        <div className="p-3 sm:px-4 sm:pt-4">
          <div className="flex items-center gap-2 text-xs text-[#82959B]">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-500 bg-opacity-20 relative group z-20 pointer-events-auto">
              <Link to={`/user/${post.author}`}>
                {post.subredditIcon ? (
                  <img
                    src={post.subredditIcon}
                    alt={post.subreddit}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                )}
              </Link>
              <UserHoverCard username={post.author} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer text-sm">
                r/{post.subreddit}
              </span>
              <span className="text-xs text-[#82959B] flex items-center relative group w-max block z-20 pointer-events-auto">
                <Link
                  to={`/user/${post.author}`}
                  className="hover:text-[#D7DADC] hover:underline transition"
                >
                  u/{post.author}
                </Link>
                <span className="ml-1">• {post.timeAgo}</span>
                <UserHoverCard username={post.author} />
              </span>
            </div>
          </div>

          <div className="mt-3">
            <h1 className="text-xl font-bold leading-tight text-[#D7DADC] mb-3 sm:text-2xl">
              {post.title}
            </h1>
            {post.content && (
              <p className="mt-2 text-[15px] leading-relaxed text-[#D7DADC] opacity-80 whitespace-pre-line">
                {post.content}
              </p>
            )}
          </div>
        </div>

        {post.imageUrl && (
          <div className="mt-3 flex w-full justify-center bg-[#0B1416]">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="max-h-[700px] object-contain"
            />
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-[#34444E] p-3 sm:px-4 sm:py-3 cursor-pointer pointer-events-none">
          <div className="flex items-center rounded-full bg-[#2A3C42] pointer-events-auto">
            <button
              onClick={handleLike}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#34444E] active:bg-[#151F23] ${isLiked ? "text-[#FF4500]" : "text-[#82959B]"}`}
            >
              <ArrowBigUp
                className={`h-5 w-5 ${isLiked ? "text-[#FF4500] fill-[#FF4500]" : "hover:text-[#FF4500]"}`}
              />
            </button>
            <span
              className={`min-w-6 text-center text-sm font-bold ${isLiked ? "text-[#FF4500]" : isDownvoted ? "text-[#7193FF]" : "text-[#D7DADC]"}`}
            >
              {upvoteCount > 1000
                ? (upvoteCount / 1000).toFixed(1) + "k"
                : upvoteCount}
            </span>
            <button
              onClick={handleDownvote}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#34444E] active:bg-[#151F23] ${isDownvoted ? "text-[#7193FF]" : "text-[#82959B]"}`}
            >
              <ArrowBigDown
                className={`h-5 w-5 ${isDownvoted ? "text-[#7193FF] fill-[#7193FF]" : "hover:text-[#7193FF]"}`}
              />
            </button>
          </div>

          <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto">
            <MessageSquare className="h-4 w-4 text-[#82959B]" />
            <span className="text-sm font-bold text-[#D7DADC]">
              {post.comments}
            </span>
          </button>

          <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto">
            <Share className="h-4 w-4 text-[#82959B]" />
            <span className="hidden text-sm font-bold text-[#D7DADC] sm:block">
              Share
            </span>
          </button>

          <div className="flex-1" />

          {user &&
            user.user_id === post.author &&
            (showDeleteConfirm ? (
              <div className="flex items-center gap-1 z-20 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deletePostMutation.mutate();
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deletePostMutation.isPending}
                  className="flex h-9 items-center justify-center rounded-full bg-red-500/20 px-3 transition hover:bg-red-500/30 text-red-500 text-xs font-bold"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex h-9 items-center justify-center rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] text-[#82959B] text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="flex h-9 items-center justify-center rounded-full bg-[#2A3C42] px-3 transition hover:bg-red-900/30 hover:text-red-500 pointer-events-auto text-[#82959B]"
                title="Delete Post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ))}

          <button
            onClick={handleFavorite}
            className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto"
          >
            <Bookmark
              className={`h-4 w-4 ${isFavorited ? "text-[#D7DADC] fill-[#D7DADC]" : "text-[#82959B]"}`}
            />
          </button>
        </div>
      </article>

      {/* Comment Input */}
      <form
        onSubmit={handlePostComment}
        className="mb-6 flex items-center gap-3 rounded-xl border border-[#34444E] bg-[#1A282D] p-3 shadow-sm"
      >
        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[#2A3C42]">
          {user ? (
            <img
              src={
                user.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${user.nickname}&backgroundColor=b6e3f4`
              }
              alt="avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src="https://api.dicebear.com/7.x/identicon/svg?seed=guest&backgroundColor=b6e3f4"
              alt="avatar"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment"
          disabled={postCommentMutation.isPending}
          className="h-10 w-full rounded-full border border-[#34444E] bg-[#2A3C42] px-4 text-sm text-[#D7DADC] transition focus:border-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#D7DADC] placeholder:text-[#82959B] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!commentText.trim() || postCommentMutation.isPending}
          className="rounded-full bg-[#D7DADC] px-4 py-2 font-bold text-[#1A282D] transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
        >
          {postCommentMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Comment"
          )}
        </button>
      </form>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {commentsLoading ? (
          <div className="flex w-full items-center justify-center flex-col p-8 text-[#82959B] gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm font-bold">Loading comments...</p>
          </div>
        ) : displayComments.length > 0 ? (
          displayComments.map((comment) => (
            <RealCommentThread
              key={comment.comment_id}
              comment={comment}
              post_id={post.id}
            />
          ))
        ) : post.commentList && post.commentList.length > 0 ? (
          // fallback to mock comments if api returns empty but we have mock ones
          post.commentList.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-[#82959B]">
            <MessageSquare className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">No comments yet</p>
            <p className="text-xs opacity-70">
              Be the first to share what you think!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const RealCommentThread: FC<{
  comment: CommentItem;
  post_id: string;
  parent_id?: string;
}> = ({ comment, post_id, parent_id }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // local state for like
  const [isLiked, setIsLiked] = useState(comment.is_liked || false);
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (isLiked) {
        await interactionApi.unlike({
          content_id: comment.comment_id,
          scene: "COMMENT",
        });
      } else {
        await interactionApi.like({
          content_id: comment.comment_id,
          scene: "COMMENT",
        });
      }
    } catch (err) {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
      toast.error("Failed to update like status");
    }
  };

  const isRoot = !parent_id;
  const actualRootId = parent_id || comment.comment_id;

  const { data: repliesData } = useQuery({
    queryKey: ["replies", actualRootId],
    queryFn: () =>
      interactionApi.getReplyComments({
        comment_id: actualRootId,
        page_size: 50,
      }),
    enabled: isRoot && comment.reply_count > 0,
  });

  const replyCommentMutation = useMutation({
    mutationFn: (text: string) =>
      interactionApi.postComment({
        content_id: post_id,
        comment: text,
        parent_id: comment.comment_id,
        root_id: actualRootId,
        reply_to_user_id: comment.user_id,
      }),
    onSuccess: () => {
      setReplyText("");
      setIsReplying(false);
      queryClient.invalidateQueries({ queryKey: ["replies", actualRootId] });
      queryClient.invalidateQueries({ queryKey: ["comments", post_id] });
      toast.success("Reply posted!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to post reply");
    },
  });

  const handleReply = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to reply");
      return;
    }
    if (!replyText.trim()) return;
    replyCommentMutation.mutate(replyText);
  };

  const deleteCommentMutation = useMutation({
    mutationFn: () =>
      interactionApi.deleteComment({
        comment_id: comment.comment_id,
        content_id: post_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", actualRootId] });
      queryClient.invalidateQueries({ queryKey: ["comments", post_id] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="mb-2 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-[#2A3C42] border border-[#34444E] relative group z-20 pointer-events-auto">
          <Link to={`/user/${comment.user_name || "unknown"}`}>
            <img
              src={
                comment.user_avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.user_name}&backgroundColor=b6e3f4`
              }
              className="h-full w-full object-cover"
            />
          </Link>
          <UserHoverCard username={comment.user_name || "unknown"} />
        </div>
        {isRoot && repliesData?.comments && repliesData.comments.length > 0 && (
          <div className="flex-1 w-px bg-[#34444E] my-1 rounded-full group-hover:bg-[#82959B] transition"></div>
        )}
      </div>

      <div className="flex flex-1 flex-col pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative group w-max block z-20 pointer-events-auto">
            <Link
              to={`/user/${comment.user_name || "unknown"}`}
              className="text-xs font-bold text-[#D7DADC] hover:underline"
            >
              {comment.user_name || "Unknown User"}
            </Link>
            <UserHoverCard username={comment.user_name || "unknown"} />
          </div>
          <span className="text-[10px] text-[#82959B]">
            — {new Date(comment.created_at * 1000).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-[#D7DADC] opacity-80 mb-2 leading-relaxed">
          {comment.reply_to_user_id && !isRoot && (
            <span className="text-blue-400 mr-2">
              @{comment.reply_to_user_id}
            </span>
          )}
          {comment.comment}
        </p>

        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            <button
              onClick={handleLike}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42] ${isLiked ? "text-[#FF4500]" : "text-[#82959B]"}`}
            >
              <ArrowBigUp
                className={`h-4 w-4 ${isLiked ? "text-[#FF4500] fill-[#FF4500]" : "hover:text-[#FF4500]"}`}
              />
            </button>
            <span
              className={`min-w-4 text-center text-xs font-bold ${isLiked ? "text-[#FF4500]" : "text-[#82959B]"}`}
            >
              {likeCount > 0 ? likeCount : ""}
            </span>
            <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42]">
              <ArrowBigDown className="h-4 w-4 text-[#82959B] hover:text-blue-500" />
            </button>
          </div>
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex h-7 items-center gap-1.5 rounded-full px-2 transition hover:bg-[#2A3C42]"
          >
            <MessageSquare className="h-3 w-3 text-[#82959B]" />
            <span className="text-xs font-bold text-[#82959B]">Reply</span>
          </button>
          <button className="flex h-7 items-center gap-1.5 rounded-full px-2 transition hover:bg-[#2A3C42]">
            <Share className="h-3 w-3 text-[#82959B]" />
            <span className="text-xs font-bold text-[#82959B]">Share</span>
          </button>

          {user &&
            user.user_id === comment.user_id &&
            (showDeleteConfirm ? (
              <div className="flex items-center gap-1 z-20 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteCommentMutation.mutate();
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleteCommentMutation.isPending}
                  className="flex h-7 items-center justify-center rounded-full bg-red-500/20 px-2 transition hover:bg-red-500/30 text-red-500 text-xs font-bold"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Confirm
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex h-7 items-center justify-center rounded-full bg-[#2A3C42] px-2 transition hover:bg-[#34444E] text-[#82959B] text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="flex h-7 items-center gap-1.5 rounded-full px-2 transition hover:bg-red-900/30 hover:text-red-500 text-[#82959B]"
                title="Delete Comment"
              >
                <Trash2 className="h-3 w-3" />
                <span className="text-xs font-bold">Delete</span>
              </button>
            ))}

          <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42]">
            <MoreHorizontal className="h-4 w-4 text-[#82959B]" />
          </button>
        </div>

        {isReplying && (
          <form onSubmit={handleReply} className="mb-4 flex items-start gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              placeholder={`Reply to ${comment.user_name || "user"}`}
              className="flex-1 rounded-lg border border-[#34444E] bg-[#2A3C42] px-3 py-1.5 text-sm text-[#D7DADC] transition focus:border-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#D7DADC] disabled:opacity-50"
              disabled={replyCommentMutation.isPending}
            />
            <button
              type="submit"
              disabled={!replyText.trim() || replyCommentMutation.isPending}
              className="rounded-lg bg-[#D7DADC] px-3 py-1.5 text-sm font-bold text-[#1A282D] transition hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replyCommentMutation.isPending ? "..." : "Reply"}
            </button>
          </form>
        )}

        {isRoot && repliesData?.comments && repliesData.comments.length > 0 && (
          <div className="flex flex-col mt-1">
            {repliesData.comments.map((reply) => (
              <RealCommentThread
                key={reply.comment_id}
                comment={reply}
                post_id={post_id}
                parent_id={actualRootId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentThread: FC<{ comment: Comment }> = ({ comment }) => {
  return (
    <div className="flex gap-2">
      {/* Left threading line */}
      <div className="flex flex-col items-center">
        <div className="mb-2 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-[#2A3C42] border border-[#34444E] relative group z-20 pointer-events-auto">
          <Link to={`/user/${comment.author}`}>
            <img
              src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
              className="h-full w-full object-cover"
              alt="avatar"
            />
          </Link>
          <UserHoverCard username={comment.author} />
        </div>
        <div className="flex-1 w-px bg-[#34444E] my-1 rounded-full group-hover:bg-[#82959B] transition"></div>
      </div>

      {/* Comment Content */}
      <div className="flex flex-1 flex-col pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative group w-max block z-20 pointer-events-auto">
            <Link
              to={`/user/${comment.author}`}
              className="text-xs font-bold text-[#D7DADC] hover:underline"
            >
              u/{comment.author}
            </Link>
            <UserHoverCard username={comment.author} />
          </div>
          <span className="text-[10px] text-[#82959B]">
            — {comment.timeAgo}
          </span>
        </div>
        <p className="text-sm text-[#D7DADC] opacity-80 mb-2 leading-relaxed">
          {comment.content}
        </p>

        {/* Comment Actions */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42]">
              <ArrowBigUp className="h-4 w-4 text-[#82959B] hover:text-[#FF4500]" />
            </button>
            <span className="min-w-4 text-center text-xs font-bold text-[#82959B]">
              {comment.upvotes}
            </span>
            <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42]">
              <ArrowBigDown className="h-4 w-4 text-[#82959B] hover:text-blue-500" />
            </button>
          </div>
          <button className="flex h-7 items-center gap-1.5 rounded-full px-2 transition hover:bg-[#2A3C42]">
            <MessageSquare className="h-3 w-3 text-[#82959B]" />
            <span className="text-xs font-bold text-[#82959B]">Reply</span>
          </button>
          <button className="flex h-7 items-center gap-1.5 rounded-full px-2 transition hover:bg-[#2A3C42]">
            <Share className="h-3 w-3 text-[#82959B]" />
            <span className="text-xs font-bold text-[#82959B]">Share</span>
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-[#2A3C42]">
            <MoreHorizontal className="h-4 w-4 text-[#82959B]" />
          </button>
        </div>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="flex flex-col mt-1">
            {comment.replies.map((reply) => (
              <CommentThread key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
