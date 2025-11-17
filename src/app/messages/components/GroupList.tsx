import { useState } from 'react';
import { Users2, Search, PlusCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { mockGroups } from '../data/mockGroups';

interface GroupListProps {
  theme: 'light' | 'dark';
  onSelectGroup: (id: string) => void;
}

export function GroupList({ theme, onSelectGroup }: GroupListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const isDark = theme === 'dark';

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`h-12 px-6 flex items-center gap-4 ${
        isDark ? 'bg-[#131823] border-b border-white/10' : 'bg-white border-b border-gray-200'
      }`}>
        <Users2 className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
        <span className={isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}>Groups</span>
        <div className={`w-px h-6 ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Search and New Group */}
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className={`pl-10 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                  : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
              }`}
            />
          </div>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
            isDark 
              ? 'bg-[#22d3ee]/20 text-[#22d3ee] hover:bg-[#22d3ee]/30' 
              : 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200'
          }`}>
            <PlusCircle className="w-4 h-4" />
            New Group
          </button>
        </div>

        {/* Groups list */}
        <ScrollArea className="flex-1">
          <div className="px-6 pb-4 space-y-2">
            <p className={`text-xs uppercase tracking-wider mb-2 ${
              isDark ? 'text-[#94a3b8]' : 'text-gray-500'
            }`}>
              {filteredGroups.length} Groups
            </p>
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className={`p-3 rounded-xl flex items-center gap-3 transition-all group cursor-pointer ${
                  isDark 
                    ? 'bg-[#131823] border border-white/10 hover:bg-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
                    : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-cyan-500/50 hover:shadow-lg'
                }`}
              >
                <div className="relative">
                  <Avatar className={`w-12 h-12 rounded-lg ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                    <AvatarImage src={group.avatar} />
                    <AvatarFallback>{group.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`truncate font-semibold ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
                    {group.name}
                  </p>
                  <p className={`text-sm truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                    {group.memberCount} members
                  </p>
                </div>
                {group.unread > 0 && (
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDark ? 'bg-[#22d3ee] text-white' : 'bg-cyan-600 text-white'
                  }`}>
                    {group.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
