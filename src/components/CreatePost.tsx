import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from "react";
import {
  ArrowLeft,
  FileText,
  Film,
  Image as ImageIcon,
  Loader2,
  Upload,
  Video,
  WandSparkles,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { contentApi } from "../api/content";
import { VISIBILITY_PUBLIC } from "../lib/contentMeta";
import {
  createLocalObjectUrl,
  createVideoPosterFile,
  getUploadAccept,
  getUploadSizeHint,
  uploadContentAsset,
} from "../lib/uploads";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";
import { ArticleEditor } from "./ArticleEditor";
import { cn } from "../lib/utils";

type PostType = "article" | "video";
type VideoCoverMode = "first-frame" | "upload";

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function CreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const articleCoverInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const videoCoverInputRef = useRef<HTMLInputElement>(null);

  const [postType, setPostType] = useState<PostType>("article");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleCoverUrl, setArticleCoverUrl] = useState("");
  const [videoCoverUrl, setVideoCoverUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoCoverMode, setVideoCoverMode] =
    useState<VideoCoverMode>("first-frame");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isInlineImageUploading, setIsInlineImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [isVideoCoverUploading, setIsVideoCoverUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const publishArticleMutation = useMutation({
    mutationFn: () =>
      contentApi.publishArticle({
        title: title.trim(),
        content: content.trim(),
        cover: articleCoverUrl.trim() || undefined,
        visibility: VISIBILITY_PUBLIC,
      }),
    onSuccess: (data) => {
      toast.success("Article published successfully!");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["userFeed", user.user_id] });
      }
      navigate(`/post/${data.content_id}`);
    },
    onError: () => {
      toast.error("Failed to publish article.");
    },
  });

  const publishVideoMutation = useMutation({
    mutationFn: () =>
      contentApi.publishVideo({
        title: title.trim(),
        video_url: videoUrl.trim(),
        cover_url: videoCoverUrl.trim(),
        visibility: VISIBILITY_PUBLIC,
      }),
    onSuccess: (data) => {
      toast.success("Video published successfully!");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["userFeed", user.user_id] });
      }
      navigate(`/post/${data.content_id}`);
    },
    onError: () => {
      toast.error("Failed to publish video.");
    },
  });

  const uploadArticleCover = async (file: File) => {
    setIsCoverUploading(true);
    try {
      const asset = await uploadContentAsset("article-cover", file);
      setArticleCoverUrl(asset.url);
      toast.success("Cover uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload the cover image."));
    } finally {
      setIsCoverUploading(false);
    }
  };

  const uploadInlineArticleImage = async (file: File) => {
    setIsInlineImageUploading(true);
    try {
      const asset = await uploadContentAsset("article-image", file);
      toast.success("Image uploaded");
      return asset.url;
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload the article image."));
      throw error;
    } finally {
      setIsInlineImageUploading(false);
    }
  };

  const uploadVideoCover = async (file: File, successMessage = "Cover uploaded") => {
    setIsVideoCoverUploading(true);
    try {
      const asset = await uploadContentAsset("video-cover", file);
      setVideoCoverUrl(asset.url);
      toast.success(successMessage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload the video cover."));
      throw error;
    } finally {
      setIsVideoCoverUploading(false);
    }
  };

  const generateFirstFrameCover = async (file: File, successMessage?: string) => {
    setIsVideoCoverUploading(true);
    try {
      const posterFile = await createVideoPosterFile(file);
      const asset = await uploadContentAsset("video-cover", posterFile);
      setVideoCoverUrl(asset.url);
      if (successMessage) {
        toast.success(successMessage);
      }
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to generate a cover from the video."),
      );
      throw error;
    } finally {
      setIsVideoCoverUploading(false);
    }
  };

  const handleArticleCoverChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }
    await uploadArticleCover(file);
  };

  const handleVideoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const previewUrl = createLocalObjectUrl(file);
    setVideoPreviewUrl(previewUrl);
    setSelectedVideoFile(file);
    setIsVideoUploading(true);
    if (videoCoverMode === "first-frame") {
      setIsVideoCoverUploading(true);
    }

    try {
      const videoUploadPromise = uploadContentAsset("video-source", file);
      const coverUploadPromise =
        videoCoverMode === "first-frame"
          ? createVideoPosterFile(file).then((posterFile) =>
              uploadContentAsset("video-cover", posterFile),
            )
          : Promise.resolve(null);

      const [videoAsset, coverAsset] = await Promise.all([
        videoUploadPromise,
        coverUploadPromise,
      ]);

      setVideoUrl(videoAsset.url);
      if (coverAsset) {
        setVideoCoverUrl(coverAsset.url);
      }

      toast.success(
        coverAsset
          ? "Video uploaded and first-frame cover generated"
          : "Video uploaded",
      );
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to upload the video."));
    } finally {
      setIsVideoUploading(false);
      setIsVideoCoverUploading(false);
    }
  };

  const handleVideoCoverChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    await uploadVideoCover(file);
  };

  const handleVideoCoverModeChange = async (nextMode: VideoCoverMode) => {
    setVideoCoverMode(nextMode);

    if (nextMode === "upload") {
      setVideoCoverUrl("");
      return;
    }

    if (selectedVideoFile) {
      try {
        await generateFirstFrameCover(
          selectedVideoFile,
          "First-frame cover generated",
        );
      } catch {
        // Error toast already handled in helper.
      }
    }
  };

  const handleSubmit = async (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (postType === "article") {
      if (!content.trim()) {
        toast.error("Article content is required");
        return;
      }
      publishArticleMutation.mutate();
      return;
    }

    if (!videoUrl.trim()) {
      toast.error("Please upload a video file first");
      return;
    }

    if (
      !videoCoverUrl.trim() &&
      videoCoverMode === "first-frame" &&
      selectedVideoFile
    ) {
      try {
        await generateFirstFrameCover(selectedVideoFile);
      } catch {
        return;
      }
    }

    if (!videoCoverUrl.trim()) {
      toast.error("Please provide a cover image or use the video first frame");
      return;
    }

    publishVideoMutation.mutate();
  };

  const isPending =
    publishArticleMutation.isPending ||
    publishVideoMutation.isPending ||
    isCoverUploading ||
    isInlineImageUploading ||
    isVideoUploading ||
    isVideoCoverUploading;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="mx-auto flex w-full max-w-3xl flex-col pb-10 xl:ml-0"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-[#34444E] bg-[#0B1416] px-4 py-2 text-sm font-bold text-[#D7DADC] transition hover:bg-[#2A3C42]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="ml-2 text-xl font-bold text-[#D7DADC]">
            Create a post
          </h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#34444E] bg-[#0B1416]">
        <div className="flex border-b border-[#34444E]">
          <button
            type="button"
            onClick={() => setPostType("article")}
            className={`relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
              postType === "article"
                ? "text-white"
                : "text-[#82959B] hover:bg-[#2A3C42]"
            }`}
          >
            <FileText className="h-5 w-5" />
            Article
            {postType === "article" && (
              <motion.div
                layoutId="create_post_tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setPostType("video")}
            className={`relative flex flex-1 items-center justify-center gap-2 py-3 text-sm font-bold transition ${
              postType === "video"
                ? "text-white"
                : "text-[#82959B] hover:bg-[#2A3C42]"
            }`}
          >
            <Video className="h-5 w-5" />
            Video
            {postType === "video" && (
              <motion.div
                layoutId="create_post_tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#AAB8BC]">Title</label>
            <input
              type="text"
              placeholder="Give your post a clear title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-[#34444E] bg-[#000000] px-4 py-3 text-lg font-bold text-[#D7DADC] focus:outline-none focus:ring-1 focus:ring-[#82959B]"
              maxLength={100}
            />
          </div>

          <AnimatePresence mode="popLayout">
            {postType === "article" ? (
              <motion.div
                key="article"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#AAB8BC]">
                    Body
                  </label>
                  <ArticleEditor
                    value={content}
                    onChange={setContent}
                    onUploadImage={uploadInlineArticleImage}
                    isUploadingImage={isInlineImageUploading}
                    disabled={isPending}
                  />
                </div>

                <div className="rounded-xl border border-[#34444E] bg-[#10191D] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#D7DADC]">
                        Article cover
                      </h2>
                      <p className="mt-1 text-xs text-[#82959B]">
                        Optional. If you skip it, the feed will show the title
                        without a cover image.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => articleCoverInputRef.current?.click()}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1B2A31] px-4 py-2 text-sm font-semibold text-[#D7DADC] transition hover:bg-[#243841] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCoverUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {articleCoverUrl ? "Replace cover" : "Upload cover"}
                      </button>
                      {articleCoverUrl && (
                        <button
                          type="button"
                          onClick={() => setArticleCoverUrl("")}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 rounded-full border border-[#34444E] px-4 py-2 text-sm font-semibold text-[#D7DADC] transition hover:bg-[#1B2A31] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                      <input
                        ref={articleCoverInputRef}
                        type="file"
                        accept={getUploadAccept("article-cover")}
                        className="hidden"
                        onChange={handleArticleCoverChange}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-[#61747C]">
                    {getUploadSizeHint("article-cover")}
                  </p>

                  {articleCoverUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#34444E] bg-[#000000]">
                      <img
                        src={articleCoverUrl}
                        alt="Article cover preview"
                        className="max-h-72 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-[#34444E] bg-[#0B1416] text-sm text-[#61747C]">
                      No cover selected. Title-only cards will be used.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                <div className="rounded-xl border border-[#34444E] bg-[#10191D] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#D7DADC]">
                        Video file
                      </h2>
                      <p className="mt-1 text-xs text-[#82959B]">
                        Select a local file. We will upload it for you and keep
                        the remote URL out of the form.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      disabled={isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1B2A31] px-4 py-2 text-sm font-semibold text-[#D7DADC] transition hover:bg-[#243841] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isVideoUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Film className="h-4 w-4" />
                      )}
                      {videoUrl ? "Replace video" : "Upload video"}
                    </button>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept={getUploadAccept("video-source")}
                      className="hidden"
                      onChange={handleVideoFileChange}
                    />
                  </div>

                  <p className="mt-3 text-xs text-[#61747C]">
                    {getUploadSizeHint("video-source")}
                  </p>

                  {videoPreviewUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#34444E] bg-[#000000]">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="max-h-[420px] w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[#34444E] bg-[#0B1416] text-sm text-[#61747C]">
                      No video selected yet.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#34444E] bg-[#10191D] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-[#D7DADC]">
                        Video cover
                      </h2>
                      <p className="mt-1 text-xs text-[#82959B]">
                        Upload a custom image or let us use the first frame of
                        the selected video.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#34444E] bg-[#111B1F] p-1">
                      <button
                        type="button"
                        onClick={() => handleVideoCoverModeChange("first-frame")}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                          videoCoverMode === "first-frame"
                            ? "bg-[#D7DADC] text-[#000000]"
                            : "text-[#82959B] hover:text-[#D7DADC]",
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <WandSparkles className="h-4 w-4" />
                          First frame
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVideoCoverModeChange("upload")}
                        className={cn(
                          "rounded-full px-3 py-1.5 text-sm font-semibold transition",
                          videoCoverMode === "upload"
                            ? "bg-[#D7DADC] text-[#000000]"
                            : "text-[#82959B] hover:text-[#D7DADC]",
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Custom image
                        </span>
                      </button>
                    </div>
                  </div>

                  {videoCoverMode === "upload" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => videoCoverInputRef.current?.click()}
                        disabled={isPending}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1B2A31] px-4 py-2 text-sm font-semibold text-[#D7DADC] transition hover:bg-[#243841] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isVideoCoverUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                        {videoCoverUrl ? "Replace cover" : "Upload cover"}
                      </button>
                      <input
                        ref={videoCoverInputRef}
                        type="file"
                        accept={getUploadAccept("video-cover")}
                        className="hidden"
                        onChange={handleVideoCoverChange}
                      />
                      <p className="text-xs text-[#61747C]">
                        {getUploadSizeHint("video-cover")}
                      </p>
                    </div>
                  )}

                  {videoCoverMode === "first-frame" && (
                    <p className="mt-4 text-xs text-[#61747C]">
                      The first frame is generated automatically when you upload
                      a local video file.
                    </p>
                  )}

                  {videoCoverUrl ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#34444E] bg-[#000000]">
                      <img
                        src={videoCoverUrl}
                        alt="Video cover preview"
                        className="max-h-72 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-4 flex min-h-36 items-center justify-center rounded-xl border border-dashed border-[#34444E] bg-[#0B1416] text-sm text-[#61747C]">
                      {videoCoverMode === "upload"
                        ? "Choose a local image to use as the cover."
                        : "Upload a video to generate the first-frame cover."}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-2 flex justify-end border-t border-[#34444E] pt-4">
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#D7DADC] px-6 py-2 font-bold text-[#000000] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
