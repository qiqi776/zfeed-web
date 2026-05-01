/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { feedApi } from "./api/feed";
import { contentApi } from "./api/content";
import { Navbar } from "./components/Navbar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { PostCard } from "./components/PostCard";
import { PostDetail } from "./components/PostDetail";
import { Profile } from "./components/Profile";
import { CreatePost } from "./components/CreatePost";
import { EditPost } from "./components/EditPost";
import { SearchPage } from "./components/SearchPage";
import { MOckPosts, generateMorePosts, Post } from "./data/mockData";
import { useAuthStore } from "./store/useAuthStore";
import { toast } from "sonner";

// Extracted Feed Component
function Feed() {
  const [feedType, setFeedType] = useState<"recommend" | "follow">("recommend");
  const { user } = useAuthStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['feed', feedType],
    queryFn: ({ pageParam }) => 
      feedType === 'recommend' 
        ? feedApi.getRecommendFeed({ cursor: pageParam as string, page_size: 10 })
        : feedApi.getFollowFeed({ cursor: pageParam as string, page_size: 10 }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: feedType === 'recommend' || !!user, // Only fetch follow feed if user is logged in
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (status === 'pending' || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [status, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full flex-col"
    >
      {/* Sorting Header */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl px-4 py-2 sm:border sm:border-[#34444E] sm:bg-[#0B1416] sm:px-3 sm:py-3 sm:shadow-sm">
         <div className="flex gap-4 border-b border-[#34444E] pb-2 px-1">
            <button 
              onClick={() => setFeedType("recommend")}
              className={`pb-2 text-sm font-bold border-b-2 transition ${feedType === "recommend" ? "border-white text-white" : "border-transparent text-[#82959B] hover:text-[#D7DADC]"}`}
            >
               Recommend
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  toast.error("Please login to view following feed");
                  return;
                }
                setFeedType("follow");
              }}
              className={`pb-2 text-sm font-bold border-b-2 transition ${feedType === "follow" ? "border-white text-white" : "border-transparent text-[#82959B] hover:text-[#D7DADC]"}`}
            >
               Following
            </button>
         </div>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col sm:gap-4 pb-10">
        {status === 'pending' ? (
          <div className="flex w-full items-center justify-center py-6 pb-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        ) : (!user && feedType === 'follow') ? (
          <div className="flex w-full items-center justify-center py-10 pb-20 text-[#82959B]">
            Please login to view following feed.
          </div>
        ) : (
          <AnimatePresence>
            {/* Display static mock posts first only for recommend for now */}
            {feedType === 'recommend' && MOckPosts.map((post) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}

            {/* Display fetched posts if any */}
            {status === 'success' && data.pages.map((page, pageIndex) => 
               page.items?.map((item, itemIndex) => {
                 const isLastElement = pageIndex === data.pages.length - 1 && itemIndex === page.items.length - 1;
                 // adapt item to Post
                 const post: Post = {
                    id: item.content_id, // ensure unique
                    subreddit: "feed",
                    subredditIcon: item.author_avatar,
                    author: item.author_name,
                    authorId: item.author_id,
                    title: item.title,
                    imageUrl: item.cover_url,
                    upvotes: item.like_count.toString(),
                    comments: "0",
                    timeAgo: new Date(item.published_at * 1000).toLocaleDateString(),
                    isLiked: item.is_liked,
                    upvoteCount: item.like_count,
                    contentType: item.content_type,
                 };
                 return (
                  <motion.div
                    ref={isLastElement ? lastPostRef : null}
                    layout
                    key={`${pageIndex}-${item.content_id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                 )
               })
            )}

            {status === 'success' && data.pages[0]?.items?.length === 0 && (
              <div className="flex w-full items-center justify-center py-6 text-[#82959B]">
                 No posts found.
              </div>
            )}
          </AnimatePresence>
        )}
        
        {isFetchingNextPage && (
          <div className="flex w-full items-center justify-center py-6 pb-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Extracted Post View Wrapper
function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const mockPost = MOckPosts.find((p) => p.id === id);

  const { data: serverPost, isLoading, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.getDetail(id!),
    enabled: !mockPost && !!id,
  });

  const post: Post | null = mockPost || (serverPost ? {
    id: serverPost.content_id,
    subreddit: "feed",
    subredditIcon: serverPost.author_avatar,
    author: serverPost.author_name,
    authorId: serverPost.author_id,
    title: serverPost.title,
    content: serverPost.article_content || serverPost.description,
    imageUrl: serverPost.cover_url,
    upvotes: serverPost.like_count.toString(),
    comments: serverPost.comment_count?.toString() || "0",
    timeAgo: new Date(serverPost.published_at * 1000).toLocaleDateString(),
    isLiked: serverPost.is_liked,
    isFavorited: serverPost.is_favorited,
    upvoteCount: serverPost.like_count,
  } : null);

  if (isLoading && !mockPost) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" /></div>;

  if (!post) return <div className="text-[#D7DADC] p-8 text-center bg-[#0B1416] rounded-xl border border-[#34444E] mb-20">Post not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col"
    >
      <div className="mb-4 flex items-center">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-2 rounded-full bg-[#0B1416] border border-[#34444E] px-4 py-2 text-sm font-bold text-[#D7DADC] transition hover:bg-[#2A3C42]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </button>
      </div>
      <PostDetail post={post} />
    </motion.div>
  );
}


export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#000000] text-[#D7DADC] font-sans flex flex-col">
      <Navbar />
      
      <div className="mx-auto flex w-full max-w-[1600px] items-start justify-start flex-1 relative">
        {/* Left Sidebar (Hidden on mobile/tablet) */}
        <LeftSidebar />

        {/* Main Feed Content and Right Sidebar Container */}
        <div className="flex flex-1 justify-center xl:gap-8 px-4 sm:px-6">
          <main className="flex w-full max-w-[750px] flex-col py-4 sm:py-6 lg:mr-6 transition-all">
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <Routes location={location}>
                  <Route path="/" element={<Feed />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/post/:id" element={<PostView />} />
                  <Route path="/post/:id/edit" element={<EditPost />} />
                  <Route path="/user/:username" element={<Profile />} />
                  <Route path="/submit" element={<CreatePost />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Right Sidebar (Hidden on smaller screens) */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

