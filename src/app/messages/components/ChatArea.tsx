
import { Hash, Bell, Pin, Users, Search, Smile, Plus, Gift, Sticker, Send, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { UserProfileTrigger } from './ProfileCard';
import { mockUsers } from '../data/mockUsers';

const mockMessages = [
  {
    id: '1',
    userId: 'user1',
    user: 'Alice Wonderland',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    timestamp: '10:30 AM',
    content: 'Hey everyone! Ready for the game tonight?',
  },
  {
    id: '2',
    userId: 'user2',
    user: 'Bob the Builder',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    timestamp: '10:32 AM',
    content: 'Absolutely! I\'ve been practicing all week 🎮',
  },
  {
    id: '3',
    userId: 'user3',
    user: 'Charlie Notes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    timestamp: '10:35 AM',
    content: 'Count me in! What time are we starting?',
  },
  {
    id: '4',
    userId: 'user1',
    user: 'Alice Wonderland',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    timestamp: '10:36 AM',
    content: 'How about 8 PM? That should give everyone time to get online.',
  },
  {
    id: '5',
    userId: 'user4',
    user: 'Diana',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    timestamp: '10:40 AM',
    content: 'Perfect! See you all then 👍',
  },
];

interface ChatAreaProps {
  channelId: string | null;
  isDM: boolean;
  theme: 'light' | 'dark';
}

export function ChatArea({ channelId, isDM, theme }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const isDarkTheme = theme === 'dark';

  if (!channelId) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        isDarkTheme ? 'bg-[#0a0e1a]' : 'bg-gray-50'
      }`}>
        <div className="text-center space-y-2">
          {isDM ? (
            <MessageCircle className={`w-16 h-16 mx-auto ${isDarkTheme ? 'text-white/30' : 'text-gray-300'}`} />
          ) : (
            <Hash className={`w-16 h-16 mx-auto ${isDarkTheme ? 'text-white/30' : 'text-gray-300'}`} />
          )}
          <p className={isDarkTheme ? 'text-[#94a3b8]' : 'text-gray-600'}>
            {isDM ? 'Select a conversation to start messaging' : 'Select a channel to start messaging'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col ${isDarkTheme ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
      {/* Channel header */}
      <div className={`h-12 px-4 flex items-center justify-between ${
        isDarkTheme 
          ? 'bg-[#131823] border-b border-white/10' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          {isDM ? (
            <MessageCircle className={`w-5 h-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`} />
          ) : (
            <Hash className={`w-5 h-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`} />
          )}
          <span className={isDarkTheme ? 'text-[#e5e7eb]' : 'text-gray-900'}>{channelId}</span>
        </div>
        <div className="flex items-center gap-3">
          <button className={`transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Bell className="w-5 h-5" />
          </button>
          <button className={`transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Pin className="w-5 h-5" />
          </button>
          <button className={`transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Users className="w-5 h-5" />
          </button>
          <div className={`w-px h-6 ${isDarkTheme ? 'bg-white/20' : 'bg-gray-200'}`} />
          <button className={`transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {mockMessages.map((msg) => {
            const userProfile = mockUsers[msg.userId];
            return (
              <div key={msg.id} className={`flex gap-3 p-2 rounded-lg transition-colors group ${
                isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}>
                <UserProfileTrigger user={userProfile} theme={theme}>
                  <Avatar className={`w-10 h-10 ${isDarkTheme ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.user[0]}</AvatarFallback>
                  </Avatar>
                </UserProfileTrigger>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <UserProfileTrigger user={userProfile} theme={theme}>
                      <span className={`cursor-pointer hover:underline ${isDarkTheme ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{msg.user}</span>
                    </UserProfileTrigger>
                    <span className={`text-xs ${isDarkTheme ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className={`mt-0.5 ${isDarkTheme ? 'text-[#94a3b8]' : 'text-gray-600'}`}>{msg.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4">
        <div className={`rounded-lg p-3 flex items-end gap-2 ${
          isDarkTheme 
            ? 'bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-[#22d3ee]/50' 
            : 'bg-gray-100 border border-gray-300 focus-within:bg-gray-200 focus-within:border-cyan-500/50'
        } transition-all`}>
          <button className={`p-1 transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isDM ? `Message ${channelId}` : `Message #${channelId}`}
              className={`w-full bg-transparent outline-none ${
                isDarkTheme 
                  ? 'text-white placeholder:text-gray-500' 
                  : 'text-gray-900 placeholder:text-gray-400'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setMessage('');
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className={`p-1 transition-colors ${
              isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
            }`}>
              <Gift className="w-5 h-5" />
            </button>
            <button className={`p-1 transition-colors ${
              isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
            }`}>
              <Sticker className="w-5 h-5" />
            </button>
            <button className={`p-1 transition-colors ${
              isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
            }`}>
              <Smile className="w-5 h-5" />
            </button>
            {message && (
              <button className={`p-1 transition-colors ${
                isDarkTheme ? 'text-[#22d3ee] hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
              }`}>
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
