import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { searchApi } from "../api/search";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./PostCard";
import { Post } from "../data/mockData";

type SearchTab = "contents" | "users";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<SearchTab>("contents");

  const {
    data: contentsData,
    fetchNextPage: fetchNextContents,
    hasNextPage: hasNextContents,
    isFetchingNextPage: isFetchingMoreContents,
    status: contentsStatus,
  } = useInfiniteQuery({
    queryKey: ["searchContents", query],
    queryFn: ({ pageParam }) =>
      searchApi.searchContents({ query, cursor: pageParam as string, page_size: 10 }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    enabled: !!query && activeTab === "contents",
  });

  const {
    data: usersData,
    fetchNextPage: fetchNextUsers,
    hasNextPage: hasNextUsers,
    isFetchingNextPage: isFetchingMoreUsers,
    status: usersStatus,
  } = useInfiniteQuery({
    queryKey: ["searchUsers", query],
    queryFn: ({ pageParam }) =>
      searchApi.searchUsers({ query, cursor: pageParam as string, page_size: 10 }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    enabled: !!query && activeTab === "users",
  });

  const { ref: contentsRef, inView: contentsInView } = useInView();
  const { ref: usersRef, inView: usersInView } = useInView();

  if (contentsInView && hasNextContents && !isFetchingMoreContents) {
    fetchNextContents();
  }
  if (usersInView && hasNextUsers && !isFetchingMoreUsers) {
    fetchNextUsers();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex w-full flex-col min-h-screen"
    >
      <div className="mb-6 px-4 py-4 md:px-0">
        <h1 className="text-2xl font-bold text-[#D7DADC]">Search results for "{query}"</h1>
      </div>

      <div className="flex border-b border-[#34444E] mb-6">
        <button
          onClick={() => setActiveTab("contents")}
          className={`px-6 py-3 font-bold transition-colors relative ${
            activeTab === "contents" ? "text-white" : "text-[#82959B] hover:text-[#D7DADC] hover:bg-[#0B1416]"
          }`}
        >
          Posts
          {activeTab === "contents" && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D7DADC] rounded-t-md" layoutId="search-tab-indicator" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-3 font-bold transition-colors relative ${
            activeTab === "users" ? "text-white" : "text-[#82959B] hover:text-[#D7DADC] hover:bg-[#0B1416]"
          }`}
        >
          People
          {activeTab === "users" && (
            <motion.div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D7DADC] rounded-t-md" layoutId="search-tab-indicator" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {activeTab === "contents" && (
            <motion.div
              key="contents"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-4"
            >
              {contentsStatus === "pending" ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#82959B]" />
                </div>
              ) : contentsData?.pages[0].items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#82959B]">
                  <div className="w-48 h-48 mb-6 opacity-30 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#D7DADC]"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="M11 8v6"></path><path d="M8 11h6"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#D7DADC] mb-2">No Posts Found</h3>
                  <p className="text-sm">We couldn't find any content matching "{query}"</p>
                </div>
              ) : (
                <>
                  {contentsData?.pages.map((page, i) =>
                    page.items.map((item) => {
                      const post: Post = {
                        id: item.content_id,
                        subreddit: "search",
                        subredditIcon: item.author_avatar,
                        author: item.author_name,
                        authorId: item.author_id,
                        title: item.title,
                        imageUrl: item.cover_url,
                        upvotes: "0", // Note: The mock does not return these for search, so we set placeholders
                        comments: "0",
                        timeAgo: new Date(item.published_at * 1000).toLocaleDateString(),
                        contentType: item.content_type,
                      };
                      return <PostCard key={post.id} post={post} />;
                    })
                  )}
                  <div ref={contentsRef} className="h-10 w-full flex justify-center py-4">
                    {isFetchingMoreContents && <Loader2 className="h-6 w-6 animate-spin text-[#82959B]" />}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {activeTab === "users" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-4"
            >
              {usersStatus === "pending" ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-[#82959B]" />
                </div>
              ) : usersData?.pages[0].items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#82959B]">
                  <div className="w-48 h-48 mb-6 opacity-30 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-[#D7DADC]"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" x2="19" y1="8" y2="14"></line><line x1="22" x2="16" y1="11" y2="11"></line></svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#D7DADC] mb-2">No Users Found</h3>
                  <p className="text-sm">We couldn't find any user matching "{query}"</p>
                </div>
              ) : (
                <>
                  {usersData?.pages.map((page, i) =>
                    page.items.map((user) => (
                      <Link
                        key={user.user_id}
                        to={`/user/${user.user_id}`}
                        className="flex items-center justify-between p-4 bg-[#0B1416] rounded-xl border border-[#34444E] hover:border-[#82959B] transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.nickname}`}
                            alt={user.nickname}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-[#D7DADC] hover:underline">
                              {user.nickname}
                            </span>
                            {user.bio && (
                              <span className="text-sm text-[#82959B] truncate max-w-[200px] sm:max-w-[400px]">
                                {user.bio}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                  <div ref={usersRef} className="h-10 w-full flex justify-center py-4">
                    {isFetchingMoreUsers && <Loader2 className="h-6 w-6 animate-spin text-[#82959B]" />}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
