
'use client';
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Minus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Article } from '../data';
import { SaveToCollectionDialog } from "@/app/posts/components/SaveToCollectionDialog";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
  theme: "light" | "dark";
  onClick: () => void;
}

export function ArticleCard({
  article,
  theme,
  onClick,
}: ArticleCardProps) {
  const { title, description, authorName, authorImage, date, readTime, image, category, featured } = article;
  const isDark = theme === "dark";
  const [isBookmarked, setIsBookmarked] = useState(false);


  if (featured) {
    return (
      <article onClick={onClick} className={`mb-12 pb-12 ${isDark ? "border-white/5" : "border-gray-100"} border-b cursor-pointer group`}>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <Badge 
              variant="outline" 
              className={`mb-4 ${
                isDark 
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
                  : "bg-cyan-100 text-cyan-700 border-cyan-300"
              }`}
            >
              {category}
            </Badge>
            <h2 className={`text-2xl font-bold group-hover:opacity-80 transition-opacity mb-3 ${
              isDark ? "text-[#e5e7eb]" : "text-gray-900"
            }`}>
              {title}
            </h2>
            <p className={`mb-6 ${isDark ? "text-[#94a3b8]" : "text-gray-600"}`}>
              {description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={authorImage} alt={authorName} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className={isDark ? "text-[#e5e7eb]" : "text-gray-900"}>{authorName}</p>
                  <p className={isDark ? "text-[#6b7280]" : "text-gray-500"}>
                    {date} · {readTime}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </Button>
                <SaveToCollectionDialog postTitle={title} onSaveToggle={setIsBookmarked} theme={theme}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      isBookmarked
                        ? isDark
                          ? "text-cyan-400"
                          : "text-cyan-600"
                        : isDark
                        ? "hover:bg-white/5 hover:text-cyan-400"
                        : "hover:bg-gray-100 hover:text-cyan-600"
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </SaveToCollectionDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${
                        isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                      }`}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end"
                    className={`${
                      isDark 
                        ? "bg-[#1a1f2e] border-white/10 text-[#e5e7eb]" 
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                  >
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                      <Minus className="w-4 h-4 mr-2" />
                      Show less like this
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                      Unfollow author
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                      Unfollow publication
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                      Mute author
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                      Mute publication
                    </DropdownMenuItem>
                    <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#ef4444]" : "hover:bg-gray-100 focus:bg-gray-100 text-red-600"}`}>
                      Report story...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="md:w-[300px] h-[200px] md:h-auto flex-shrink-0">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover rounded-lg group-hover:brightness-90 transition-all"
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article onClick={onClick} className={`mb-10 pb-10 ${isDark ? "border-white/5" : "border-gray-100"} border-b last:border-b-0 cursor-pointer group`}>
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={article.authorImage} alt={article.authorName} />
              <AvatarFallback>{article.authorName[0]}</AvatarFallback>
            </Avatar>
            <span className={isDark ? "text-[#e5e7eb]" : "text-gray-900"}>{article.authorName}</span>
          </div>
          
          <h3 className={`text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity ${
            isDark ? "text-[#e5e7eb]" : "text-gray-900"
          }`}>
            {title}
          </h3>
          <p className={`mb-4 line-clamp-2 ${isDark ? "text-[#94a3b8]" : "text-gray-600"}`}>
            {description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${isDark ? "text-[#6b7280]" : "text-gray-500"}`}>
              <Badge 
                variant="secondary" 
                className={isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
              >
                {category}
              </Badge>
              <span>{date}</span>
              <span>·</span>
              <span>{readTime}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                }`}
              >
                <Minus className="w-5 h-5" />
              </Button>
              <SaveToCollectionDialog postTitle={title} onSaveToggle={setIsBookmarked} theme={theme}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    isBookmarked
                      ? isDark
                        ? "text-cyan-400"
                        : "text-cyan-600"
                      : isDark
                      ? "hover:bg-white/5 hover:text-cyan-400"
                      : "hover:bg-gray-100 hover:text-cyan-600"
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </SaveToCollectionDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                    }`}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className={`${
                    isDark 
                      ? "bg-[#1a1f2e] border-white/10 text-[#e5e7eb]" 
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                >
                  <DropdownMenuItem className={`${isDark ? "hover:bg-white/5 focus:bg-white/5 text-[#e5e7eb]" : "hover:bg-gray-100 focus:bg-gray-100 text-gray-900"}`}>
                    <Minus className="w-4 h-4 mr-2" />
                    Show less like this
                  </DropdownMenuItem>
                  {/* ... other menu items ... */}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded-lg group-hover:brightness-90 transition-all"
          />
        </div>
      </div>
    </article>
  );
}
