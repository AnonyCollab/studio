

'use client';

import { Hash, Bell, Pin, Users, Search, Smile, Plus, Gift, Sticker, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  collection,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
  doc,
  setDoc,
  getDoc,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  updateMetadata
} from "firebase/storage";
import { formatDistanceToNow } from 'date-fns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { UserProfileTrigger } from './ProfileCard';
import { PostShareCard } from './PostShareCard';
import { FileCard } from './FileCard';

// Mock EmojiPicker (Simple replacement)
function EmojiPickerMock({ onEmojiClick, theme }: { onEmojiClick: (emoji: any) => void, theme: string }) {
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '🚀', '👀', '✨', '💯'];
  return (
    <div className={`p-2 grid grid-cols-4 gap-2 ${theme === 'dark' ? 'bg-[#1a1f2e]' : 'bg-white'} rounded-lg border shadow-lg`}>
      {emojis.map(emoji => (
        <button
          key={emoji}
          onClick={() => onEmojiClick({ emoji })}
          className="text-2xl hover:bg-black/10 rounded p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}


// --- MAIN COMPONENT ---

interface Message {
    id: string;
    senderId: string;
    text?: string;
    type: 'text' | 'postShare' | 'file';
    postId?: string;
    fileInfo?: {
      name: string;
      size: number;
      type: string;
      url: string;
    };
    createdAt: {
      seconds: number;
      nanoseconds: number;
    } | null;
  }
  
interface ChannelData {
    name: string;
}

interface ChatAreaProps {
  channelId: string | null;
  serverId?: string;
  isDM: boolean;
  theme: 'light' | 'dark';
  onBack?: () => void;
}

export function ChatArea({ channelId, serverId, isDM, theme, onBack }: ChatAreaProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const isDarkTheme = theme === 'dark';
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch the DM document to get conversation details (group name, participants, etc.)
  const dmRef = useMemoFirebase(() => {
    if (!firestore || !channelId || !isDM) return null;
    return doc(firestore, 'dms', channelId);
  }, [firestore, channelId, isDM]);

  const { data: dmData } = useDoc(dmRef);

  const channelRef = useMemoFirebase(() => {
    if (!firestore || !channelId || isDM || !serverId) return null;
    return doc(firestore, 'servers', serverId, 'channels', channelId);
  }, [firestore, channelId, serverId, isDM]);

  const { data: channelData } = useDoc<ChannelData>(channelRef);

  // --- FIX: Ensure DM Document Exists ---
  useEffect(() => {
    const ensureDMExists = async () => {
      if (!isDM || !channelId || !currentUser || !firestore || dmData) return;

      if (channelId.includes('_')) {
        const participants = channelId.split('_');

        if (participants.includes(currentUser.uid)) {
          try {
            await setDoc(doc(firestore, 'dms', channelId), {
              participants: participants,
              isGroup: false,
              updatedAt: serverTimestamp()
            }, { merge: true });
          } catch (error) {
            console.error("Error ensuring DM existence:", error);
          }
        }
      }
    };

    ensureDMExists();
  }, [channelId, isDM, currentUser, firestore, dmData]);
  // --------------------------------------

  const otherUserUid = useMemo(() => {
    if (isDM && channelId && currentUser && channelId.includes('_')) {
        const parts = channelId.split('_');
        const other = parts.find(p => p !== currentUser.uid);
        if (other) return other;
    }

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
        if (!dmData) return null; // Wait for DM doc to exist before querying subcollection
        return query(collection(firestore, 'dms', channelId, 'messages'), orderBy('createdAt', 'asc'));
    }
    if(!serverId) return null;
    // Corrected path for server channel messages
    return query(collection(firestore, 'servers', serverId, 'channels', channelId, 'messages'), orderBy('createdAt', 'asc'));
  }, [firestore, channelId, serverId, isDM, dmData]);

  const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
  const [senderProfiles, setSenderProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchSenderProfiles = async () => {
        if (!messages || !firestore) return;
        const missingIds = new Set(
            messages
            .map(m => m.senderId)
            .filter(id => id && !senderProfiles[id])
        );

        if (missingIds.size === 0) return;

        missingIds.forEach(id => {
            const userDocRef = doc(firestore, 'users', id);
            onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setSenderProfiles(prev => ({
                        ...prev,
                        [id]: docSnap.data().profile || { displayName: 'Unknown', photoURL: '' }
                    }));
                }
            });
        });
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

    setMessage('');
    setShowEmojiPicker(false);
    setShowGifPicker(false);

    if (isDM) {
        await addDoc(collection(firestore, 'dms', channelId, 'messages'), messageData);
        // Also update the lastMessage on the parent DM doc
        await setDoc(doc(firestore, 'dms', channelId), {
          lastMessage: {
            text: message,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
          },
          updatedAt: serverTimestamp()
        }, { merge: true });
    } else if(serverId) {
        await addDoc(collection(firestore, 'servers', serverId, 'channels', channelId, 'messages'), messageData);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !channelId || !currentUser) return;

    const storage = getStorage();
    const filePath = isDM ? `dms/${channelId}/${currentUser.uid}/${file.name}` : `servers/${serverId}/${channelId}/${currentUser.uid}/${file.name}`;
    const fileStorageRef = storageRef(storage, filePath);

    const uploadTask = uploadBytesResumable(fileStorageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        // Can be used to show upload progress
      },
      (error) => {
        console.error("Upload failed:", error);
      },
      async () => {
        try {
          await updateMetadata(uploadTask.snapshot.ref, { contentType: file.type });
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const fileMessage = {
            senderId: currentUser.uid,
            type: 'file' as const,
            text: `Sent a file: ${file.name}`,
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
            },
            createdAt: serverTimestamp(),
          };
          
          const messageCollection = isDM ? collection(firestore, 'dms', channelId, 'messages') : collection(firestore, 'servers', serverId!, 'channels', channelId, 'messages');
          await addDoc(messageCollection, fileMessage);
          
          if(isDM) {
             await setDoc(doc(firestore, 'dms', channelId), {
              lastMessage: {
                text: `Sent a file: ${file.name}`,
                senderId: currentUser.uid,
                timestamp: serverTimestamp()
              },
              updatedAt: serverTimestamp()
            }, { merge: true });
          }

        } catch (error) {
            console.error("Failed to finalize upload:", error);
        }
      }
    );
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const onEmojiClick = (emojiData: any) => {
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
    if (!isDM) return channelData?.name || channelId;
    if (otherUser) return otherUser.displayName;
    if (!dmData) return "Loading...";
    if (dmData.isGroup) return dmData.groupName;
    return otherUser?.displayName || "Loading...";
  }, [isDM, channelId, channelData, dmData, otherUser]);

  return (
    <div className={`flex-1 flex flex-col h-full ${isDarkTheme ? 'bg-[#0a0e1a]' : 'bg-gray-50'}`}>
      {/* Channel header */}
      <div className={`h-12 px-4 flex-shrink-0 flex items-center justify-between ${
        isDarkTheme
          ? 'bg-[#131823] border-b border-white/10'
          : 'bg-white border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          {onBack && (
             <button onClick={onBack} className={`mr-2 p-1 rounded-full transition-colors ${isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                <ArrowLeft className="w-5 h-5" />
             </button>
          )}
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

            if (!senderProfile) {
                // Render a placeholder or skip
                return null;
            }

            const prevMessage = messages[index - 1];
            const showAvatarAndName = !prevMessage || prevMessage.senderId !== msg.senderId;
            const profileToUse = senderProfile;

            return (
              <div key={msg.id} className={`flex gap-3 p-2 rounded-lg transition-colors group ${
                isDarkTheme ? 'hover:bg-white/5' : 'hover:bg-gray-100'
              }`}>

                <div className="w-10 flex-shrink-0">
                    {showAvatarAndName && (
                        <UserProfileTrigger user={profileToUse} theme={theme}>
                            <Avatar className={`w-10 h-10 ${isDarkTheme ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
                                <AvatarImage src={profileToUse.photoURL} />
                                <AvatarFallback>{profileToUse.displayName?.[0]}</AvatarFallback>
                            </Avatar>
                        </UserProfileTrigger>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                  {showAvatarAndName && (
                      <div className="flex items-baseline gap-2">
                        <UserProfileTrigger user={profileToUse} theme={theme}>
                            <span className={`cursor-pointer hover:underline ${isDarkTheme ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{profileToUse.displayName}</span>
                        </UserProfileTrigger>
                        <span className={`text-xs ${isDarkTheme ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt.seconds * 1000)) + ' ago' : 'sending...'}
                        </span>
                      </div>
                  )}
                   {msg.type === 'postShare' && msg.postId ? (
                    <PostShareCard postId={msg.postId} theme={theme} />
                  ) : msg.type === 'file' && msg.fileInfo ? (
                    <FileCard fileInfo={msg.fileInfo} theme={theme} />
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
      <div className={`p-4 flex-shrink-0 border-t ${isDarkTheme ? 'border-white/10 bg-[#0a0e1a]' : 'border-gray-200 bg-gray-50'}`}>
        <div className={`rounded-lg p-3 flex items-end gap-2 ${
          isDarkTheme
            ? 'bg-white/5 border border-white/10 focus-within:bg-white/10 focus-within:border-[#22d3ee]/50'
            : 'bg-gray-100 border border-gray-300 focus-within:bg-gray-200 focus-within:border-cyan-500/50'
        } transition-all`}>
           <button onClick={() => fileInputRef.current?.click()} className={`p-1 transition-colors ${
            isDarkTheme ? 'text-white/70 hover:text-[#22d3ee]' : 'text-gray-600 hover:text-cyan-600'
          }`}>
            <Plus className="w-5 h-5" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
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
                    <EmojiPickerMock onEmojiClick={onEmojiClick} theme={isDarkTheme ? 'dark' : 'light'} />
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
