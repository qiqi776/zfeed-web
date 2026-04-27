import React from "react";
import { ArrowBigDown, ArrowBigUp, MessageSquare, MoreHorizontal, Share, CornerDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Comment, Post } from "../data/mockData";
import { UserHoverCard } from "./UserHoverCard";

export function PostDetail({ post }: { post: Post }) {
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
                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${post.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="avatar" className="h-full w-full object-cover" />
              )}
              </Link>
              <UserHoverCard username={post.author} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bold text-[#D7DADC] hover:underline cursor-pointer text-sm">
                r/{post.subreddit}
              </span>
              <span className="text-xs text-[#82959B] flex items-center relative group w-max block z-20 pointer-events-auto">
                <Link to={`/user/${post.author}`} className="hover:text-[#D7DADC] hover:underline transition">u/{post.author}</Link> 
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

        <div className="flex items-center gap-2 border-b border-[#34444E] p-3 sm:px-4 sm:py-3">
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

          <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E]">
            <MessageSquare className="h-4 w-4 text-[#82959B]" />
            <span className="text-sm font-bold text-[#D7DADC]">
              {post.comments}
            </span>
          </button>

          <button className="flex h-9 items-center gap-2 rounded-full bg-[#2A3C42] px-3 transition hover:bg-[#34444E]">
            <Share className="h-4 w-4 text-[#82959B]" />
            <span className="hidden text-sm font-bold text-[#D7DADC] sm:block">
              Share
            </span>
          </button>
        </div>
      </article>

      {/* Comment Input */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#34444E] bg-[#1A282D] p-3 shadow-sm">
        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-[#2A3C42]">
           <img src="https://styles.redditmedia.com/t5_snmnv/styles/profileIcon_snoo531ce38f-a9cb-4d39-9ea2-2ea9c6a1bd79-headshot.png?width=256&height=256&crop=256:256,smart&s=47ea200c9f131a4fdbcbbeb2da1d0a51be3b508f" alt="avatar" className="h-full w-full object-cover"/>
        </div>
        <input
          type="text"
          placeholder="Add a comment"
          className="h-10 w-full rounded-full border border-[#34444E] bg-[#2A3C42] px-4 text-sm text-[#D7DADC] transition focus:border-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#D7DADC] placeholder:text-[#82959B]"
        />
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {post.commentList && post.commentList.length > 0 ? (
          post.commentList.map(comment => <CommentThread key={comment.id} comment={comment} />)
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-[#82959B]">
            <MessageSquare className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">No comments yet</p>
            <p className="text-xs opacity-70">Be the first to share what you think!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const CommentThread: React.FC<{ comment: Comment }> = ({ comment }) => {
  return (
    <div className="flex gap-2">
      {/* Left threading line */}
      <div className="flex flex-col items-center">
        <div className="mb-2 h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-[#2A3C42] border border-[#34444E] relative group z-20 pointer-events-auto">
            <Link to={`/user/${comment.author}`}>
              <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author}&backgroundColor=b6e3f4,c0aede,d1d4f9`} className="h-full w-full object-cover" />
            </Link>
            <UserHoverCard username={comment.author} />
        </div>
        <div className="flex-1 w-px bg-[#34444E] my-1 rounded-full group-hover:bg-[#82959B] transition"></div>
      </div>
      
      {/* Comment Content */}
      <div className="flex flex-1 flex-col pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="relative group w-max block z-20 pointer-events-auto">
             <Link to={`/user/${comment.author}`} className="text-xs font-bold text-[#D7DADC] hover:underline">u/{comment.author}</Link>
             <UserHoverCard username={comment.author} />
          </div>
          <span className="text-[10px] text-[#82959B]">— {comment.timeAgo}</span>
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
            {comment.replies.map(reply => (
              <CommentThread key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
