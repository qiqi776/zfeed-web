import { Cake, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function UserHoverCard({ username }: { username: string }) {
  // Use z-[100] to ensure it pops up above all other elements
  // The outer div uses pt-2 to bridge the gap between trigger and tooltip
  // so hover isn't lost when crossing the whitespace.
  return (
    <div className="absolute top-full left-0 z-[100] w-64 origin-top-left pt-2 opacity-0 invisible transition-all delay-300 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
      <div 
        className="rounded-xl border border-[#34444E] bg-[#1A282D] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 flex-shrink-0 rounded-full border border-[#34444E] bg-[#0B1416] overflow-hidden">
             <img 
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${username}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                alt={username} 
                className="h-full w-full object-cover" 
             />
          </div>
          <div className="flex flex-col">
            <Link to={`/user/${username}`} className="font-bold text-[#D7DADC] text-base hover:underline">
              u/{username}
            </Link>
            <span className="text-xs text-[#82959B]">Redditor</span>
          </div>
        </div>
        
        <div className="mt-3 flex gap-4 text-xs text-[#82959B]">
           <div className="flex flex-col">
             <span className="font-bold text-[#D7DADC]">12.5k</span>
             <span className="flex items-center gap-1"><Star className="h-3 w-3 text-orange-500"/> Post Karma</span>
           </div>
           <div className="flex flex-col">
             <span className="font-bold text-[#D7DADC]">Dec 12, 2021</span>
             <span className="flex items-center gap-1"><Cake className="h-3 w-3 text-blue-400"/> Cake day</span>
           </div>
        </div>

        <div className="mt-4 flex gap-2">
           <Link to={`/user/${username}`} className="flex-1 rounded-full bg-[#D7DADC] py-1.5 text-center text-sm font-bold text-[#0B1416] transition hover:bg-white">
             View Profile
           </Link>
           <button className="flex-1 rounded-full bg-[#2A3C42] py-1.5 text-center text-sm font-bold text-[#D7DADC] transition hover:bg-[#34444E]">
             Follow
           </button>
        </div>
      </div>
    </div>
  );
}
