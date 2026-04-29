import { useState, useEffect, type SyntheticEvent } from "react";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "../api/content";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";

export function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ['postDetail', id],
    queryFn: () => contentApi.getDetail(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (post) {
       if (user?.user_id !== post.author_id && post.author_id) {
          toast.error("You are not authorized to edit this post");
          navigate(`/post/${id}`);
       }
       setTitle(post.title || "");
       setContent(post.article_content || "");
       setCoverUrl(post.cover_url || "");
       setVideoUrl(post.video_url || "");
    }
  }, [post, user, navigate, id]);

  const editArticleMutation = useMutation({
    mutationFn: () => contentApi.editArticle(id!, {
      title,
      content,
      cover: coverUrl || undefined,
    }),
    onSuccess: () => {
      toast.success("Post updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['postDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['recommendFeed'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user) {
         queryClient.invalidateQueries({ queryKey: ['userFeed', user.user_id] });
      }
      navigate(`/post/${id}`);
    },
    onError: () => {
      toast.error("Failed to update post.");
    }
  });

  const editVideoMutation = useMutation({
    mutationFn: () => contentApi.editVideo(id!, {
      title,
      video_url: videoUrl,
      cover_url: coverUrl || undefined,
    }),
    onSuccess: () => {
      toast.success("Video updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['postDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['recommendFeed'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      if (user) {
         queryClient.invalidateQueries({ queryKey: ['userFeed', user.user_id] });
      }
      navigate(`/post/${id}`);
    },
    onError: () => {
      toast.error("Failed to update video.");
    }
  });

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (post?.content_type === 20) {
      if (!videoUrl.trim()) {
        toast.error("Video URL is required");
        return;
      }
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
      editVideoMutation.mutate();
    } else {
      editArticleMutation.mutate();
    }
  };

  const isPending = editArticleMutation.isPending || editVideoMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-20 pb-20">
         <Loader2 className="h-8 w-8 animate-spin text-[#D7DADC]" />
      </div>
    );
  }

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
           <h1 className="text-xl font-bold text-[#D7DADC] ml-2">Edit {post?.content_type === 20 ? "video" : "post"}</h1>
        </div>
      </div>

      <div className="bg-[#1A282D] rounded-xl border border-[#34444E] overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex flex-col gap-4">
          
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] font-bold text-lg focus:outline-none focus:ring-1 focus:ring-[#82959B]"
            maxLength={300}
          />
          
          {post?.content_type === 20 ? (
            <div className="flex flex-col gap-2">
               <input
                 type="text"
                 placeholder="Video URL (e.g., https://...)"
                 value={videoUrl}
                 onChange={(e) => setVideoUrl(e.target.value)}
                 className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#82959B]"
               />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
               <textarea
                 placeholder="Text (optional)"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 className="w-full bg-[#0B1416] border border-[#34444E] rounded-md px-4 py-3 text-[#D7DADC] min-h-[200px] focus:outline-none focus:ring-1 focus:ring-[#82959B] resize-y"
               />
            </div>
          )}

          <div className="flex flex-col gap-2">
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
              disabled={isPending || !title.trim() || (post?.content_type === 20 && (!videoUrl.trim() || !coverUrl.trim()))}
              className="px-6 py-2 bg-[#D7DADC] text-[#0B1416] font-bold rounded-full hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
