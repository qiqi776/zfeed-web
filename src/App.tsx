/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { feedApi } from "./api/feed";
import { Navbar } from "./components/Navbar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { PostCard } from "./components/PostCard";
import { PostDetail } from "./components/PostDetail";
import { Profile } from "./components/Profile";
import { MOckPosts, generateMorePosts, Post } from "./data/mockData";

// Extracted Feed Component
function Feed() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['recommendFeed'],
    queryFn: ({ pageParam }) => feedApi.getRecommendFeed({ cursor: pageParam, page_size: 10 }),
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
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
      <div className="mb-4 flex items-center justify-between rounded-xl px-4 py-2 sm:border sm:border-[#34444E] sm:bg-[#1A282D] sm:px-3 sm:py-3 sm:shadow-sm">
         <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 rounded-full bg-[#2A3C42] px-4 py-1.5 text-sm font-semibold text-[#D7DADC] transition border border-[#34444E]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-1.38 0-2.5-1.12-2.5-2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 0 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5 1.38 0 2.5 1.12 2.5 2.5A2.5 2.5 0 0 1 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5z"/><path d="M12 2v20"/><path d="M21 12H3"/></svg>
              Best
            </button>
            <button className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-[#82959B] transition hover:bg-[#2A3C42] hover:text-[#D7DADC]">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c-1.38 0-2.5-1.12-2.5-2.5a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 0 2.5 2.5c0 1.38-1.12 2.5-2.5 2.5 1.38 0 2.5 1.12 2.5 2.5A2.5 2.5 0 0 1 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5z"/><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/></svg>
              Hot
            </button>
            <button className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-[#82959B] transition hover:bg-[#2A3C42] hover:text-[#D7DADC]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              New
            </button>
            <button className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-[#82959B] transition hover:bg-[#2A3C42] hover:text-[#D7DADC]">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 20V10"/><path d="m18 20-6-10-6 10"/></svg>
               Top
            </button>
         </div>
         
         <button className="hidden items-center gap-1 rounded-full px-2 py-1.5 text-sm font-semibold text-[#82959B] transition hover:bg-[#2A3C42] sm:flex">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
         </button>
      </div>

      {/* Posts Feed */}
      <div className="flex flex-col sm:gap-4 pb-10">
        {status === 'pending' ? (
          <div className="flex w-full items-center justify-center py-6 pb-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        ) : (
          <AnimatePresence>
            {/* Display static mock posts first */}
            {MOckPosts.map((post) => (
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
                    author: item.author_name,
                    title: item.title,
                    imageUrl: item.cover_url,
                    upvotes: item.like_count.toString(),
                    comments: "0",
                    timeAgo: new Date(item.published_at * 1000).toLocaleDateString(),
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
  const post = MOckPosts.find((p) => p.id === id);

  if (!post) return <div className="text-[#D7DADC] p-8 text-center bg-[#1A282D] rounded-xl border border-[#34444E] mb-20">Post not found</div>;

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
          className="flex items-center gap-2 rounded-full bg-[#1A282D] border border-[#34444E] px-4 py-2 text-sm font-bold text-[#D7DADC] transition hover:bg-[#2A3C42]"
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
    <div className="min-h-screen bg-[#0B1416] text-[#D7DADC] font-sans flex flex-col">
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
                  <Route path="/post/:id" element={<PostView />} />
                  <Route path="/user/:username" element={<Profile />} />
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

