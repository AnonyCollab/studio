

'use client';
import { Hash, Volume2, ChevronDown, ChevronRight, Lock, Plus, Settings } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  locked?: boolean;
}

interface ChannelSidebarProps {
  serverId: string;
  selectedChannel: string | null;
  onSelectChannel: (id: string) => void;
  theme: 'light' | 'dark';
}

export function ChannelSidebar({ serverId, selectedChannel, onSelectChannel, theme }: ChannelSidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const isDark = theme === 'dark';
  const firestore = useFirestore();
  const { user } = useUser();

  const channelsQuery = useMemoFirebase(() => {
    if (!firestore || !serverId) return null;
    return query(collection(firestore, 'servers', serverId, 'channels'));
  }, [firestore, serverId]);

  const { data: channelsData } = useCollection<Channel>(channelsQuery);

  const [server, setServer] = useState<{ name: string } | null>(null);

  useEffect(() => {
    if(firestore && serverId) {
        const serverDoc = collection(firestore, 'servers');
        // This is not efficient, but we don't have a direct getDoc hook with ID.
        // For a real app, this should be a direct doc read.
        const serverQuery = query(serverDoc, where('__name__', '==', serverId));
        const unsubscribe = onSnapshot(serverQuery, (snapshot) => {
            if (!snapshot.empty) {
                const serverData = snapshot.docs[0].data();
                setServer({ name: serverData.name });
            }
        });
        return () => unsubscribe();
    }
  }, [firestore, serverId]);

  const sections = useMemo(() => {
    if (!channelsData) return [];
    return [
      {
        name: 'TEXT CHANNELS',
        channels: channelsData.filter(c => c.type === 'text'),
      },
      {
        name: 'VOICE CHANNELS',
        channels: channelsData.filter(c => c.type === 'voice'),
      }
    ]
  }, [channelsData]);


  if (!server) return null;

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  return (
    <div className={`w-80 h-full flex-shrink-0 flex flex-col ${isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
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
          {sections.map((section: any) => (
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

    