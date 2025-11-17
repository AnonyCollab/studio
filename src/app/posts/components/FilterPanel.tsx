
import { Search, Briefcase, MessageSquare, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  onFilterChange?: (filters: any) => void;
  theme?: "light" | "dark";
}

export function FilterPanel({ onFilterChange, theme = "dark" }: FilterPanelProps) {
  const isDark = theme === "dark";
  
  return (
    <div className={`rounded-lg p-6 border space-y-6 ${isDark ? "bg-[#131823] border-white/10" : "bg-white border-gray-200"}`}>
      <h3 className={`text-xl ${isDark ? "text-white" : "text-gray-900"}`}>Filter by</h3>

      {/* Post Type */}
      <div>
        <h4 className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Post Type</h4>
        <div className="flex flex-wrap gap-3">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isDark 
              ? "border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-400" 
              : "border-gray-300 text-gray-700 hover:border-cyan-500/50 hover:text-cyan-600"
          }`}>
            <MessageSquare className="w-4 h-4" />
            Q&A
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isDark 
              ? "border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-400" 
              : "border-gray-300 text-gray-700 hover:border-cyan-500/50 hover:text-cyan-600"
          }`}>
            <Briefcase className="w-4 h-4" />
            General
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
            isDark 
              ? "border-white/10 text-gray-300 hover:border-cyan-400/50 hover:text-cyan-400" 
              : "border-gray-300 text-gray-700 hover:border-cyan-500/50 hover:text-cyan-600"
          }`}>
            <Star className="w-4 h-4" />
            Feedback
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Tags</h4>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search tags..."
            className={`pl-10 ${
              isDark 
                ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" 
                : "bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-cyan-500/50"
            }`}
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <h4 className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Industry</h4>
        <Select>
          <SelectTrigger className={isDark ? "bg-white/5 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-900"}>
            <SelectValue placeholder="Select Sector" />
          </SelectTrigger>
          <SelectContent className={isDark ? "bg-[#1a1f2e] border-white/10 text-white" : "bg-white border-gray-200 text-gray-900"}>
            <SelectItem value="all" className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
              All Sectors
            </SelectItem>
            <SelectItem value="arts" className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
              Arts, Entertainment, and Recreation
            </SelectItem>
            <SelectItem value="tech" className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
              Information Technology
            </SelectItem>
            <SelectItem value="healthcare" className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
              Healthcare and Social Assistance
            </SelectItem>
            <SelectItem value="finance" className={isDark ? "focus:bg-white/10" : "focus:bg-gray-100"}>
              Finance and Insurance
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
