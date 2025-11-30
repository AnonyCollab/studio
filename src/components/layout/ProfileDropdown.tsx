
'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
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
  Check,
  Palette
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { Theme } from '@/context/ThemeContext';

interface ProfileDropdownProps {
  theme?: Theme;
  onSetTheme?: (theme: Theme) => void;
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

const themeOptions: { name: Theme; color: string; isLight: boolean }[] = [
    { name: 'light', color: '#f8fafc', isLight: true },
    { name: 'dark', color: '#09090b', isLight: false },
];


const DropdownContent = ({ theme, onSetTheme, user }: ProfileDropdownProps & { user: any }) => {
  const isDark = theme === 'dark';
  const itemClass = isDark
    ? 'text-gray-300 focus:bg-white/5 focus:text-white'
    : 'text-gray-700 focus:bg-gray-100 focus:text-gray-900';
  const separatorClass = isDark ? 'bg-white/10' : 'bg-gray-200';
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <>
      <DropdownMenuLabel
        className={isDark ? 'text-gray-300' : 'text-gray-700'}
      >
        {user ? user.displayName : 'My Account'}
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
        {onSetTheme && theme && (
          <>
            <DropdownMenuSub>
                <DropdownMenuSubTrigger className={itemClass}>
                    <Palette />
                    Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                    <DropdownMenuSubContent
                         className={`w-40 ${
                            isDark
                            ? 'bg-popover border-white/10'
                            : 'bg-popover border-gray-200'
                        }`}
                    >
                        {themeOptions.map(t => (
                            <DropdownMenuItem key={t.name} onClick={() => onSetTheme(t.name as Theme)} className={itemClass}>
                                <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: t.color, borderColor: t.isLight ? '#e2e8f0' : '#475569' }} />
                                {t.name}
                                {theme === t.name && <Check className="ml-auto h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator className={separatorClass} />
          </>
      )}
      <DropdownMenuItem className={itemClass} onClick={handleLogout}>
        <LogOut />
        Log out
      </DropdownMenuItem>
    </>
  );
};

const MobileMenu = ({
  isOpen,
  theme,
  onSetTheme,
}: { isOpen: boolean } & ProfileDropdownProps) => {
  const isDark = theme === 'dark';
  const itemClass = `flex items-center justify-between w-full p-4 text-lg ${
    isDark ? 'text-gray-300' : 'text-gray-700'
  }`;
  const separatorClass = `mx-4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`;
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
           {onSetTheme && theme && (
            <div className={`${itemClass} flex-col items-start gap-4`}>
              <span>Theme</span>
                <div className="flex flex-wrap gap-3">
                    {themeOptions.map(t => (
                        <button key={t.name} onClick={() => onSetTheme(t.name as Theme)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${theme === t.name ? 'ring-2 ring-cyan-500 scale-110 border-cyan-500' : 'border-transparent opacity-70'}`} style={{ backgroundColor: t.color }}>
                            {theme === t.name && <Check size={16} className={t.isLight ? 'text-black' : 'text-white'} />}
                        </button>
                    ))}
                </div>
            </div>
          )}
          <Separator className={separatorClass} />
          <button className={itemClass} onClick={handleLogout}>
            <span>Log Out</span>
            <LogOut />
          </button>
        </div>
      </ScrollArea>
    </div>
  );
};

export function ProfileDropdown({ theme, onSetTheme: onSetThemeProp }: ProfileDropdownProps) {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isDark = theme === 'dark';
  const userAvatar = user?.photoURL;
  const userInitials = user?.displayName ? user.displayName.charAt(0) : "U";
  
  const onSetTheme = onSetThemeProp;

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <HamburgerIcon isOpen={true} />
          ) : (
            <Avatar className="w-8 h-8">
              <AvatarImage src={userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          )}
        </Button>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          theme={theme}
          onSetTheme={onSetTheme}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-background">
          <Avatar className="w-9 h-9">
             <AvatarImage src={userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'} />
             <AvatarFallback>{userInitials}</AvatarFallback>
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
        <DropdownContent user={user} theme={theme} onSetTheme={onSetTheme} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
