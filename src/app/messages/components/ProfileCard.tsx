
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, UserPlus, Shield, Ban, MoreHorizontal, Calendar, Crown, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  bio?: string;
  joinDate: string;
  roles?: Array<{ name: string; color: string }>;
  badges?: Array<{ name: string; icon: any }>;
  mutualServers?: number;
  mutualFriends?: number;
}

interface ProfileCardProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  isCurrentUser?: boolean;
}

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-yellow-500',
  dnd: 'bg-red-500',
  offline: 'bg-gray-500',
};

const statusLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline',
};

export function ProfileCard({ user, open, onOpenChange, theme, isCurrentUser = false }: ProfileCardProps) {
  const isDark = theme === 'dark';

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-w-md p-0 gap-0 overflow-hidden ${
          isDark 
            ? 'bg-[#131823] border-white/10 text-[#e5e7eb]' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-br from-cyan-500 via-cyan-600 to-cyan-700 relative">
          {/* More options button */}
          {!isCurrentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className={`${
                  isDark 
                    ? 'bg-[#131823] border-white/10 text-[#e5e7eb]' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
                align="end"
              >
                <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
                  <Shield className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mention
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
                  <Ban className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Profile content */}
        <div className="p-4 pt-0">
          {/* Avatar and status */}
          <div className="relative -mt-12 mb-4">
            <div className={`inline-block rounded-full p-1.5 ${
              isDark ? 'bg-[#131823]' : 'bg-white'
            }`}>
              <div className="relative">
                <Avatar className="w-20 h-20 border-4 border-[#131823]">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-2xl">{(user.username || user.displayName || '??').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`absolute bottom-1 right-1 w-5 h-5 ${statusColors[user.status]} rounded-full border-4 ${
                  isDark ? 'border-[#131823]' : 'border-white'
                }`} />
              </div>
            </div>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex gap-2 mt-2">
                {user.badges.map((badge, index) => {
                  const IconComponent = badge.icon;
                  return (
                    <div
                      key={index}
                      className={`p-2 rounded-lg ${
                        isDark 
                          ? 'bg-[#22d3ee]/20 border border-[#22d3ee]/30' 
                          : 'bg-cyan-100 border border-cyan-200'
                      }`}
                      title={badge.name}
                    >
                      <IconComponent className="w-5 h-5 text-[#22d3ee]" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Username and status */}
          <div className={`p-4 rounded-lg mb-3 ${
            isDark ? 'bg-[#0a0e1a] border border-white/10' : 'bg-gray-50 border border-gray-200'
          }`}>
            <DialogHeader className="space-y-1">
              <DialogTitle className={`text-xl ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                {user.displayName || user.username}
              </DialogTitle>
              <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                @{user.username}
              </p>
            </DialogHeader>

            <Separator className={`my-3 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${statusColors[user.status]}`} />
                <span className={`text-sm ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                  {statusLabels[user.status]}
                </span>
              </div>

              {user.customStatus && (
                <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                  {user.customStatus}
                </p>
              )}
            </div>
          </div>

          {/* Roles */}
          {user.roles && user.roles.length > 0 && (
            <div className="mb-3">
              <p className={`text-xs mb-2 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                ROLES
              </p>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={`border ${
                      isDark 
                        ? `bg-${role.color}-500/20 text-${role.color}-300 border-${role.color}-500/30` 
                        : `bg-${role.color}-100 text-${role.color}-700 border-${role.color}-300`
                    }`}
                    style={{
                      backgroundColor: isDark ? `${role.color}33` : `${role.color}1a`,
                      borderColor: isDark ? `${role.color}4d` : `${role.color}66`,
                      color: isDark ? `${role.color}` : role.color,
                    }}
                  >
                    {role.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {user.bio && (
            <div className="mb-3">
              <p className={`text-xs mb-2 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                ABOUT ME
              </p>
              <p className={`text-sm ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                {user.bio}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mb-4">
            <p className={`text-xs mb-2 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
              MEMBER DETAILS
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`} />
                <span className={`text-sm ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                  Joined {user.joinDate}
                </span>
              </div>
              {user.mutualServers !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className={`w-4 h-4 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                    {user.mutualServers} mutual server{user.mutualServers !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {user.mutualFriends !== undefined && (
                <div className="flex items-center gap-2">
                  <UserPlus className={`w-4 h-4 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                    {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          {!isCurrentUser && (
            <div className="flex gap-2">
              <Button 
                className={`flex-1 ${
                  isDark 
                    ? 'bg-[#22d3ee] hover:bg-cyan-500 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button 
                variant="outline"
                className={`flex-1 ${
                  isDark 
                    ? 'border-white/10 text-[#e5e7eb] hover:bg-white/10 hover:text-white' 
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper component for clickable user elements
interface UserTriggerProps {
  user: UserProfile;
  children: React.ReactNode;
  theme: 'light' | 'dark';
  className?: string;
}

export function UserProfileTrigger({ user, children, theme, className = '' }: UserTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div 
        onClick={() => setOpen(true)} 
        className={`cursor-pointer ${className}`}
      >
        {children}
      </div>
      <ProfileCard 
        user={user} 
        open={open} 
        onOpenChange={setOpen} 
        theme={theme}
      />
    </>
  );
}
