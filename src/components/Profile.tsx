import { ArrowLeft, Cake, Grid, Star, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { PostCard } from "./PostCard";
import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { feedApi } from "../api/feed";
import { Post, MOckPosts } from "../data/mockData";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

export function Profile() {
  const { username: userId } = useParams(); // URL param is actually userId
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("POSTS");

  const { data: profileResponse, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => userApi.getProfile(userId!),
    enabled: !!userId,
  });

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  } = useInfiniteQuery({
    queryKey: ['userFeed', userId, activeTab],
    queryFn: ({ pageParam }) => {
      if (activeTab === "POSTS") {
        return feedApi.getUserPublishFeed({ user_id: userId!, cursor: pageParam, page_size: 10 });
      } else if (activeTab === "SAVED") {
        return feedApi.getUserFavoriteFeed({ user_id: userId!, cursor: pageParam, page_size: 10 });
      }
      return Promise.resolve({ items: [], next_cursor: '', has_more: false });
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage?.has_more ? lastPage.next_cursor : undefined,
    enabled: !!userId && (activeTab === "POSTS" || activeTab === "SAVED"),
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

  const followMutation = useMutation({
    mutationFn: (targetId: string) => userApi.followUser(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      toast.success("Followed user!");
    },
    onError: () => toast.error("Failed to follow user"),
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetId: string) => userApi.unfollowUser(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      toast.success("Unfollowed user!");
    },
    onError: () => toast.error("Failed to unfollow user"),
  });

  const handleFollowToggle = () => {
    if (!currentUser) {
      toast.error("Please log in to follow");
      return;
    }
    if (!profileResponse) return;
    
    if (profileResponse.viewer.is_following) {
      unfollowMutation.mutate(userId!);
    } else {
      followMutation.mutate(userId!);
    }
  };

  if (profileLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center py-20"
      >
        <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
      </motion.div>
    );
  }

  if (!profileResponse) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="text-center py-20 text-[#82959B]"
      >
        User not found
      </motion.div>
    );
  }

  const { user_profile: profile, counts, viewer } = profileResponse;
  const isSelf = currentUser?.user_id === profile.user_id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex w-full flex-col pb-20"
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

      {/* Profile Header Card */}
      <div className="overflow-hidden rounded-xl border border-[#34444E] bg-[#1A282D] mb-4">
        {/* Banner Area */}
        <div className="h-24 sm:h-32 w-full bg-gradient-to-r from-indigo-900 via-purple-900 to-[#1A282D]"></div>
        
        <div className="px-4 pb-4 sm:px-6 relative">
          {/* Avatar */}
          <div className="absolute -top-10 sm:-top-12 h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-[#1A282D] bg-[#2A3C42]">
             <img src={profile.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.nickname}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="User Avatar" className="h-full w-full object-cover" />
          </div>

          {/* Action Button */}
          {!isSelf && (
            <div className="flex justify-end pt-3 sm:pt-4">
              <button 
                onClick={handleFollowToggle}
                disabled={followMutation.isPending || unfollowMutation.isPending}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition active:scale-95 disabled:opacity-50 ${viewer.is_following ? 'border border-[#D7DADC] text-[#D7DADC] hover:bg-[#34444E]' : 'bg-[#D7DADC] text-[#0B1416] hover:bg-white'}`}
              >
                {viewer.is_following ? "Following" : "Follow"}
              </button>
            </div>
          )}
          {isSelf && (
            <div className="flex justify-end pt-3 sm:pt-4 h-[36px]"></div>
          )}

          {/* User Info */}
          <div className="mt-2 sm:mt-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#D7DADC]">{profile.nickname}</h1>
            <p className="text-sm text-[#82959B]">u/{profile.user_id.substring(0, 8)}</p>
            {profile.bio && <p className="text-sm text-[#D7DADC] opacity-80 mt-2">{profile.bio}</p>}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#82959B]">
             <div className="flex items-center gap-1.5 hover:text-[#D7DADC] transition cursor-pointer">
                <span className="font-bold text-[#D7DADC]">{counts.follower_count}</span>
                <span>Followers</span>
             </div>
             <div className="flex items-center gap-1.5 hover:text-[#D7DADC] transition cursor-pointer">
                <span className="font-bold text-[#D7DADC]">{counts.followee_count}</span>
                <span>Following</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-[#D7DADC]">{counts.like_received_count}</span>
                <span>Likes</span>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-[#34444E] pb-2 overflow-x-auto no-scrollbar">
        {["POSTS", "COMMENTS", "SAVED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 font-bold text-sm transition rounded-full ${
              activeTab === tab
                ? "bg-[#2A3C42] text-[#D7DADC]"
                : "text-[#82959B] hover:bg-[#1A282D] hover:text-[#D7DADC]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4">
        {status === 'pending' ? (
           <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" /></div>
        ) : feedData?.pages[0]?.items?.length ? (
          <AnimatePresence>
            {feedData.pages.map((page, pageIndex) => 
               page.items?.map((item, itemIndex) => {
                 const isLastElement = pageIndex === feedData.pages.length - 1 && itemIndex === page.items.length - 1;
                 const post: Post = {
                    id: item.content_id, 
                    subreddit: "user",
                    author: item.author_name,
                    authorId: item.author_id,
                    title: item.title,
                    imageUrl: item.cover_url,
                    upvotes: item.like_count.toString(),
                    comments: "0",
                    timeAgo: new Date(item.published_at * 1000).toLocaleDateString(),
                    isLiked: item.is_liked,
                    upvoteCount: item.like_count,
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
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-[#82959B] bg-[#1A282D] rounded-xl border border-[#34444E]">
            <Grid className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">Nothing to see here yet</p>
            <p className="text-xs opacity-70">u/{profile.nickname} hasn't added anything to {activeTab.toLowerCase()}.</p>
          </div>
        )}
        
        {isFetchingNextPage && (
          <div className="flex justify-center py-6 pb-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
