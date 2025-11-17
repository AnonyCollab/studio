
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { FileText, Newspaper, Grid, MessageSquare, CornerUpLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserStatsHoverCardProps {
  author: {
    name: string;
    avatar: string;
  };
  stats?: {
    posts: number;
    articles: number;
    collaborationPlans: number;
    comments: number;
    replies: number;
  };
  theme?: "light" | "dark";
}

export function UserStatsHoverCard({ author, stats = {
  posts: 7,
  articles: 2,
  collaborationPlans: 0,
  comments: 0,
  replies: 15
}, theme = "dark" }: UserStatsHoverCardProps) {
  const isDark = theme === "dark";
  
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <button className="rounded-full hover:ring-2 hover:ring-cyan-400/50 transition-all">
          <Avatar className="w-8 h-8 cursor-pointer">
            <AvatarImage src={author.avatar} />
            <AvatarFallback>{author.name[0]}</AvatarFallback>
          </Avatar>
        </button>
      </HoverCardTrigger>
      <HoverCardContent 
        side="right" 
        align="start"
        className={`w-80 p-0 overflow-hidden ${isDark ? "bg-[#1a1f2e] border-white/10" : "bg-white border-gray-200"}`}
      >
        <div className="p-5 space-y-4">
          {/* User Header */}
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarImage src={author.avatar} />
              <AvatarFallback className={isDark ? "bg-gray-700 text-white text-lg" : "bg-gray-200 text-gray-700 text-lg"}>
                {author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className={isDark ? "text-white" : "text-gray-900"}>{author.name}</h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>User Contributions</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <FileText className="w-4 h-4" />
                <span>Posts</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-900"}>{stats.posts}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <Newspaper className="w-4 h-4" />
                <span>Articles</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-900"}>{stats.articles}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <Grid className="w-4 h-4" />
                <span>Collaboration Plans</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-900"}>{stats.collaborationPlans}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <MessageSquare className="w-4 h-4" />
                <span>Comments</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-900"}>{stats.comments}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className={`flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                <CornerUpLeft className="w-4 h-4" />
                <span>Replies</span>
              </div>
              <span className={isDark ? "text-white" : "text-gray-900"}>{stats.replies}</span>
            </div>
          </div>

          {/* Connect Button */}
          <Button className={`w-full flex items-center gap-2 ${isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}`}>
            <UserPlus className="w-4 h-4" />
            Connect
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
