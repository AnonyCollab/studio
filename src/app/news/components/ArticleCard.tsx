import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Bookmark, Minus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface ArticleCardProps {
  title: string;
  description: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  featured?: boolean;
  theme: "light" | "dark";
}

export function ArticleCard({
  title,
  description,
  author,
  authorImage,
  date,
  readTime,
  image,
  category,
  featured = false,
  theme,
}: ArticleCardProps) {
  const isDark = theme === "dark";

  if (featured) {
    return (
      <article className={`mb-12 pb-12 ${isDark ? "border-white/5" : "border-gray-100"} border-b`}>
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
            <h2 className={`cursor-pointer hover:opacity-80 transition-opacity mb-3 ${
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
                  <AvatarImage src={authorImage} alt={author} />
                  <AvatarFallback>{author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className={isDark ? "text-[#e5e7eb]" : "text-gray-900"}>{author}</p>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${
                    isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                  }`}
                >
                  <Bookmark className="w-5 h-5" />
                </Button>
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
          
          <div className="md:w-[300px] h-[200px] md:h-auto">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`mb-10 pb-10 ${isDark ? "border-white/5" : "border-gray-100"} border-b last:border-b-0`}>
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={authorImage} alt={author} />
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <span className={isDark ? "text-[#e5e7eb]" : "text-gray-900"}>{author}</span>
          </div>
          
          <h3 className={`mb-2 cursor-pointer hover:opacity-80 transition-opacity ${
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
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${
                  isDark ? "hover:bg-white/5 hover:text-cyan-400" : "hover:bg-gray-100 hover:text-cyan-600"
                }`}
              >
                <Bookmark className="w-5 h-5" />
              </Button>
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
        
        <div className="w-[120px] h-[120px] flex-shrink-0">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </article>
  );
}
