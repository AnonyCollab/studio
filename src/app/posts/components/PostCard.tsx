
'use client';

import { Heart, MessageCircle, Repeat2, Share2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserStatsHoverCard } from "./UserStatsHoverCard";
import { SharePopover } from "./SharePopover";
import { SaveToCollectionDialog } from "./SaveToCollectionDialog";
import { useState, TouchEvent } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    title: string;
    description: string;
    tags: string[];
    likes: number;
    comments: number;
    reposts: number;
    shares: number;
    timestamp: string;
    problemSummary?: string;
    whatIveTriedSummary?: string;
    expectedOutcomeSummary?: string;
  };
  onClick: () => void;
  theme?: "light" | "dark";
}

const badgeColors = [
  "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "bg-pink-500/20 text-pink-300 border-pink-500/30",
];

const badgeColorsLight = [
  "bg-purple-100 text-purple-700 border-purple-300",
  "bg-cyan-100 text-cyan-700 border-cyan-300",
  "bg-orange-100 text-orange-700 border-orange-300",
  "bg-emerald-100 text-emerald-700 border-emerald-300",
  "bg-pink-100 text-pink-700 border-pink-300",
];


export function PostCard({ post, onClick, theme = "dark" }: PostCardProps) {
  const isDark = theme === "dark";
  const currentBadgeColors = isDark ? badgeColors : badgeColorsLight;
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const summaries = [
    { label: "Problem", text: post.problemSummary, value: "problem" },
    { label: "Tried", text: post.whatIveTriedSummary, value: "tried" },
    { label: "Outcome", text: post.expectedOutcomeSummary, value: "outcome" },
  ].filter(s => s.text);
  
  const summaryValues = summaries.map(s => s.value);
  const [activeTab, setActiveTab] = useState(summaryValues.length > 0 ? summaryValues[0] : "");

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTabClick = (e: React.MouseEvent, tabValue: string) => {
    e.stopPropagation();
    setActiveTab(tabValue);
  }
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentIndex = summaryValues.indexOf(activeTab);
      let nextIndex;

      if (isLeftSwipe) {
        nextIndex = currentIndex + 1;
        if (nextIndex >= summaryValues.length) nextIndex = 0;
      } else {
        nextIndex = currentIndex - 1;
        if (nextIndex < 0) nextIndex = summaryValues.length - 1;
      }
      setActiveTab(summaryValues[nextIndex]);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (touchStartX && touchEndX) {
        const distance = Math.abs(touchStartX - touchEndX);
        if (distance > minSwipeDistance / 2) {
             e.preventDefault();
             e.stopPropagation();
             return;
        }
    }
    onClick();
  }


  return (
    <div
      onClick={handleCardClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        'block overflow-hidden transition-all cursor-pointer group h-full min-w-full',
        'bg-transparent md:mb-2',
        isDark 
          ? 'md:bg-[#131823] border-b-2 md:border border-white/10 md:hover:border-cyan-400/50 md:hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
          : 'md:bg-white border-b-2 md:border border-gray-200 md:hover:border-cyan-500/50 md:hover:shadow-lg',
        isMobile ? '' : 'md:rounded-lg'
      )}
    >
      <div className="pt-4 pb-2 px-4 md:px-6">
        {/* 1. Profile Info */}
        <div className="flex items-center gap-3">
          <UserStatsHoverCard author={post.author} theme={theme} />
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-800"}`}>{post.author.name}</span>
            <span className="text-xs text-gray-500">Posted: {post.timestamp}</span>
          </div>
        </div>

        {/* 2. Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {post.tags.length > 0 && post.tags.map((tag, index) => (
            <Badge 
              key={`${post.id}-${tag}`} 
              variant="outline" 
              className={`text-xs ${currentBadgeColors[index % currentBadgeColors.length]} border`}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* 3. Title */}
        <h3 className={`line-clamp-3 text-lg font-medium mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>{post.title}</h3>

        {/* Summaries Tabs */}
        {summaries.length > 0 && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full mt-4" onClick={(e) => e.stopPropagation()}>
            <TabsList className={`grid w-full grid-cols-3 border h-auto p-0 rounded-md ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
              {summaries.map((summary) => (
                <TabsTrigger
                  key={summary.value}
                  value={summary.value}
                  onClick={(e) => handleTabClick(e, summary.value)}
                  className={`text-xs py-1.5 rounded-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}
                >
                  {summary.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {summaries.map((summary) => (
              <TabsContent key={summary.value} value={summary.value} className="mt-4 text-sm">
                <p className={cn("ml-1", isDark ? "text-gray-300" : "text-gray-700")}>{summary.text}</p>
              </TabsContent>
            ))}
          </Tabs>
        )}
      
        {/* 5. Stats */}
        <div className="flex items-center justify-between text-gray-500 text-sm py-2 mt-4">
            <div className="flex items-center gap-4">
                <button 
                    className={`flex items-center gap-1.5 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Heart className="w-5 h-5" />
                    <span>{post.likes}</span>
                </button>
                <button 
                    className={`flex items-center gap-1.5 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                </button>
                <button 
                    className={`flex items-center gap-1.5 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Repeat2 className="w-5 h-5" />
                    <span>{post.reposts}</span>
                </button>
            </div>
            <div className="flex items-center gap-2">
                <SharePopover>
                  <button className={`flex items-center gap-1.5 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`} onClick={(e) => e.stopPropagation()}>
                    <Share2 className="w-5 h-5" />
                  </button>
                </SharePopover>
                <SaveToCollectionDialog postTitle={post.title} onSaveToggle={setIsBookmarked} theme={theme}>
                    <button className={`transition-colors ${
                        isBookmarked
                          ? isDark ? 'text-cyan-400' : 'text-cyan-600'
                          : isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'
                      }`} onClick={(e) => e.stopPropagation()}>
                      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                </SaveToCollectionDialog>
            </div>
        </div>
      </div>
    </div>
  );
}
