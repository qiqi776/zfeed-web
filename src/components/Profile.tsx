import { ArrowLeft, Cake, Grid, Star, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { PostCard } from "./PostCard";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { userApi } from "../api/user";
import { feedApi } from "../api/feed";
import { Post, MOckPosts } from "../data/mockData";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";
import { FollowersListModal } from "./FollowersListModal";
import { EditProfileModal } from "./EditProfileModal";

export function Profile() {
  const { username: userId } = useParams(); // URL param is actually userId
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("POSTS");
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<"followers" | "followings">("followers");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    data: profileResponse,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => userApi.getProfile(userId!),
    enabled: !!userId,
  });

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["userFeed", userId, activeTab],
    queryFn: ({ pageParam }) => {
      if (activeTab === "POSTS") {
        return feedApi.getUserPublishFeed({
          user_id: userId!,
          cursor: pageParam,
          page_size: 10,
        });
      } else if (activeTab === "SAVED") {
        return feedApi.getUserFavoriteFeed({
          user_id: userId!,
          cursor: pageParam,
          page_size: 10,
        });
      }
      return Promise.resolve({ items: [], next_cursor: "", has_more: false });
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage?.has_more ? lastPage.next_cursor : undefined,
    enabled: !!userId && (activeTab === "POSTS" || activeTab === "SAVED"),
  });

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useCallback(
    (node: HTMLDivElement) => {
      if (status === "pending" || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [status, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const followMutation = useMutation({
    mutationFn: (targetId: string) => userApi.followUser(targetId),
    onMutate: async (targetId: string) => {
      await queryClient.cancelQueries({ queryKey: ["userProfile", targetId] });
      await queryClient.cancelQueries({ queryKey: ["userProfile", currentUser?.user_id] });

      const previousProfile = queryClient.getQueryData(["userProfile", targetId]);

      // Optimistically update the target user's profile we are viewing
      queryClient.setQueryData(["userProfile", targetId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          viewer: { ...old.viewer, is_following: true },
          counts: { ...old.counts, follower_count: old.counts.follower_count + 1 },
        };
      });

      // Optimistically update current user's profile (followee_count + 1)
      if (currentUser?.user_id) {
         queryClient.setQueryData(["userProfile", currentUser.user_id], (old: any) => {
           if (!old) return old;
           return {
             ...old,
             counts: { ...old.counts, followee_count: old.counts.followee_count + 1 }
           }
         });
      }

      return { previousProfile };
    },
    onError: (err, targetId, context: any) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["userProfile", targetId], context.previousProfile);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.user_id] });
      toast.error("Failed to follow user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.user_id] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["followings"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
    onSuccess: () => {
      toast.success("Followed user!");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (targetId: string) => userApi.unfollowUser(targetId),
    onMutate: async (targetId: string) => {
      await queryClient.cancelQueries({ queryKey: ["userProfile", targetId] });
      await queryClient.cancelQueries({ queryKey: ["userProfile", currentUser?.user_id] });

      const previousProfile = queryClient.getQueryData(["userProfile", targetId]);

      // Optimistically update the target user's profile
      queryClient.setQueryData(["userProfile", targetId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          viewer: { ...old.viewer, is_following: false },
          counts: { ...old.counts, follower_count: Math.max(0, old.counts.follower_count - 1) },
        };
      });

      // Optimistically update current user's profile
      if (currentUser?.user_id) {
         queryClient.setQueryData(["userProfile", currentUser.user_id], (old: any) => {
           if (!old) return old;
           return {
             ...old,
             counts: { ...old.counts, followee_count: Math.max(0, old.counts.followee_count - 1) }
           }
         });
      }

      return { previousProfile };
    },
    onError: (err, targetId, context: any) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["userProfile", targetId], context.previousProfile);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.user_id] });
      toast.error("Failed to unfollow user");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
      queryClient.invalidateQueries({ queryKey: ["userProfile", currentUser?.user_id] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["followings"] });
      queryClient.invalidateQueries({ queryKey: ["follow"] });
    },
    onSuccess: () => {
      toast.success("Unfollowed user!");
    },
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
      <div className="mb-4 flex flex-col gap-4 px-4 sm:px-0">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-20 w-20 overflow-hidden rounded-full bg-[#1A282D] sm:h-24 sm:w-24 ring-4 ring-[#1A282D]">
            <img
              src={
                profile.avatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.nickname}&backgroundColor=b6e3f4,c0aede,d1d4f9`
              }
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center pt-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#D7DADC]">
              {profile.nickname}
            </h1>
            <p className="text-sm text-[#82959B]">
              u/{profile.user_id.substring(0, 8)}
            </p>
          </div>

          <div className="flex-1" />

          {/* Action Button */}
          {isSelf ? (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="rounded-full px-5 py-1.5 text-sm font-bold transition active:scale-95 bg-[#2A3C42] text-[#D7DADC] hover:bg-[#34444E]"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={handleFollowToggle}
              className={`rounded-full px-5 py-1.5 text-sm font-bold transition active:scale-95 flex items-center gap-2 ${viewer.is_following ? "border border-[#D7DADC] text-[#D7DADC] hover:bg-[#34444E]" : "bg-[#D7DADC] text-[#0B1416] hover:bg-white"}`}
            >
              {viewer.is_following ? "Following" : "+ Follow"}
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-[#D7DADC] max-w-2xl leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 py-2">
          <div className="flex flex-col">
            <span className="text-[#D7DADC] font-bold text-sm">
              {counts.like_received_count}
            </span>
            <span className="text-[#82959B] text-xs">Post Karma</span>
          </div>
          <div
            className="flex flex-col cursor-pointer transition hover:opacity-80"
            onClick={() => {
              setFollowModalType("followings");
              setIsFollowModalOpen(true);
            }}
          >
            <span className="text-[#D7DADC] font-bold text-sm hover:underline">
              {counts.followee_count}
            </span>
            <span className="text-[#82959B] text-xs">Following</span>
          </div>
          <div
            className="flex flex-col cursor-pointer transition hover:opacity-80"
            onClick={() => {
              setFollowModalType("followers");
              setIsFollowModalOpen(true);
            }}
          >
            <span className="text-[#D7DADC] font-bold text-sm hover:underline">
              {counts.follower_count}
            </span>
            <span className="text-[#82959B] text-xs">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#D7DADC] font-bold text-sm">
              Dec 12, 2021
            </span>
            <span className="text-[#82959B] text-xs">Cake day</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 px-4 sm:px-0 border-b border-[#34444E] overflow-x-auto no-scrollbar relative">
        {["POSTS", "COMMENTS", "SAVED"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-1 py-3 font-bold text-sm transition relative ${
              activeTab === tab
                ? "text-[#D7DADC]"
                : "text-[#82959B] hover:bg-[#1A282D]/50 hover:text-[#D7DADC]"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-[#D7DADC] rounded-t-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-4">
        {status === "pending" ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        ) : feedData?.pages[0]?.items?.length ? (
          <AnimatePresence>
            {feedData.pages.map((page, pageIndex) =>
              page.items?.map((item, itemIndex) => {
                const isLastElement =
                  pageIndex === feedData.pages.length - 1 &&
                  itemIndex === page.items.length - 1;
                const post: Post = {
                  id: item.content_id,
                  subreddit: "user",
                  subredditIcon: item.author_avatar,
                  author: item.author_name,
                  authorId: item.author_id,
                  title: item.title,
                  imageUrl: item.cover_url,
                  upvotes: item.like_count.toString(),
                  comments: "0",
                  timeAgo: new Date(
                    item.published_at * 1000,
                  ).toLocaleDateString(),
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
                );
              }),
            )}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-[#82959B] bg-[#1A282D] rounded-xl border border-[#34444E]">
            <Grid className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">Nothing to see here yet</p>
            <p className="text-xs opacity-70">
              u/{profile.nickname} hasn't added anything to{" "}
              {activeTab.toLowerCase()}.
            </p>
          </div>
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center py-6 pb-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
          </div>
        )}
      </div>

      <FollowersListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        userId={userId!}
        type={followModalType}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
      />
    </motion.div>
  );
}
