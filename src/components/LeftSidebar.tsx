import { Home, ArrowUpRight, Flame, BarChart3, Settings } from "lucide-react";
import { TOPICS } from "../data/mockData";

export function LeftSidebar() {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-56px)] w-[260px] flex-col overflow-hidden hover:overflow-y-auto thin-scrollbar border-r border-[#34444E] bg-transparent pt-4 xl:flex flex-shrink-0 z-10 transition-all">
      {/* Primary Links */}
      <div className="mb-4 px-4">
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg bg-[#2A3C42] px-3 py-2 text-[#D7DADC] transition"
            >
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium opacity-80">Home</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <ArrowUpRight className="h-5 w-5 opacity-60" />
              <span className="text-sm opacity-60">Popular</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <BarChart3 className="h-5 w-5 opacity-60" />
              <span className="text-sm opacity-60">Explore</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="mx-4 my-2 mb-4 h-px bg-[#34444E]" />

      {/* Topics */}
      <div className="mb-4 px-4">
        <h3 className="mb-2 px-3 text-[10px] uppercase font-bold text-[#82959B]">
          Topics
        </h3>
        <ul className="space-y-1">
          {TOPICS.map((topic) => (
            <li key={topic}>
              <a
                href="#"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
              >
                <span className="text-sm opacity-80">{topic}</span>
              </a>
            </li>
          ))}
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-60">See more</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="mx-4 my-2 mb-4 h-px bg-[#34444E]" />

      {/* Resources */}
      <div className="px-4 pb-8">
        <h3 className="mb-2 px-3 text-[10px] uppercase font-bold text-[#82959B]">
          Resources
        </h3>
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">About zfeed</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">Advertise</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">Help</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">Blog</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">Careers</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[#D7DADC] transition hover:bg-[#1A282D]"
            >
              <span className="text-sm opacity-80">Press</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  );
}
