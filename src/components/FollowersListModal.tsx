import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { Link } from "react-router-dom";

interface FollowersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  type?: "followers" | "followings";
}

export function FollowersListModal({
  isOpen,
  onClose,
  userId,
  type = "followers",
}: FollowersListModalProps) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [type, userId],
      queryFn: ({ pageParam }) =>
        type === "followers"
          ? userApi.getFollowers({
              user_id: userId,
              cursor: pageParam as string,
              page_size: 20,
            })
          : userApi.getFollowings({
              user_id: userId,
              cursor: pageParam as string,
              page_size: 20,
            }),
      initialPageParam: "",
      getNextPageParam: (lastPage) =>
        lastPage.has_more ? lastPage.next_cursor : undefined,
      enabled: isOpen && !!userId,
    });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0B1416] shadow-2xl border border-[#34444E] flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#34444E] px-6 py-4">
            <h2 className="text-xl font-bold text-[#D7DADC]">{type === "followers" ? "Followers" : "Following"}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#82959B] transition hover:bg-[#1A282D] hover:text-[#D7DADC]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
            {status === "pending" ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#82959B]" />
              </div>
            ) : data?.pages[0]?.items?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.pages.map((page, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    {page.items.map((user) => (
                      <div
                        key={user.user_id}
                        className="flex items-center gap-3 bg-[#1A282D] p-3 rounded-xl border border-[#34444E]"
                      >
                        <Link
                          to={`/user/${user.user_id}`}
                          onClick={onClose}
                          className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#0B1416]"
                        >
                          <img
                            src={
                              user.avatar ||
                              `https://api.dicebear.com/7.x/identicon/svg?seed=${user.nickname}`
                            }
                            alt={user.nickname}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="flex-1 overflow-hidden">
                          <Link
                            to={`/user/${user.user_id}`}
                            onClick={onClose}
                            className="block font-bold text-[#D7DADC] truncate hover:underline"
                          >
                            {user.nickname}
                          </Link>
                          {user.bio && (
                            <p className="text-xs text-[#82959B] truncate">
                              {user.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-3 rounded-xl border border-[#34444E] bg-[#1A282D] font-bold text-sm text-[#D7DADC] hover:bg-[#2A3C42] transition"
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                    ) : (
                      "Load More"
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-[#82959B]">
                {type === "followers" ? "No followers yet." : "Not following anyone yet."}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
