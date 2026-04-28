import { useState, useRef, type SyntheticEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Camera, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user";
import { toast } from "sonner";
import { useAuthStore } from "../store/useAuthStore";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    user_id: string;
    nickname: string;
    bio: string;
    avatar: string;
  };
}

export function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: EditProfileModalProps) {
  const [nickname, setNickname] = useState(profile.nickname || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const updateAuthUser = useAuthStore((state) => state.updateUser);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { nickname?: string; bio?: string; avatar?: string }) =>
      userApi.updateProfile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile", profile.user_id],
      });
      updateAuthUser({ nickname: data.nickname, avatar: data.avatar });
      toast.success("Profile updated");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleAvatarSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const res = await userApi.uploadAvatar(file);
      setAvatarPreview(res.url);
      toast.success("Avatar uploaded");
    } catch (err) {
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    if (!nickname.trim()) {
      toast.error("Nickname is required");
      return;
    }
    updateProfileMutation.mutate({ nickname, bio, avatar: avatarPreview });
  };

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
          className="relative w-full max-w-[500px] overflow-hidden rounded-2xl bg-[#0B1416] border border-[#34444E] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#34444E] px-6 py-4">
            <h2 className="text-xl font-bold text-[#D7DADC]">Edit profile</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#82959B] transition hover:bg-[#1A282D] hover:text-[#D7DADC]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={handleSubmit}
            className="p-6 flex flex-col gap-6 overflow-y-auto max-h-[75vh]"
          >
            {/* Avatar Section */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-[#D7DADC]">
                Avatar and banner image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleAvatarSelect}
              />
              <div className="relative h-32 rounded-xl bg-gradient-to-r from-indigo-900 to-[#1A282D] mb-8 border border-[#34444E]">
                <div className="absolute -bottom-8 left-6 group">
                  <div
                    className="h-24 w-24 rounded-full border-4 border-[#0B1416] overflow-hidden bg-[#1A282D] cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <Camera className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <img
                      src={
                        avatarPreview ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname}`
                      }
                      alt="Avatar profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#D7DADC]">
                  Display name (optional)
                </label>
                <p className="text-xs text-[#82959B] mb-1">
                  Set a display name. This does not change your username.
                </p>
                <input
                  type="text"
                  maxLength={30}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-xl border border-[#34444E] bg-[#1A282D] p-3 text-sm text-[#D7DADC] outline-none transition focus:border-[#D7DADC]"
                  placeholder="Display name"
                />
                <div className="text-right text-xs text-[#82959B]">
                  {30 - nickname.length} Characters remaining
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#D7DADC]">
                  About (optional)
                </label>
                <p className="text-xs text-[#82959B] mb-1">
                  A brief description of yourself shown on your profile.
                </p>
                <textarea
                  maxLength={200}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-[#34444E] bg-[#1A282D] p-3 text-sm text-[#D7DADC] outline-none transition focus:border-[#D7DADC] min-h-[100px] resize-none"
                  placeholder="About you"
                />
                <div className="text-right text-xs text-[#82959B]">
                  {200 - bio.length} Characters remaining
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#34444E]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 font-bold text-[#D7DADC] hover:bg-[#1A282D] rounded-full transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || updateProfileMutation.isPending}
                className="px-5 py-2 font-bold bg-[#D7DADC] text-[#0B1416] hover:bg-white rounded-full transition disabled:opacity-50 text-sm flex items-center justify-center min-w-[80px]"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
