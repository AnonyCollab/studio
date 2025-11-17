
'use client';

import { useState } from "react";
import Link from 'next/link';
import { Search, Plus, Bell, SlidersHorizontal, Shield, Home, Compass, Newspaper, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";

interface TopNavProps {
  onCreatePost?: () => void;
  onToggleFilter?: () => void;
  theme?: "light" | "dark";
  onToggleTheme?: () => void;
}

export function TopNav({ onCreatePost, onToggleFilter, theme = "dark", onToggleTheme }: TopNavProps) {
  const isDark = theme === "dark";
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  return (
    <nav className={`sticky top-0 z-50 h-[var(--header-height)] flex items-center ${isDark ? "bg-[#0a0e1a] border-b border-white/10" : "bg-white border-b border-gray-200"}`}>
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 flex items-center justify-between gap-6 w-full">

        {/* Mobile View */}
        <div className="flex md:hidden items-center justify-between w-full">
          {isSearchActive ? (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className={`pl-10 pr-4 h-9 ${
                    isDark 
                      ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10" 
                      : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200"
                  }`}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleFilter}
                className={`p-2 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchActive(false)}
                className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSearchActive(true)}
                  className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}
                >
                  <Search className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onCreatePost}
                  className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
              
              <Link href="/posts" className="absolute left-1/2 -translate-x-1/2">
                 <Shield className={`w-6 h-6 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
              </Link>

              <div className="flex items-center gap-1">
                <Link href="/notifications">
                  <button className={`relative p-2 transition-colors rounded-full ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className={`w-56 ${isDark ? "bg-[#1a1f2e] border-white/10" : "bg-white border-gray-200"}`}>
                    <DropdownMenuLabel className={isDark ? "text-gray-300" : "text-gray-700"}>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                    <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Profile</DropdownMenuItem>
                    <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Settings</DropdownMenuItem>
                    {onToggleTheme && (
                      <>
                        <div className="px-2 py-1">
                          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        </div>
                        <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                      </>
                    )}
                    <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between gap-6 w-full">
          <div className="flex items-center gap-8">
             <Link href="/posts" className="flex items-center gap-2">
              <Shield className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
              <span className={`tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>AnonyCollab</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <a href="#" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}`}>
                <Home className="w-4 h-4" />
                Home
              </a>
              <a href="#" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                <Compass className="w-4 h-4" />
                Discover
              </a>
              <a href="#" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                <Newspaper className="w-4 h-4" />
                News
              </a>
              <a href="#" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                <MessageSquare className="w-4 h-4" />
                Messages
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-2xl">
            <button 
              className={`p-2 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              onClick={onToggleFilter}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search..."
                className={`pl-10 pr-4 ${
                  isDark 
                    ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10" 
                    : "bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200"
                }`}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`relative p-2 transition-colors rounded-full ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-80 ${isDark ? "bg-[#1a1f2e] border-white/10" : "bg-white border-gray-200"}`}>
                <DropdownMenuLabel className={isDark ? "text-gray-300" : "text-gray-700"}>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                <DropdownMenuItem className={`flex items-start gap-3 ${isDark ? 'text-gray-300 focus:bg-white/5' : 'text-gray-700 focus:bg-gray-100'}`}>
                  <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>New comment</p>
                    <p className="text-xs text-gray-500">You have a new comment on your post "Modern Architecture".</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className={`flex items-start gap-3 ${isDark ? 'text-gray-300 focus:bg-white/5' : 'text-gray-700 focus:bg-gray-100'}`}>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=jessica" />
                    <AvatarFallback>JW</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={isDark ? 'text-white' : 'text-gray-900'}>Jessica Wu followed you</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                 <DropdownMenuItem asChild>
                    <Link href="/notifications" className={`flex items-center justify-center text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'}`}>
                      View all notifications
                    </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              className={`gap-2 ${isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}`}
              onClick={onCreatePost}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Post</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-56 ${isDark ? "bg-[#1a1f2e] border-white/10" : "bg-white border-gray-200"}`}>
                <DropdownMenuLabel className={isDark ? "text-gray-300" : "text-gray-700"}>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Profile</DropdownMenuItem>
                <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Settings</DropdownMenuItem>
                <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Saved Posts</DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                {onToggleTheme && (
                  <>
                    <div className="px-2 py-1">
                      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    </div>
                    <DropdownMenuSeparator className={isDark ? "bg-white/10" : "bg-gray-200"} />
                  </>
                )}
                <DropdownMenuItem className={isDark ? "text-gray-300 focus:bg-white/5 focus:text-white" : "text-gray-700 focus:bg-gray-100 focus:text-gray-900"}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
