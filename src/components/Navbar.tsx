import {
  Bell,
  ChevronDown,
  Compass,
  Home,
  MessageCircle,
  Plus,
  Search,
  User,
  Sparkles,
  Settings,
  LogOut
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout, isAuthModalOpen, setAuthModalOpen } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-[#34444E] bg-[#0B1416] px-4 md:px-5 flex-shrink-0">
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4500]">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-[#D7DADC] lg:block">
            zfeed
          </span>
        </Link>

        {/* Search Bar */}
        <div className="mx-4 flex max-w-[560px] flex-1 items-center">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const q = formData.get('q');
              if (q && typeof q === 'string' && q.trim()) {
                 navigate(`/search?q=${encodeURIComponent(q.trim())}`);
              }
            }}
            className="relative w-full group"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-[#82959B]" />
            </div>
            <input
              type="text"
              name="q"
              className="h-10 w-full rounded-full bg-[#2A3C42] pl-11 pr-[88px] text-sm text-[#D7DADC] placeholder:text-[#82959B] transition focus:outline-none focus:ring-1 focus:ring-[#D7DADC] hover:bg-[#34444E]"
              placeholder="Search zfeed"
            />
            <button type="button" className="absolute right-1 top-1 bottom-1 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-3 text-xs font-bold text-white transition hover:opacity-90 active:scale-95">
               <Sparkles className="h-3.5 w-3.5" />
               <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-1 sm:flex">
                <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#D7DADC] transition hover:bg-[#2A3C42]">
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full text-[#D7DADC] transition hover:bg-[#2A3C42]">
                  <Bell className="h-5 w-5" />
                </button>
                <Link to="/submit" className="flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-[#D7DADC] transition hover:bg-[#2A3C42]">
                  <Plus className="h-5 w-5" />
                  <span className="hidden font-medium md:block">Create</span>
                </Link>
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-full p-1 transition hover:bg-[#2A3C42]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A3C42] overflow-hidden">
                    <img src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.nickname}`} alt="avatar" className="h-full w-full object-cover" />
                  </div>
                  <ChevronDown className="hidden h-5 w-5 text-[#82959B] sm:block" />
                </button>

                {/* Expanded Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-[#34444E] bg-[#0B1416] py-2 shadow-xl z-[100] origin-top-right animate-in fade-in zoom-in-95 duration-100">
                     <div className="px-4 py-3 border-b border-[#34444E] flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#2A3C42] overflow-hidden">
                           <img src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.nickname}`} alt="avatar" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col text-left">
                           <p className="text-sm font-bold text-[#D7DADC]">{user.nickname}</p>
                           <p className="text-xs text-[#82959B]">u/{user.nickname.toLowerCase().replace(/\s+/g, '_')}</p>
                        </div>
                     </div>
                     <ul className="py-2 flex flex-col text-[#D7DADC]">
                        <li>
                          <Link onClick={() => setIsDropdownOpen(false)} to={`/user/${user.user_id}`} className="flex items-center px-4 py-2 hover:bg-[#2A3C42] transition text-sm font-semibold">
                            <User className="mr-3 h-5 w-5 text-[#82959B]"/> View Profile
                          </Link>
                        </li>
                        <li>
                          <button onClick={() => setIsDropdownOpen(false)} className="w-full flex items-center px-4 py-2 hover:bg-[#2A3C42] transition text-sm font-semibold text-left">
                            <Settings className="mr-3 h-5 w-5 text-[#82959B]"/> User Settings
                          </button>
                        </li>
                        <div className="my-2 border-t border-[#34444E]"></div>
                        <li>
                          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 hover:bg-[#2A3C42] transition text-sm font-semibold text-left text-red-400">
                             <LogOut className="mr-3 h-5 w-5 text-[#red-400]"/> Log Out
                          </button>
                        </li>
                     </ul>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:flex h-10 items-center justify-center rounded-full bg-[#2A3C42] px-4 font-bold text-[#D7DADC] transition hover:bg-[#34444E]"
              >
                Log In
              </button>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="flex h-10 items-center justify-center rounded-full bg-[#D7DADC] px-4 font-bold text-[#0B1416] transition hover:bg-white"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
