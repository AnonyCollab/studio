
import { useState } from 'react';
import { Users, UserPlus, MessageCircle, MoreVertical, Check, X, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserProfileTrigger } from './ProfileCard';
import { mockUsers } from '../data/mockUsers';

const friendsData = {
  online: [
    {
      id: 'user1',
      name: 'Alice Wonderland',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      status: 'Creating amazing designs',
      statusType: 'game' as const,
    },
    {
      id: 'user2',
      name: 'Bob the Builder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      status: 'Online',
      statusType: 'online' as const,
    },
    {
      id: 'user3',
      name: 'Charlie Notes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      status: 'Listening to some tunes',
      statusType: 'voice' as const,
    },
  ],
  all: [
    {
      id: 'user1',
      name: 'Alice Wonderland',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      status: 'Creating amazing designs',
      statusType: 'game' as const,
    },
    {
      id: 'user2',
      name: 'Bob the Builder',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      status: 'Online',
      statusType: 'online' as const,
    },
    {
      id: 'user3',
      name: 'Charlie Notes',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
      status: 'Listening to some tunes',
      statusType: 'voice' as const,
    },
    {
      id: 'user4',
      name: 'Diana',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
      status: 'Offline',
      statusType: 'offline' as const,
    },
    {
      id: 'user5',
      name: 'Eve',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve',
      status: 'Offline',
      statusType: 'offline' as const,
    },
    {
      id: 'user6',
      name: 'Frank Words',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Frank',
      status: 'Offline',
      statusType: 'offline' as const,
    },
  ],
  pending: [
    {
      id: '7',
      name: 'John Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      type: 'incoming' as const,
    },
    {
      id: '8',
      name: 'Maria Rodriguez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      type: 'incoming' as const,
    },
    {
      id: '9',
      name: 'David Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      type: 'outgoing' as const,
    },
  ],
};

interface FriendsPageProps {
  theme: 'light' | 'dark';
}

