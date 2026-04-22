export function RightSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[316px] flex-col overflow-hidden hover:overflow-y-auto gap-4 py-6 pr-4 lg:flex flex-shrink-0 z-10 transition-all">
      {/* Premium Banner */}
      <div className="rounded-xl border border-[#34444E] bg-[#1A282D] p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-1 h-6 w-6 text-[#FF4500]">
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="fill-current">
              <path d="M13.535 2.535l-.018-.018a1.536 1.536 0 00-2.172 0l-1.345 1.345 1.345 1.345a1.536 1.536 0 002.172 0l.018-.018a1.536 1.536 0 000-2.172v-.482zm-8.89 8.89a1.536 1.536 0 110-2.172l1.345-1.345 2.172 2.172-1.345 1.345a1.536 1.536 0 01-2.172 0zM10 20a10 10 0 110-20 10 10 0 010 20zm5.17-5.17c1.378-1.377 1.378-3.623 0-5l-5-5c-1.377-1.378-3.623-1.378-5 0-1.378 1.377-1.378 3.623 0 5l5 5c1.377 1.378 3.623 1.378 5 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#D7DADC]">zfeed Premium</h3>
            <p className="text-xs text-[#D7DADC] opacity-80">The best zfeed experience, with monthly Coins</p>
          </div>
        </div>
        <button className="mt-3 w-full rounded-full bg-[#FF4500] py-2 text-sm font-bold text-white transition hover:bg-orange-600">
          Try Now
        </button>
      </div>

      {/* Community Directory */}
      <div className="rounded-xl border border-[#34444E] bg-[#1A282D] shadow-sm overflow-hidden">
        <div className="bg-[#2A3C42] px-4 py-3">
          <h3 className="text-sm font-bold text-[#D7DADC]">Popular Communities</h3>
        </div>
        <ul className="flex flex-col">
          {[
            { name: "r/AskReddit", members: "45M", icon: "bg-blue-500" },
            { name: "r/gaming", members: "38M", icon: "bg-red-500" },
            { name: "r/aww", members: "35M", icon: "bg-orange-500" },
            { name: "r/Music", members: "32M", icon: "bg-teal-500" },
            { name: "r/science", members: "30M", icon: "bg-purple-500" },
          ].map((comm, index) => (
            <li key={comm.name} className="flex items-center gap-3 border-t border-[#34444E] px-4 py-3 cursor-pointer hover:bg-[#2A3C42] transition">
              <span className="text-sm font-medium text-[#82959B] w-4">{index + 1}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#34444E] overflow-hidden">
                <span className={`block h-full w-full ${comm.icon}`}></span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#D7DADC] hover:underline">{comm.name}</span>
                <span className="text-xs text-[#D7DADC] opacity-60">{comm.members} members</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="p-4 border-t border-[#34444E]">
           <button className="w-full rounded-full bg-[#2A3C42] py-2 text-sm font-bold text-[#D7DADC] transition hover:bg-[#34444E]">
            See All
          </button>
        </div>
      </div>

      {/* Footer Links */}
      <div className="px-2 pb-8">
        <ul className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-[#82959B]">
          <li><a href="#" className="hover:underline">User Agreement</a></li>
          <li><a href="#" className="hover:underline">Privacy Policy</a></li>
          <li><a href="#" className="hover:underline">Content Policy</a></li>
          <li><a href="#" className="hover:underline">Moderator Code Of Conduct</a></li>
        </ul>
        <p className="mt-2 text-xs text-[#82959B] opacity-70">zfeed Inc © 2026. All rights reserved</p>
      </div>
    </aside>
  );
}
