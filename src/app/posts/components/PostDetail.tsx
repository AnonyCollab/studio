
'use client';
import { useState, useEffect } from "react";
import { X, Bookmark, Heart, Repeat2, MessageCircle, Share2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommentSection } from "./CommentSection";
import { UserStatsHoverCard } from "./UserStatsHoverCard";
import { SharePopover } from "./SharePopover";
import { SaveToCollectionDialog } from "./SaveToCollectionDialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useFirestore } from "@/firebase";
import { toggleLikePost } from "@/firebase/non-blocking-updates";
import { collection, query, onSnapshot } from "firebase/firestore";

interface PostDetailProps {
  post: {
    id: string;
    author: {
      name: string;
      avatar: string;
    };
    imageUrl?: string;
    title: string;
    tags: string[];
    likes: number;
    comments: number;
    reposts: number;
    timestamp: string;
    problemDetails: string;
    problemSummary?: string;
    whatIveTried: string;
    whatIveTriedSummary?: string;
    expectedOutcome: string;
    expectedOutcomeSummary?: string;
    sector: string;
  };
  onClose: () => void;
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


export function PostDetail({ post, onClose, theme = "dark" }: PostDetailProps) {
  const [activeTab, setActiveTab] = useState("problem");
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const isDark = theme === "dark";
  const currentBadgeColors = isDark ? badgeColors : badgeColorsLight;
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore || !post.id) return;

    const commentsQuery = query(collection(firestore, "posts", post.id, "comments"));
    
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      setCommentCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [firestore, post.id]);


  const handleLike = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (firestore) {
      toggleLikePost(firestore, post.id, isLiked);
    }
  };

  const Callout = ({ text, theme }: { text?: string, theme: "light" | "dark" }) => {
    if (!text) return null;
    const isDark = theme === "dark";
    return (
      <div className={cn("flex items-start gap-3 rounded-lg p-4 mb-4 border", isDark ? "bg-cyan-900/20 border-cyan-400/20" : "bg-cyan-50 border-cyan-200")}>
        <Info className={cn("w-5 h-5 shrink-0 mt-0.5", isDark ? "text-cyan-400" : "text-cyan-600")} />
        <p className={cn("text-sm", isDark ? "text-cyan-200" : "text-cyan-800")}>{text}</p>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${isDark ? "bg-[#0a0e1a]" : "bg-gray-50"}`}>
      {/* Header with close button */}
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <UserStatsHoverCard author={post.author} theme={theme} />
          <div>
            <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{post.author.name}</span>
            <span className="text-xs text-gray-500 ml-2">{post.timestamp}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SaveToCollectionDialog postTitle={post.title} onSaveToggle={setIsBookmarked} theme={theme}>
             <Button
                variant="ghost"
                size="icon"
                className={`${
                  isBookmarked
                    ? isDark ? 'text-cyan-400 bg-cyan-400/10' : 'text-cyan-600 bg-cyan-100'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
          </SaveToCollectionDialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Post Content */}
        <div className="p-4 md:p-6">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <Badge
                key={`${post.id}-${tag}`}
                variant="outline"
                className={`text-xs ${currentBadgeColors[index % currentBadgeColors.length]} border`}
              >
                #{tag.toLowerCase().replace(/\s+/g, "")}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className={`text-2xl mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>{post.title}</h1>
          
          {post.imageUrl && (
             <Carousel className="w-full max-w-full my-4">
              <CarouselContent>
                {/* For now, we only have one image, but this is ready for more */}
                <CarouselItem>
                  <div className="p-1">
                    <div className="aspect-video relative">
                      <Image 
                        src={post.imageUrl} 
                        alt={post.title} 
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </CarouselItem>
                {/* You can add more CarouselItems here if post has an array of images */}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
           )}

          {/* Tabs for content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className={`grid w-full grid-cols-3 border mb-4 ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
              <TabsTrigger
                value="problem"
                className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}
              >
                Problem
              </TabsTrigger>
              <TabsTrigger
                value="tried"
                className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}
              >
                Tried
              </TabsTrigger>
              <TabsTrigger
                value="outcome"
                className={`text-sm ${isDark ? "text-gray-400 data-[state=active]:bg-white/10 data-[state=active]:text-white" : "text-gray-600 data-[state=active]:bg-white data-[state=active]:text-gray-900"}`}
              >
                Outcome
              </TabsTrigger>
            </TabsList>

            <div className={`rounded-lg p-5 border min-h-[150px] ${isDark ? "bg-[#131823] border-white/10" : "bg-white border-gray-200"}`}>
                <TabsContent value="problem">
                    <Callout text={post.problemSummary} theme={theme} />
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{post.problemDetails || "No details provided."}</p>
                </TabsContent>
                <TabsContent value="tried">
                    <Callout text={post.whatIveTriedSummary} theme={theme} />
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{post.whatIveTried || "No details provided."}</p>
                </TabsContent>
                <TabsContent value="outcome">
                    <Callout text={post.expectedOutcomeSummary} theme={theme} />
                    <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{post.expectedOutcome || "No details provided."}</p>
                </TabsContent>
            </div>
          </Tabs>

            {/* Engagement Stats */}
            <div className={`flex items-center gap-6 pt-4 mt-6 border-t ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <button
                onClick={handleLike}
                className={cn("flex items-center gap-2 transition-colors",
                isLiked ? "text-red-400" : isDark ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-500"
                )}
            >
                <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                <span>{post.likes} <span className="hidden sm:inline">Likes</span></span>
            </button>
            <button className={`flex items-center gap-2 transition-colors ${isDark ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
                <Repeat2 className="w-5 h-5" />
                <span>{post.reposts} <span className="hidden sm:inline">Reposts</span></span>
            </button>
            <button className={`flex items-center gap-2 transition-colors ${isDark ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
                <MessageCircle className="w-5 h-5" />
                <span>{commentCount} <span className="hidden sm:inline">Comments</span></span>
            </button>
            <SharePopover>
                <button className={`flex items-center gap-2 ml-auto transition-colors ${isDark ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
                <Share2 className="w-5 h-5" />
                </button>
            </SharePopover>
            </div>

            {/* Metadata Grid */}
             <div className="grid grid-cols-2 gap-4 mt-6">
                <div className={`rounded-lg p-4 border ${isDark ? "bg-[#131823] border-white/10" : "bg-gray-100 border-gray-200"}`}>
                  <h4 className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Sector:</h4>
                  <p className={`text-sm capitalize ${isDark ? "text-white" : "text-gray-900"}`}>{post.sector}</p>
                </div>
                <div className={`rounded-lg p-4 border ${isDark ? "bg-[#131823] border-white/10" : "bg-gray-100 border-gray-200"}`}>
                  <h4 className={`text-sm mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>NAICS Code:</h4>
                  <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>2111</p>
                </div>
              </div>
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} theme={theme} />
      </div>
    </div>
  );
}