export function FriendsPage({ theme }: FriendsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendInput, setNewFriendInput] = useState('');
  const isDark = theme === 'dark';

  return (
    <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`h-12 px-6 flex items-center gap-4 ${
        isDark ? 'bg-[#131823] border-b border-white/10' : 'bg-white border-b border-gray-200'
      }`}>
        <Users className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        <span className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>Friends</span>
        <div className={`w-px h-6 ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="online" className="h-full flex flex-col">
          <div className="px-6 pt-4 bg-[rgba(0,0,0,0)]">
            <TabsList className={`p-1 ${
              isDark ? 'bg-[#131823] border border-white/10' : 'bg-white border border-gray-200'
            }`}>
              <TabsTrigger 
                value="online" 
                className={isDark 
                  ? 'text-[#94a3b8] data-[state=active]:bg-[#22d3ee]/20 data-[state=active]:text-[#22d3ee]' 
                  : 'data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700'
                }
              >
                Online
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className={isDark 
                  ? 'text-[#94a3b8] data-[state=active]:bg-[#22d3ee]/20 data-[state=active]:text-[#22d3ee]' 
                  : 'data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700'
                }
              >
                All
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                className={isDark 
                  ? 'text-[#94a3b8] data-[state=active]:bg-[#22d3ee]/20 data-[state=active]:text-[#22d3ee]' 
                  : 'data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-700'
                }
              >
                Pending
              </TabsTrigger>
              <TabsTrigger 
                value="add"
                className={`${isDark ? 'text-emerald-300' : 'text-emerald-600'} ${
                  isDark 
                    ? 'data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300' 
                    : 'data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700'
                }`}
              >
                Add Friend
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="online" className="flex-1 mt-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="px-6 py-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className={`pl-10 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* Friends list */}
              <ScrollArea className="flex-1">
                <div className="px-6 pb-4 space-y-2">
                  <p className={`text-xs uppercase tracking-wider mb-2 ${
                    isDark ? 'text-[#94a3b8]' : 'text-gray-500'
                  }`}>
                    Online — {friendsData.online.length}
                  </p>
                  {friendsData.online.map((friend) => (
                    <FriendItem key={friend.id} friend={friend} isDark={isDark} theme={theme} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="all" className="flex-1 mt-0 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="px-6 py-4">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search friends..."
                    className={`pl-10 ${
                      isDark 
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                    }`}
                  />
                </div>
              </div>

              {/* Friends list */}
              <ScrollArea className="flex-1">
                <div className="px-6 pb-4 space-y-2">
                  <p className={`text-xs uppercase tracking-wider mb-2 ${
                    isDark ? 'text-[#94a3b8]' : 'text-gray-500'
                  }`}>
                    All Friends — {friendsData.all.length}
                  </p>
                  {friendsData.all.map((friend) => (
                    <FriendItem key={friend.id} friend={friend} isDark={isDark} theme={theme} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="flex-1 mt-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                {/* Incoming requests */}
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                    Incoming — {friendsData.pending.filter(f => f.type === 'incoming').length}
                  </p>
                  {friendsData.pending
                    .filter((f) => f.type === 'incoming')
                    .map((friend) => (
                      <PendingFriendItem key={friend.id} friend={friend} isDark={isDark} />
                    ))}
                </div>

                {/* Outgoing requests */}
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                    Outgoing — {friendsData.pending.filter(f => f.type === 'outgoing').length}
                  </p>
                  {friendsData.pending
                    .filter((f) => f.type === 'outgoing')
                    .map((friend) => (
                      <PendingFriendItem key={friend.id} friend={friend} isDark={isDark} />
                    ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="flex-1 mt-0">
            <div className="px-6 py-8">
              <div className="max-w-2xl">
                <div className={`p-6 rounded-2xl space-y-4 ${
                  isDark 
                    ? 'bg-[#131823] border border-white/10' 
                    : 'bg-white border border-gray-200'
                }`}>
                  <div>
                    <h3 className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>Add Friend</h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                      You can add friends with their username.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newFriendInput}
                      onChange={(e) => setNewFriendInput(e.target.value)}
                      placeholder="Enter a username#0000"
                      className={`flex-1 ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                      }`}
                    />
                    <Button 
                      className={isDark ? 'bg-[#22d3ee] hover:bg-cyan-500 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}
                      disabled={!newFriendInput}
                    >
                      Send Request
                    </Button>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="mt-8">
                  <h4 className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>Suggestions</h4>
                  <div className="space-y-2 mt-4">
                    {[
                      { name: 'Chris Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris', mutualFriends: 3 },
                      { name: 'Nina Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina', mutualFriends: 5 },
                      { name: 'Tom Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', mutualFriends: 2 },
                    ].map((suggestion, i) => (
                      <div key={i} className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
                        isDark 
                          ? 'bg-[#131823] border border-white/10 hover:bg-white/5 hover:border-cyan-400/50' 
                          : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-cyan-500/50'
                      }`}>
                        <Avatar className={`w-12 h-12 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                          <AvatarImage src={suggestion.avatar} />
                          <AvatarFallback>{suggestion.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>{suggestion.name}</p>
                          <p className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                            {suggestion.mutualFriends} mutual friends
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          className={isDark 
                            ? 'bg-white/20 hover:bg-white/30 text-white border-0' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-0'
                          }
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function FriendItem({ friend, isDark, theme }: { friend: any; isDark: boolean; theme: 'light' | 'dark' }) {
  const statusColor = {
    online: 'bg-emerald-500',
    game: 'bg-purple-500',
    voice: 'bg-emerald-500',
    offline: 'bg-gray-500',
  }[friend.statusType];

  const userProfile = mockUsers[friend.id];

  return (
    <div className={`p-3 rounded-xl flex items-center gap-3 transition-all group ${
      isDark 
        ? 'bg-[#131823] border border-white/10 hover:bg-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-cyan-500/50 hover:shadow-lg'
    }`}>
      <UserProfileTrigger user={userProfile} theme={theme}>
        <div className="relative">
          <Avatar className={`w-12 h-12 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
            <AvatarImage src={friend.avatar} />
            <AvatarFallback>{friend.name[0]}</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${statusColor} rounded-full ${
            isDark ? 'border-2 border-[#131823]' : 'border-2 border-white'
          }`} />
        </div>
      </UserProfileTrigger>
      <div className="flex-1 min-w-0">
        <UserProfileTrigger user={userProfile} theme={theme}>
          <p className={`truncate cursor-pointer hover:underline ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{friend.name}</p>
        </UserProfileTrigger>
        <p className={`text-sm truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>{friend.status}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-[#131823] border border-white/10 hover:bg-white/20' 
            : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
        }`}>
          <MessageCircle className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
        <button className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-[#131823] border border-white/10 hover:bg-white/20' 
            : 'bg-gray-100 border border-gray-200 hover:bg-gray-200'
        }`}>
          <MoreVertical className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        </button>
      </div>
    </div>
  );
}

function PendingFriendItem({ friend, isDark }: { friend: any; isDark: boolean }) {
  return (
    <div className={`p-3 rounded-xl flex items-center gap-3 ${
      isDark 
        ? 'bg-[#131823] border border-white/10' 
        : 'bg-white border border-gray-200'
    }`}>
      <Avatar className={`w-12 h-12 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
        <AvatarImage src={friend.avatar} />
        <AvatarFallback>{friend.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={`truncate ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{friend.name}</p>
        <p className={`text-sm ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
          {friend.type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {friend.type === 'incoming' ? (
          <>
            <button className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors">
              <Check className="w-5 h-5 text-white" />
            </button>
            <button className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-[#131823] border border-white/10 hover:bg-red-500/20' 
                : 'bg-gray-100 border border-gray-200 hover:bg-red-100'
            }`}>
              <X className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </>
        ) : (
          <button className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-[#131823] border border-white/10 hover:bg-red-500/20' 
              : 'bg-gray-100 border border-gray-200 hover:bg-red-100'
          }`}>
            <X className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
          </button>
        )}
      </div>
    </div>
  );
}
