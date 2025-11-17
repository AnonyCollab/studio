
'use client';

import { useState } from "react";
import Link from 'next/link';
import { Search, Plus, Bell, SlidersHorizontal, Shield, Home, Compass, Newspaper, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";

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
    <nav style={{ '--header-height': '3.5rem' } as React.CSSProperties} className={`sticky top-0 z-50 h-[var(--header-height)] flex items-center ${isDark ? "bg-background/80 backdrop-blur-sm border-b border-white/10" : "bg-background/80 backdrop-blur-sm border-b border-gray-200"}`}>
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 flex items-center justify-between gap-6 w-full">

        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-8">
           <Link href="/posts" className="flex items-center gap-2 flex-shrink-0">
            <Shield className={`w-5 h-5 ${isDark ? "text-cyan-400" : "text-cyan-600"}`} />
            <span className={`hidden sm:inline tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>AnonyCollab</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/posts" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${isDark ? "text-gray-300 hover:text-white hover:bg-white/5" : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"}`}>
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/discover" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <Compass className="w-4 h-4" />
              Discover
            </Link>
            <Link href="/news" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <Newspaper className="w-4 h-4" />
              News
            </Link>
            <Link href="/messages" className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-md ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
          </div>
        </div>

        {/* Search, Actions, and Profile */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xs hidden sm:block">
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
          
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="sm:hidden text-gray-400 hover:text-white">
            <Search className="w-5 h-5" />
          </Button>

          {/* Filter Icon */}
          <Button 
            variant="ghost" 
            size="icon"
            className={`p-2 transition-colors ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
            onClick={onToggleFilter}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>

          {/* Create Post Button */}
          <Button 
            className={`gap-2 ${isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}`}
            onClick={onCreatePost}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create</span>
          </Button>

          {/* Notifications */}
          <button className={`relative p-2 transition-colors rounded-full ${isDark ? "text-gray-400 hover:text-white hover:bg-white/5" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
          </button>

          {/* Profile Dropdown */}
          <ProfileDropdown theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>
    </nav>
  );
}
