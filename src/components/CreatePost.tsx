import { useState, type SyntheticEvent } from "react";
import { ArrowLeft, Image as ImageIcon, Video, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "../api/content";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";

export function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [postType, setPostType] = useState<"article" | "video">("article");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const publishArticleMutation = useMutation({
    mutationFn: () => contentApi.publishArticle({
      title,
      content,
      cover: coverUrl || undefined,
    }),
    onSuccess: (data) => {
      toast.success("Article published successfully!");
      queryClient.invalidateQueries({ queryKey: ['recommendFeed'] });
      if (user) {
         queryClient.invalidateQueries({ queryKey: ['userFeed', user.user_id] });
      }
      navigate(`/post/${data.content_id}`);
    },
    onError: () => {
      toast.error("Failed to publish article.");
    }
  });

  const publishVideoMutation = useMutation({
    mutationFn: () => contentApi.publishVideo({
      title,
      video_url: videoUrl,
      cover_url: coverUrl || "",
    }),
    onSuccess: (data) => {
      toast.success("Video published successfully!");
      queryClient.invalidateQueries({ queryKey: ['recommendFeed'] });
      if (user) {
         queryClient.invalidateQueries({ queryKey: ['userFeed', user.user_id] });
      }
      navigate(`/post/${data.content_id}`);
    },
    onError: () => {
      toast.error("Failed to publish video.");
    }
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (postType === "article") {
      publishArticleMutation.mutate();
    } else {
      if (!videoUrl.trim()) {
        toast.error("Video URL is required");
        return;
      }
      if (!/^https?:\/\//i.test(videoUrl.trim())) {
         toast.error("Please enter a valid video URL (http:// or https://)");
         return;
      }
      // Simple regex to check for common video extensions at the end of the pathname
      try {
         const urlObj = new URL(videoUrl.trim());
         if (!/\.(mp4|webm|ogg|mov|mkv|m3u8)$/i.test(urlObj.pathname)) {
            toast.error("URL must point to a valid video file (.mp4, .webm, etc.)");
            return;
         }
      } catch (e) {
         toast.error("Invalid URL format");
         return;
      }
      
      if (!coverUrl.trim()) {
        toast.error("Cover Image URL is required for videos");
        return;
      }
      publishVideoMutation.mutate();
    }
  };

  const isPending = publishArticleMutation.isPending || publishVideoMutation.isPending;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex w-full flex-col max-w-3xl mx-auto xl:ml-0 pb-10"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <button 
             onClick={() => navigate(-1)} 
             className="flex items-center gap-2 rounded-full bg-[#1A282D] border border-[#34444E] px-4 py-2 text-sm font-bold text-[#D7DADC] transition hover:bg-[#2A3C42]"
           >
             <ArrowLeft className="h-4 w-4" />
             Back
           </button>
           <h1 className="text-xl font-bold text-[#D7DADC] ml-2">Create a post</h1>
        </div>
      </div>

      <div className="bg-[#1A282D] rounded-xl border border-[#34444E] overflow-hidden">
        {/* Post Type Selector */}
        <div className="flex border-b border-[#34444E]">
          <button
            type="button"
            onClick={() => setPostType("article")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition relative ${postType === "article" ? "text-white" : "text-[#82959B] hover:bg-[#2A3C42]"}`}
          >
            <FileText className="w-5 h-5" />
            Post
            {postType === "article" && (
              <motion.div layoutId="create_post_tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setPostType("video")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition relative ${postType === "video" ? "text-white" : "text-[#82959B] hover:bg-[#2A3C42]"}`}
          >
            <Video className="w-5 h-5" />
            Video
            {postType === "video" && (
              <motion.div layoutId="create_post_tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4">
          
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#82959B]"
            maxLength={300}
          />
          
          <AnimatePresence mode="popLayout">
            {postType === "article" ? (
              <motion.div
                key="article"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-2"
              >
                <textarea
                  placeholder="Text (optional)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] min-h-[200px] focus:outline-none focus:ring-1 focus:ring-[#82959B] resize-y"
                />
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-2"
              >
                <input
                  type="text"
                  placeholder="Video URL (e.g., https://...)"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#82959B]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2 mt-4">
             <label className="text-sm text-[#82959B] font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Cover Image URL (optional)
             </label>
             <input
               type="text"
               placeholder="https://..."
               value={coverUrl}
               onChange={(e) => setCoverUrl(e.target.value)}
               className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-2 text-[#D7DADC] text-sm focus:outline-none focus:ring-1 focus:ring-[#82959B]"
             />
             {coverUrl && (
                <div className="mt-2 rounded-md overflow-hidden bg-[#0B1416] border border-[#34444E] max-w-sm max-h-48 relative">
                   <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
             )}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-[#34444E]">
            <button
              type="submit"
              disabled={isPending || !title.trim() || (postType === "video" && (!videoUrl.trim() || !coverUrl.trim()))}
              className="px-6 py-2 bg-[#D7DADC] text-[#0B1416] font-bold rounded-full hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
