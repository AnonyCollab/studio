'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  Bookmark,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ThemeToggle } from '@/app/posts/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';

interface ProfileDropdownProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

const HamburgerIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="relative w-5 h-5">
    <span
      className={`absolute h-0.5 w-full bg-current transition-all duration-300 ease-in-out ${
        isOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[20%] '
      }`}
    />
    <span
      className={`absolute h-0.5 w-full bg-current transition-all duration-300 ease-in-out ${
        isOpen ? 'opacity-0' : 'top-1/2 -translate-y-1/2'
      }`}
    />
    <span
      className={`absolute h-0.5 w-full bg-current transition-all duration-300 ease-in-out ${
        isOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[20%]'
      }`}
    />
  </div>
);

const DropdownContent = ({ theme, onToggleTheme }: ProfileDropdownProps) => {
  const isDark = theme === 'dark';
  const itemClass = isDark
    ? 'text-gray-300 focus:bg-white/5 focus:text-white'
    : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900';
  const separatorClass = isDark ? 'bg-white/10' : 'bg-gray-200';

  return (
    <>
      <DropdownMenuLabel
        className={isDark ? 'text-gray-300' : 'text-gray-700'}
      >
        My Account
      </DropdownMenuLabel>
      <DropdownMenuSeparator className={separatorClass} />
      <DropdownMenuItem className={itemClass}>
        <User />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem className={itemClass}>
        <Settings />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem className={itemClass}>
        <Bookmark />
        Saved Posts
      </DropdownMenuItem>
      <DropdownMenuSeparator className={separatorClass} />
      {onToggleTheme && (
        <>
          <div className="px-2 py-1">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <DropdownMenuSeparator className={separatorClass} />
        </>
      )}
      <DropdownMenuItem className={itemClass}>
        <LogOut />
        Log out
      </DropdownMenuItem>
    </>
  );
};

const MobileMenu = ({
  isOpen,
  theme,
  onToggleTheme,
}: { isOpen: boolean } & ProfileDropdownProps) => {
  const isDark = theme === 'dark';
  const itemClass = `flex items-center justify-between w-full p-4 text-lg ${
    isDark ? 'text-gray-300' : 'text-gray-700'
  }`;
  const separatorClass = `mx-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`;

  return (
    <div
      className={`absolute top-[var(--header-height)] left-0 w-full h-[calc(100vh-var(--header-height))] bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out ${
        isOpen
          ? 'opacity-100 visible'
          : 'opacity-0 invisible h-0'
      }`}
    >
      <ScrollArea className="h-full">
        <div className="py-4">
          <button className={itemClass}>
            <span>Profile</span>
            <ChevronRight />
          </button>
          <Separator className={separatorClass} />
          <button className={itemClass}>
            <span>Settings</span>
            <ChevronRight />
          </button>
          <Separator className={separatorClass} />
          <button className={itemClass}>
            <span>Saved Posts</span>
            <ChevronRight />
          </button>
          <Separator className={separatorClass} />
          {onToggleTheme && (
            <div className={itemClass}>
              <span>Theme</span>
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white/10"
              >
                {isDark ? (
                  <Sun className="text-yellow-400" />
                ) : (
                  <Moon className="text-indigo-500" />
                )}
              </button>
            </div>
          )}
          <Separator className={separatorClass} />
          <button className={itemClass}>
            <span>Log Out</span>
            <LogOut />
          </button>
        </div>
      </ScrollArea>
    </div>
  );
};

export function ProfileDropdown({ theme, onToggleTheme }: ProfileDropdownProps) {
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isDark = theme === 'dark';

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <HamburgerIcon isOpen={true} />
          ) : (
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </Button>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-background">
          <Avatar className="w-9 h-9">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`w-56 ${
          isDark
            ? 'bg-popover border-white/10'
            : 'bg-popover border-gray-200'
        }`}
      >
        <DropdownContent theme={theme} onToggleTheme={onToggleTheme} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
