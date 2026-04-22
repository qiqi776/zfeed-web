import { ArrowLeft, Cake, Grid, MessageSquare, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { PostCard } from "./PostCard";
import { MOckPosts, generateMorePosts } from "../data/mockData";
import { useState, useCallback, useRef } from "react";

export function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("POSTS");
  const [posts] = useState(() => [
    ...MOckPosts.slice(0, 2),
    ...generateMorePosts(0, 3).map(p => ({ ...p, author: username || "user" }))
  ]);

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
             <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="User Avatar" className="h-full w-full object-cover" />
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-3 sm:pt-4">
             <button className="rounded-full bg-[#D7DADC] px-4 py-1.5 text-sm font-bold text-[#0B1416] transition hover:bg-white active:scale-95">
               Follow
             </button>
          </div>

          {/* User Info */}
          <div className="mt-2 sm:mt-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#D7DADC]">u/{username}</h1>
            <p className="text-sm text-[#82959B]">Software Engineer | Tech Enthusiast</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#82959B]">
             <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="font-bold text-[#D7DADC]">12.5k</span>
                <span>Karma</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Cake className="h-4 w-4" />
                <span className="font-bold text-[#D7DADC]">Dec 12, 2021</span>
                <span>Cake day</span>
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
        {activeTab === "POSTS" ? (
          <AnimatePresence>
             {posts.map((post) => (
               <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <PostCard post={post} />
               </motion.div>
             ))}
          </AnimatePresence>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-[#82959B] bg-[#1A282D] rounded-xl border border-[#34444E]">
            <Grid className="h-12 w-12 opacity-20 mb-3" />
            <p className="text-sm font-bold">Nothing to see here yet</p>
            <p className="text-xs opacity-70">u/{username} hasn't added anything to {activeTab.toLowerCase()}.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
