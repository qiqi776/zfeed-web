import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Share,
  MoreHorizontal,
  Bookmark,
  Trash2,
  Pencil,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type MouseEvent } from "react";
import { Post } from "../data/mockData";
import { UserHoverCard } from "./UserHoverCard";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { interactionApi } from "../api/interaction";
import { contentApi } from "../api/content";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(
    post.upvoteCount || parseInt(post.upvotes) || 0,
  );
  const [isFavorited, setIsFavorited] = useState(post.isFavorited || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
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
    e.stopPropagation();
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

  const deletePostMutation = useMutation({
    mutationFn: () => contentApi.deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userFeed"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast.success("Post deleted");
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate();
    }
  };

  return (
    <article className="flex cursor-pointer flex-col justify-between bg-[#1A282D] transition sm:rounded-xl sm:border sm:border-[#34444E] hover:border-[#82959B] relative h-full">
      <Link to={`/post/${post.id}`} className="absolute inset-0 z-0"></Link>
      <div className="p-3 sm:px-4 sm:pt-4 z-10 pointer-events-none">
        {/* Post Header */}
        <div className="flex items-center gap-2 text-xs text-[#82959B] pointer-events-auto">
          <div className="relative group z-20 pointer-events-auto block">
            <Link
              to={`/user/${post.authorId || post.author}`}
              className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-500 bg-opacity-20 hover:ring-2 hover:ring-[#82959B] cursor-pointer"
            >
              {post.subredditIcon ? (
                <img
                  src={post.subredditIcon}
                  alt={post.subreddit}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt={post.author}
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <UserHoverCard username={post.author} />
          </div>
          <div className="flex items-center gap-1 whitespace-nowrap">
            <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer relative z-10 pointer-events-auto">
              r/{post.subreddit}
            </span>
            <span className="opacity-50">•</span>
            <span className="opacity-50">Posted by </span>
            <div className="relative group z-20 pointer-events-auto block">
              <Link
                to={`/user/${post.authorId || post.author}`}
                onClick={(e) => e.stopPropagation()}
                className="opacity-50 hover:opacity-100 hover:text-[#D7DADC] hover:underline transition"
              >
                u/{post.author}
              </Link>
              <UserHoverCard username={post.author} />
            </div>
            <span className="opacity-50"> {post.timeAgo}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="mt-2">
          <h2 className="text-lg font-bold leading-tight text-[#D7DADC] mb-2 sm:text-xl">
            {post.title}
          </h2>
          {post.content && (
            <p className="mt-2 text-sm text-[#D7DADC] opacity-70 line-clamp-4">
              {post.content}
            </p>
          )}
        </div>
      </div>

      <div>
        {/* Image Content */}
        {post.imageUrl && (
          <div className="mt-2 flex w-full justify-center bg-[#0B1416] overflow-hidden sm:rounded-md max-h-[500px] z-10 pointer-events-none">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="max-h-[500px] object-contain sm:rounded-md pointer-events-auto"
            />
          </div>
        )}

        {/* Post Actions Footer */}
        <div className="flex items-center gap-2 p-3 sm:px-4 sm:pb-4 sm:pt-2 z-10">
          {/* Vote Counter Oval */}
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

          {/* Comments Oval */}
          <Link
            to={`/post/${post.id}`}
            className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto"
          >
            <MessageSquare className="h-4 w-4 text-[#82959B]" />
            <span className="text-sm font-bold text-[#D7DADC]">
              {post.comments} Comments
            </span>
          </Link>

          {/* Share Oval */}
          <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto">
            <Share className="h-4 w-4 text-[#82959B]" />
            <span className="hidden text-sm font-bold text-[#D7DADC] sm:block">
              Share
            </span>
          </button>

          <div className="flex-1" />

          {user &&
            (user.user_id === post.authorId || user.user_id === post.author) &&
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
              <div className="flex items-center gap-2">
                <Link
                  to={`/post/${post.id}/edit`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-9 items-center justify-center rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto text-[#82959B]"
                  title="Edit Post"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
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
              </div>
            ))}

          {/* Save/Favorite */}
          <button
            onClick={handleFavorite}
            className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E] pointer-events-auto"
          >
            <Bookmark
              className={`h-4 w-4 ${isFavorited ? "text-[#D7DADC] fill-[#D7DADC]" : "text-[#82959B]"}`}
            />
          </button>

          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A3C42] transition hover:bg-[#34444E] pointer-events-auto">
            <MoreHorizontal className="h-5 w-5 text-[#82959B]" />
          </button>
        </div>
      </div>
    </article>
  );
}
