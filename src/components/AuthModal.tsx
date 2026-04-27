import { useState, type SyntheticEvent } from "react";
import { X, Mail, Lock, User as UserIcon } from "lucide-react";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = useAuthStore((state) => state.login);

  if (!isOpen) return null;

  const handleSubmit = async (
    e: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();
    if (!mobile || !password || (!isLogin && !nickname)) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const data = await authApi.login({ mobile, password });
        login(
          data.token,
          {
            user_id: data.user_id,
            nickname: data.nickname || "User",
            avatar: data.avatar,
          },
          data.expired_at,
        );
        toast.success("Logged in successfully!");
        onClose();
      } else {
        const data = await authApi.register({ mobile, password, nickname });
        login(
          data.token,
          { user_id: data.user_id, nickname: nickname, avatar: data.avatar },
          data.expired_at,
        );
        toast.success("Registered successfully!");
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-[#1A282D] border border-[#34444E] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-[#82959B] transition hover:bg-[#2A3C42] hover:text-[#D7DADC]"
          >
            <X className="h-5 w-5" />
          </button>

          <h2 className="text-2xl font-bold text-[#D7DADC] mb-2">
            {isLogin ? "Log in" : "Sign up"}
          </h2>
          <p className="text-sm text-[#82959B] mb-6">
            By continuing, you agree to our User Agreement and Privacy Policy.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#D7DADC]">
                  Nickname
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <UserIcon className="h-5 w-5 text-[#82959B]" />
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full rounded-xl border border-[#34444E] bg-[#0B1416] p-3 pl-10 text-[#D7DADC] placeholder-[#82959B] transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                    placeholder="Choose a nickname"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D7DADC]">
                Mobile
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-[#82959B]" />
                </div>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full rounded-xl border border-[#34444E] bg-[#0B1416] p-3 pl-10 text-[#D7DADC] placeholder-[#82959B] transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Enter your mobile number"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#D7DADC]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-[#82959B]" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#34444E] bg-[#0B1416] p-3 pl-10 text-[#D7DADC] placeholder-[#82959B] transition focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-[#FF4500] py-3 font-bold text-white transition hover:bg-[#E03D00] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center">
            <p className="text-sm text-[#D7DADC]">
              {isLogin ? "New to zfeed? " : "Already a member? "}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-[#FF4500] hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
