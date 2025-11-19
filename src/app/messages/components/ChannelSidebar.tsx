
import { Hash, Volume2, ChevronDown, ChevronRight, Lock, Plus, Settings } from 'lucide-react';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const serverData: Record<string, any> = {
  server1: {
    name: 'Gaming Squad',
    sections: [
      {
        name: 'TEXT CHANNELS',
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'memes', name: 'memes', type: 'text' },
          { id: 'game-chat', name: 'game-chat', type: 'text' },
          { id: 'announcements', name: 'announcements', type: 'text', locked: true },
        ],
      },
      {
        name: 'VOICE CHANNELS',
        channels: [
          { id: 'lobby', name: 'Lobby', type: 'voice' },
          { id: 'gaming-room-1', name: 'Gaming Room 1', type: 'voice' },
          { id: 'gaming-room-2', name: 'Gaming Room 2', type: 'voice' },
        ],
      },
    ],
  },
  server2: {
    name: 'Music Lovers',
    sections: [
      {
        name: 'TEXT CHANNELS',
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'share-music', name: 'share-music', type: 'text' },
          { id: 'playlist-ideas', name: 'playlist-ideas', type: 'text' },
        ],
      },
      {
        name: 'VOICE CHANNELS',
        channels: [
          { id: 'listening-party', name: 'Listening Party', type: 'voice' },
          { id: 'chill-zone', name: 'Chill Zone', type: 'voice' },
        ],
      },
    ],
  },
  server3: {
    name: 'Developers',
    sections: [
      {
        name: 'TEXT CHANNELS',
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'code-help', name: 'code-help', type: 'text' },
          { id: 'project-showcase', name: 'project-showcase', type: 'text' },
          { id: 'resources', name: 'resources', type: 'text' },
        ],
      },
      {
        name: 'VOICE CHANNELS',
        channels: [
          { id: 'pair-programming', name: 'Pair Programming', type: 'voice' },
          { id: 'code-review', name: 'Code Review', type: 'voice' },
        ],
      },
    ],
  },
  server4: {
    name: 'Friends',
    sections: [
      {
        name: 'TEXT CHANNELS',
        channels: [
          { id: 'general', name: 'general', type: 'text' },
          { id: 'random', name: 'random', type: 'text' },
        ],
      },
      {
        name: 'VOICE CHANNELS',
        channels: [
          { id: 'hangout', name: 'Hangout', type: 'voice' },
        ],
      },
    ],
  },
};

interface ChannelSidebarProps {
  serverId: string;
  selectedChannel: string | null;
  onSelectChannel: (id: string) => void;
  theme: 'light' | 'dark';
}

export function ChannelSidebar({ serverId, selectedChannel, onSelectChannel, theme }: ChannelSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const server = serverData[serverId];
  const isDark = theme === 'dark';

  if (!server) return null;

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className={`w-80 flex-shrink-0 flex flex-col ${isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
      {/* Server header with dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={`h-12 px-4 flex items-center justify-between cursor-pointer transition-colors ${
            isDark 
              ? 'bg-[#131823] border-b border-white/10 hover:bg-white/5' 
              : 'bg-white border-b border-gray-200 hover:bg-gray-50'
          }`}>
            <span className={`truncate ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{server.name}</span>
            <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-gray-600'}`} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={`w-56 ${
            isDark 
              ? 'bg-[#131823] border-white/10 text-[#e5e7eb]' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
          align="start"
        >
          <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
          <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
            Change Icon
          </DropdownMenuItem>
          <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
            Notification Settings
          </DropdownMenuItem>
          <DropdownMenuItem className={isDark ? 'focus:bg-white/10 focus:text-white' : 'focus:bg-gray-100'}>
            Privacy Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {server.sections.map((section: any) => (
            <div key={section.name}>
              <button
                onClick={() => toggleSection(section.name)}
                className={`w-full flex items-center justify-between px-2 py-1 group rounded transition-colors ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                }`}
              >
                <span className={`text-xs tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                  {section.name}
                </span>
                {collapsedSections[section.name] ? (
                  <ChevronRight className={`w-3 h-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                ) : (
                  <ChevronDown className={`w-3 h-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                )}
              </button>

              {!collapsedSections[section.name] && (
                <div className="mt-1 space-y-0.5">
                  {section.channels.map((channel: any) => {
                    const isSelected = selectedChannel === channel.id;
                    const Icon = channel.type === 'voice' ? Volume2 : Hash;

                    return (
                      <button
                        key={channel.id}
                        onClick={() => onSelectChannel(channel.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded group transition-all ${
                          isSelected
                            ? isDark
                              ? 'bg-[#131823] border border-[#22d3ee]/50 shadow-[0_0_20px_rgba(34,211,238,0.15)] text-white'
                              : 'bg-white border border-cyan-500/50 shadow-lg text-gray-900'
                            : isDark
                            ? 'text-white/70 hover:bg-white/5 hover:text-white border border-transparent'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate flex-1 text-left">{channel.name}</span>
                        {channel.locked && <Lock className={`w-3 h-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />}
                        {!isSelected && (
                          <Plus className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
