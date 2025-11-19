
'use client';

import { Hash, Bell, Pin, Users, Search, Smile, Plus, Gift, Sticker, Send, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfileTrigger } from './ProfileCard';
import { mockUsers } from '../data/mockUsers';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { PostShareCard } from './PostShareCard';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';


interface Message {
    id: string;
    senderId: string;
    text: string;
    type: 'text' | 'postShare';
    postId?: string;
    createdAt: {
      seconds: number;
      nanoseconds: number;
    } | null;
  }

interface ChatAreaProps {
  channelId: string | null;
  isDM: boolean;
  theme: 'light' | 'dark';
}

export function ChatArea({ channelId, isDM, theme }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const isDarkTheme = theme === 'dark';
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch the DM document to get conversation details (group name, participants, etc.)
  const dmRef = useMemoFirebase(() => {
    if (!firestore || !channelId || !isDM) return null;
    return doc(firestore, 'dms', channelId);
  }, [firestore, channelId, isDM]);
  
  const { data: dmData } = useDoc(dmRef);

  const otherUserUid = useMemo(() => {
    if (!isDM || !channelId || !currentUser || !dmData || dmData.isGroup) return null;
    return dmData.participants.find((uid: string) => uid !== currentUser.uid);
  }, [channelId, isDM, currentUser, dmData]);

  const otherUserRef = useMemoFirebase(() => {
    if (!firestore || !otherUserUid) return null;
    return doc(firestore, 'users', otherUserUid);
  }, [firestore, otherUserUid]);

  const { data: otherUserData } = useDoc(otherUserRef);
  const otherUser = otherUserData?.profile;

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !channelId) return null;
    if (isDM) {
        return query(collection(firestore, 'dms', channelId, 'messages'), orderBy('createdAt', 'asc'));
    }
    // For group chats
    return query(collection(firestore, 'servers', channelId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, channelId, isDM]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  const [senderProfiles, setSenderProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchSenderProfiles = async () => {
        if (!messages || !firestore) return;
        const newProfiles: Record<string, any> = {};
        for (const msg of messages) {
            if (!senderProfiles[msg.senderId]) {
                const userDocRef = doc(firestore, 'users', msg.senderId);
                const unsub = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setSenderProfiles(prev => ({...prev, [msg.senderId]: docSnap.data().profile}));
                    }
                });
                // In a real app, manage unsubscribing
            }
        }
    };
    fetchSenderProfiles();
  }, [messages, firestore, senderProfiles]);


  
  const handleSendMessage = async () => {
    if (message.trim() === '' || !firestore || !currentUser || !channelId) return;

    const messageData = {
        senderId: currentUser.uid,
        type: 'text',
        text: message,
        createdAt: serverTimestamp(),
    };
    
    setMessage(''); // Clear input immediately
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    
    if (isDM) {
        await addDoc(collection(firestore, 'dms', channelId, 'messages'), messageData);
    } else {
        // Handle group messages
        await addDoc(collection(firestore, 'servers', channelId, 'messages'), messageData);
    }
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prevMessage => prevMessage + emojiData.emoji);
  };

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
  
  const chatName = useMemo(() => {
    if (!isDM) return channelId;
    if (!dmData) return "Loading...";
    if (dmData.isGroup) return dmData.groupName;
    return otherUser?.displayName || "Loading...";
  }, [isDM, channelId, dmData, otherUser]);

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkTheme ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
      {/* Channel header */}
      <div className={`h-12 px-4 flex-shrink-0 flex items-center justify-between ${
        isDarkTheme 
          ? 'bg-[#131823] border-b border-white/10' 
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          {isDM ? (
             dmData?.isGroup ? (
              <Users className={`w-5 h-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`} />
             ) : (
              <MessageCircle className={`w-5 h-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`} />
             )
          ) : (
            <Hash className={`w-5 h-5 ${isDarkTheme ? 'text-white/70' : 'text-gray-600'}`} />
          )}
          <span className={isDarkTheme ? 'text-[#e5e7eb]' : 'text-gray-900'}>{chatName}</span>
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
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="p-4 space-y-4">
          {isLoading && <p>Loading messages...</p>}
          {messages && messages.map((msg, index) => {
            const senderProfile = senderProfiles[msg.senderId];
            if (!senderProfile) return <div key={msg.id}></div>; // Or a placeholder
            
            const prevMessage = messages[index - 1];
            const showAvatarAndName = !prevMessage || prevMessage.senderId !== msg.senderId;

            return (
              <div key={msg.id} className={`flex gap-3 p-2 rounded-lg transition-colors group ${
                isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}>
                
                <div className="w-10 flex-shrink-0">
                    {showAvatarAndName && (
                        <UserProfileTrigger user={{...mockUsers.currentUser, ...senderProfile}} theme={theme}>
                            <Avatar className={`w-10 h-10 ${isDarkTheme ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                                <AvatarImage src={senderProfile.photoURL} />
                                <AvatarFallback>{senderProfile.displayName[0]}</AvatarFallback>
                            </Avatar>
                        </UserProfileTrigger>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  {showAvatarAndName && (
                      <div className="flex items-baseline gap-2">
                        <UserProfileTrigger user={{...mockUsers.currentUser, ...senderProfile}} theme={theme}>
                            <span className={`cursor-pointer hover:underline ${isDarkTheme ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{senderProfile.displayName}</span>
                        </UserProfileTrigger>
                        <span className={`text-xs ${isDarkTheme ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000)) + ' ago' : 'sending...'}
                        </span>
                      </div>
                  )}
                  {msg.type === 'postShare' && msg.postId ? (
                    <PostShareCard postId={msg.postId} theme={theme} />
                  ) : (
                    <p className={`mt-0.5 ${isDarkTheme ? 'text-[#94a3b8]' : 'text-gray-600'}`}>{msg.text}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 flex-shrink-0">
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
              placeholder={`Message ${isDM ? `@${chatName}` : `#${chatName}`}`}
              className={`w-full bg-transparent outline-none ${
                isDarkTheme 
                  ? 'text-white placeholder:text-gray-500' 
                  : 'text-gray-900 placeholder:text-gray-400'
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
              <PopoverTrigger asChild>
                <button className={`p-1 transition-colors ${ isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600' }`}>
                  <Gift className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 border-0 mb-2 w-96">
                <div className={`${isDarkTheme ? 'bg-[#1a1f2e]' : 'bg-white'} rounded-lg`}>
                  <div className="p-4">
                    <input type="text" placeholder="Search Giphy" className={`w-full p-2 rounded ${isDarkTheme ? 'bg-black/20 text-white' : 'bg-gray-100'}`} />
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <p className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>GIFs will load here...</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <button className={`p-1 transition-colors ${
              isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
            }`}>
              <Sticker className="w-5 h-5" />
            </button>
             <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                    <button className={`p-1 transition-colors ${ isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600' }`}>
                      <Smile className="w-5 h-5" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 border-0 mb-2">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme={isDarkTheme ? 'dark' : 'light'} />
                </PopoverContent>
            </Popover>
            {message && (
              <button onClick={handleSendMessage} className={`p-1 transition-colors ${
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
