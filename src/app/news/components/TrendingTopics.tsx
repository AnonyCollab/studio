
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const topics = [
  "Technology",
  "Programming",
  "Design",
  "Data Science",
  "Self Improvement",
  "Writing",
  "Relationships",
  "Machine Learning",
  "Productivity",
  "Politics"
];

interface TrendingTopicsProps {
  theme: "light" | "dark";
}

export function TrendingTopics({ theme }: TrendingTopicsProps) {
  const isDark = theme === "dark";

  return (
    <aside className="sticky top-24">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
        <h3 className={`uppercase tracking-wide ${isDark ? "text-[#e5e7eb]" : "text-gray-900"}`}>
          Trending Topics
        </h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {topics.map((topic) => (
          <Badge 
            key={topic} 
            variant="outline" 
            className={`cursor-pointer transition-all ${
              isDark 
                ? "bg-white/5 text-gray-300 border-white/10 hover:border-cyan-400/50 hover:bg-white/10 hover:text-cyan-400" 
                : "bg-white text-gray-700 border-gray-200 hover:border-cyan-500/50 hover:bg-gray-50 hover:text-cyan-600"
            }`}
          >
            {topic}
          </Badge>
        ))}
      </div>
      
      <div className={`pt-6 ${isDark ? "border-white/5" : "border-gray-100"} border-t`}>
        <h3 className={`uppercase tracking-wide mb-4 ${isDark ? "text-[#e5e7eb]" : "text-gray-900"}`}>
          Recommended Reading
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group cursor-pointer">
              <div className="flex items-start gap-3">
                <span className={isDark ? "text-[#6b7280]" : "text-gray-300"}>
                  {`0${i}`}
                </span>
                <div>
                  <p className={`mb-1 group-hover:opacity-80 transition-opacity ${
                    isDark ? "text-[#e5e7eb]" : "text-gray-900"
                  }`}>
                    {i === 1 && "The Future of Web Development: What to Expect in 2025"}
                    {i === 2 && "10 Design Principles Every Developer Should Know"}
                    {i === 3 && "How AI is Transforming the Creative Industry"}
                  </p>
                  <p className={isDark ? "text-[#6b7280]" : "text-gray-500"}>
                    {i === 1 && "Sarah Johnson · 5 min read"}
                    {i === 2 && "Michael Chen · 8 min read"}
                    {i === 3 && "Emma Davis · 6 min read"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

    