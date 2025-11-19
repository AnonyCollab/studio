
'use client';

import { Home, Compass, Newspaper, MessageSquare } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  theme?: "light" | "dark";
}

export function BottomNav({ theme = "dark" }: BottomNavProps) {
  const pathname = usePathname();
  const isDark = theme === "dark";

  const navItems = [
    { href: "/posts", icon: Home, label: "Home" },
    { href: "/discover", icon: Compass, label: "Discover" },
    { href: "/news", icon: Newspaper, label: "News" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
  ];

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 h-16 border-t md:hidden z-50",
      isDark ? "bg-background/80 backdrop-blur-sm border-white/10" : "bg-background/80 backdrop-blur-sm border-gray-200"
    )}>
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1">
              <Icon className={cn(
                "w-6 h-6 transition-colors",
                isActive 
                  ? (isDark ? "text-cyan-400" : "text-cyan-600")
                  : (isDark ? "text-gray-400" : "text-gray-500")
              )} />
              <span className={cn(
                "text-xs transition-colors",
                 isActive 
                  ? (isDark ? "text-cyan-400" : "text-cyan-600")
                  : (isDark ? "text-gray-400" : "text-gray-500")
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
