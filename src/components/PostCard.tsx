import {
  ArrowBigDown,
  ArrowBigUp,
  MessageSquare,
  Share,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "../data/mockData";
import { UserHoverCard } from "./UserHoverCard";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="flex cursor-pointer flex-col bg-[#1A282D] transition sm:rounded-xl sm:border sm:border-[#34444E] hover:border-[#82959B] relative">
      <Link to={`/post/${post.id}`} className="absolute inset-0 z-0"></Link>
      <div className="p-3 sm:px-4 sm:pt-4 z-10 pointer-events-none">
        {/* Post Header */}
        <div className="flex items-center gap-2 text-xs text-[#82959B] pointer-events-auto">
          <div className="relative group z-20 pointer-events-auto block">
            <Link to={`/user/${post.author}`} className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-500 bg-opacity-20 hover:ring-2 hover:ring-[#82959B] cursor-pointer">
              {post.subredditIcon ? (
                <img
                  src={post.subredditIcon}
                  alt={post.subreddit}
                  className="h-full w-full object-cover"
                />
              ) : (
                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt={post.author} className="h-full w-full object-cover" />
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
              <Link to={`/user/${post.author}`} onClick={(e) => e.stopPropagation()} className="opacity-50 hover:opacity-100 hover:text-[#D7DADC] hover:underline transition">u/{post.author}</Link>
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
        <div className="flex items-center rounded-full bg-[#2A3C42]">
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#34444E] active:bg-[#151F23]">
            <ArrowBigUp className="h-5 w-5 text-[#82959B] hover:text-[#FF4500]" />
          </button>
          <span className="min-w-6 text-center text-sm font-bold text-[#D7DADC]">
            {post.upvotes}
          </span>
          <button className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[#34444E] active:bg-[#151F23]">
            <ArrowBigDown className="h-5 w-5 text-[#82959B] hover:text-blue-500" />
          </button>
        </div>

        {/* Comments Oval */}
        <Link to={`/post/${post.id}`} className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E]">
          <MessageSquare className="h-4 w-4 text-[#82959B]" />
          <span className="text-sm font-bold text-[#D7DADC]">
            {post.comments} Comments
          </span>
        </Link>

        {/* Share Oval */}
        <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E]">
          <Share className="h-4 w-4 text-[#82959B]" />
          <span className="hidden text-sm font-bold text-[#D7DADC] sm:block">
            Share
          </span>
        </button>

        <div className="flex-1" />

        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A3C42] transition hover:bg-[#34444E]">
          <MoreHorizontal className="h-5 w-5 text-[#82959B]" />
        </button>
      </div>
    </article>
  );
}
