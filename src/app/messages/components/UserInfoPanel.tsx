

'use client';

import { Settings, Sun, Moon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfileCard } from './ProfileCard';
import { useUser, useAuth } from '@/firebase';
import type { Theme } from '@/context/ThemeContext';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserInfoPanelProps {
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

export function UserInfoPanel({ theme, onSetTheme }: UserInfoPanelProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const isDark = theme === 'dark';
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  
  if (isUserLoading || !user) {
    // Render a skeleton or loading state while user data is being fetched
    return (
      <div className={`absolute bottom-0 left-0 w-[25rem] h-16 z-10 flex-shrink-0 ${
        isDark ? 'bg-[#131823] border-t border-r border-white/10' : 'bg-white border-t border-r border-gray-200'
      }`}>
        {/* You can put a skeleton loader here */}
      </div>
    );
  }

  // Use live user data directly
  const currentUserForCard = {
    id: user.uid,
    username: user.displayName || 'user',
    displayName: user.displayName || 'User',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    status: 'online' as const,
    joinDate: user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A',
  };
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };


  return (
    <>
      <div className={`absolute bottom-0 left-0 w-[25rem] h-16 z-10 flex-shrink-0 ${
        isDark ? 'bg-[#131823] border-t border-r border-white/10' : 'bg-white border-t border-r border-gray-200'
      }`}>
        <div className="h-full px-3 flex items-center justify-between gap-2">
          <div 
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:bg-white/5 rounded-lg p-1 -ml-1 transition-all"
            onClick={() => setProfileOpen(true)}
          >
            <div className="relative">
              <Avatar className={`w-10 h-10 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{(user.displayName || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ${
                isDark ? 'border-2 border-[#131823]' : 'border-2 border-white'
              }`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm truncate ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{user.displayName}</p>
              <p className={`text-xs truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>Online</p>
            </div>
          </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`p-2 rounded-lg transition-all ${
                isDark 
                  ? 'bg-[#131823] border border-white/10 text-white/70 hover:text-[#22d3ee] hover:bg-white/10' 
                  : 'bg-gray-100 border border-gray-200 text-gray-600 hover:text-cyan-600 hover:bg-gray-200'
              }`}>
                <Settings className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={`w-56 ${
                isDark 
                  ? 'bg-[#131823] border-white/10 text-[#e5e7eb]' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
              align="end"
              side="top"
            >
              <DropdownMenuItem 
                onClick={() => onSetTheme(isDark ? 'light' : 'dark')}
                className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 mr-2 text-yellow-400" />
                    Switch to Light Theme
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 mr-2 text-indigo-600" />
                    Switch to Dark Theme
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
              <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
                User Settings
              </DropdownMenuItem>
              <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
                Privacy & Safety
              </DropdownMenuItem>
              <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
                Notification Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
               >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <ProfileCard 
      user={currentUserForCard}
      open={profileOpen}
      onOpenChange={setProfileOpen}
      theme={theme}
      isCurrentUser={true}
    />
    </>
  );
}
