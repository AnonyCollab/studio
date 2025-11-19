
import { MessageSquare, Users, ChevronDown, Plus, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Users2 } from 'lucide-react';

const recentDMs = [
  {
    id: 'dm1',
    user: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    lastMessage: 'Hey, are you free tonight?',
    timestamp: '2m ago',
    unread: 2,
    online: true,
  },
  {
    id: 'dm2',
    user: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    lastMessage: 'Thanks for the help!',
    timestamp: '1h ago',
    unread: 0,
    online: true,
  },
  {
    id: 'dm3',
    user: 'Mike Williams',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    lastMessage: 'See you tomorrow',
    timestamp: '3h ago',
    unread: 0,
    online: false,
  },
  {
    id: 'dm4',
    user: 'Emma Davis',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    lastMessage: 'That sounds great!',
    timestamp: '1d ago',
    unread: 0,
    online: false,
  },
  {
    id: 'dm5',
    user: 'James Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    lastMessage: 'Let me know when you\'re ready',
    timestamp: '2d ago',
    unread: 0,
    online: true,
  },
];

interface DirectMessagesSidebarProps {
  selectedDM: string | null;
  onSelectDM: (id: string) => void;
  onSelectHomeView: (view: 'friends' | 'groups') => void;
  activeView: 'friends' | 'groups' | 'dm' | 'chat';
  theme: 'light' | 'dark';
}

export function DirectMessagesSidebar({ selectedDM, onSelectDM, onSelectHomeView, activeView, theme }: DirectMessagesSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  const filteredDMs = recentDMs.filter(dm =>
    dm.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`w-80 flex-shrink-0 flex flex-col ${isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
      {/* Header */}
      <div className={`h-12 px-4 flex items-center justify-between cursor-pointer transition-colors ${
        isDark 
          ? 'bg-[#131823] border-b border-white/10 hover:bg-white/5' 
          : 'bg-white border-b border-gray-200 hover:bg-gray-50'
      }`}>
        <span className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>Direct Messages</span>
        <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-gray-600'}`} />
      </div>

      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations"
            className={`pl-9 h-8 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
            }`}
          />
        </div>
      </div>

      {/* Friends button */}
      <button
        onClick={() => onSelectHomeView('friends')}
        className={`mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          activeView === 'friends'
            ? isDark
              ? 'bg-[#22d3ee]/20 text-[#22d3ee]'
              : 'bg-cyan-100 text-cyan-700'
            : isDark
            ? 'text-white/70 hover:bg-white/10 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Users className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate flex-1 text-left">Friends</span>
      </button>

      {/* Groups button */}
      <button
        onClick={() => onSelectHomeView('groups')}
        className={`mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          activeView === 'groups'
            ? isDark
              ? 'bg-[#22d3ee]/20 text-[#22d3ee]'
              : 'bg-cyan-100 text-cyan-700'
            : isDark
            ? 'text-white/70 hover:bg-white/10 hover:text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <Users2 className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate flex-1 text-left">Groups</span>
      </button>

      {/* New message button */}
      <button className={`mx-2 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
        isDark 
          ? 'text-white/70 hover:bg-white/10 hover:text-white' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm">New Message</span>
      </button>

      {/* Direct messages list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          <div className={`px-2 py-1 text-xs tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
            DIRECT MESSAGES
          </div>
          {filteredDMs.map((dm) => {
            const isSelected = selectedDM === dm.id;

            return (
              <button
                key={dm.id}
                onClick={() => onSelectDM(dm.id)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg group transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-[#131823] border border-[#22d3ee]/50 shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                      : 'bg-white border border-cyan-500/50 shadow-lg'
                    : isDark
                    ? 'hover:bg-white/5 border border-transparent'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className={`w-8 h-8 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                    <AvatarImage src={dm.avatar} />
                    <AvatarFallback>{dm.user[0]}</AvatarFallback>
                  </Avatar>
                  {dm.online && (
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ${
                      isDark ? 'border-2 border-[#0a0e1a]' : 'border-2 border-white'
                    }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm truncate ${
                      isSelected 
                        ? isDark ? 'text-white' : 'text-gray-900'
                        : isDark ? 'text-[#e5e7eb]' : 'text-gray-900'
                    }`}>
                      {dm.user}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                      {dm.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                      {dm.lastMessage}
                    </p>
                    {dm.unread > 0 && (
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                        isDark ? 'bg-[#22d3ee] text-white' : 'bg-cyan-600 text-white'
                      }`}>
                        {dm.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
