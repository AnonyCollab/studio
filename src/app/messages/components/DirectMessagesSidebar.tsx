
'use client';

import { MessageSquare, Users, ChevronDown, Plus, Search, Users2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface DMConversation {
  id: string;
  otherUser: {
    id: string;
    displayName: string;
    photoURL: string;
    online: boolean; // Assuming we add this later
  };
  lastMessage: {
    text: string;
    timestamp: string;
  };
  unread: number; // Assuming we add this later
}

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
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const [dmConversations, setDmConversations] = useState<DMConversation[]>([]);

  const dmsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    // The orderBy was causing a composite index requirement with the array-contains filter.
    // Removing it to simplify the query and rely on client-side sorting if needed.
    return query(
        collection(firestore, 'dms'), 
        where('participants', 'array-contains', currentUser.uid)
      );
  }, [firestore, currentUser]);

  const { data: dmsData } = useCollection(dmsQuery);

  useEffect(() => {
    if (!dmsData || !firestore || !currentUser) return;

    const fetchConversations = async () => {
      const conversations: DMConversation[] = await Promise.all(
        dmsData.map(async (dm) => {
          if (dm.isGroup) {
            return {
              id: dm.id,
              otherUser: { // For groups, 'otherUser' represents the group itself
                id: dm.id,
                displayName: dm.groupName,
                photoURL: dm.groupAvatar,
                online: false, 
              },
              lastMessage: {
                text: dm.lastMessage?.text || 'No messages yet',
                timestamp: dm.lastMessage?.timestamp 
                  ? formatDistanceToNow(new Date(dm.lastMessage.timestamp.seconds * 1000), { addSuffix: true })
                  : '',
              },
              unread: 0, 
            };
          }

          const otherUserId = dm.participants.find((p: string) => p !== currentUser.uid);
          if (!otherUserId) return null;

          const userDocRef = doc(firestore, 'users', otherUserId);
          const userDocSnap = await getDoc(userDocRef);
          
          if (!userDocSnap.exists()) return null;

          const otherUserData = userDocSnap.data().profile;

          return {
            id: dm.id,
            otherUser: {
              id: otherUserId,
              displayName: otherUserData.displayName || 'Unknown User',
              photoURL: otherUserData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
              online: true, // Placeholder for online status
            },
            lastMessage: {
              text: dm.lastMessage?.text || 'No messages yet',
              timestamp: dm.lastMessage?.timestamp 
                ? formatDistanceToNow(new Date(dm.lastMessage.timestamp.seconds * 1000), { addSuffix: true })
                : '',
            },
            unread: 0, // Placeholder for unread count
          };
        })
      );
      // Manually sort by timestamp descending after fetching
      const sortedConversations = (conversations.filter(Boolean) as DMConversation[]).sort((a, b) => {
        const dateA = dmsData.find(d => d.id === a.id)?.updatedAt?.toMillis() || 0;
        const dateB = dmsData.find(d => d.id === b.id)?.updatedAt?.toMillis() || 0;
        return dateB - dateA;
      });
      setDmConversations(sortedConversations);
    };

    fetchConversations();
  }, [dmsData, firestore, currentUser]);

  const filteredDMs = useMemo(() => {
    return dmConversations.filter(dm =>
        dm.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dmConversations, searchQuery]);

  return (
    <div className={`w-80 flex-shrink-0 flex flex-col h-full ${isDark ? 'bg-[#0a0e1a] border-r border-white/10' : 'bg-white border-r border-gray-200'}`}>
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
                    <AvatarImage src={dm.otherUser.photoURL} />
                    <AvatarFallback>{dm.otherUser.displayName[0]}</AvatarFallback>
                  </Avatar>
                  {dm.otherUser.online && (
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
                      {dm.otherUser.displayName}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                      {dm.lastMessage.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                      {dm.lastMessage.text}
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
