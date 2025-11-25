
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp, getDocs, limit, FieldPath, documentId, onSnapshot, getDoc, arrayUnion, deleteDoc, addDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Users, UserPlus, MessageCircle, MoreVertical, Check, X, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserProfileTrigger, UserProfile } from './ProfileCard';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

interface FriendData {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  statusType: 'online' | 'offline' | 'game' | 'voice';
  customStatus?: string;
}

interface PendingRequest {
  id: string;
  name: string;
  avatar: string;
  type: 'incoming' | 'outgoing';
  senderId: string;
  receiverId: string;
}

interface FriendsPageProps {
  theme: 'light' | 'dark';
  onSelectDM: (id: string) => void;
}

const getDmId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

export function FriendsPage({ theme, onSelectDM }: FriendsPageProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [newFriendInput, setNewFriendInput] = useState('');
  const [activeTab, setActiveTab] = useState("online");
  const { toast } = useToast();
  const isDark = theme === 'dark';

  // --- Firestore Queries ---

  const incomingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'friendRequests'), where('receiverId', '==', user.uid), where('status', '==', 'pending'));
  }, [firestore, user]);
  const { data: incomingRequestsData } = useCollection(incomingRequestsQuery);
  
  const outgoingRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'friendRequests'), where('senderId', '==', user.uid), where('status', '==', 'pending'));
  }, [firestore, user]);
  const { data: outgoingRequestsData } = useCollection(outgoingRequestsQuery);

  // New query to find accepted requests that the current user sent
  const acceptedRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'friendRequests'), where('senderId', '==', user.uid), where('status', '==', 'accepted'));
  }, [firestore, user]);
  const { data: acceptedRequestsData } = useCollection(acceptedRequestsQuery);


  const userDocQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const [friendUIDs, setFriendUIDs] = useState<string[]>([]);
  useEffect(() => {
    if (!userDocQuery) return;
    const unsub = onSnapshot(userDocQuery, (doc) => {
      setFriendUIDs(doc.data()?.friends || []);
    });
    return () => unsub();
  }, [userDocQuery]);

  const friendsQuery = useMemoFirebase(() => {
    if (!firestore || friendUIDs.length === 0) return null;
    return query(collection(firestore, 'users'), where(documentId(), 'in', friendUIDs));
  }, [firestore, friendUIDs]);
  const { data: friendsData } = useCollection(friendsQuery);

  // --- Effect to process accepted friend requests ---
  useEffect(() => {
    if (!acceptedRequestsData || acceptedRequestsData.length === 0 || !firestore || !user) return;

    const processAcceptedRequests = async () => {
      const batch = writeBatch(firestore);
      const userRef = doc(firestore, 'users', user.uid);
      
      acceptedRequestsData.forEach(req => {
        // Add the receiver to the sender's (current user's) friend list
        batch.update(userRef, { friends: arrayUnion(req.receiverId) });
        // Delete the request document to prevent re-processing
        const reqRef = doc(firestore, 'friendRequests', req.id);
        batch.delete(reqRef);
      });

      try {
        await batch.commit();
      } catch (error) {
         console.error("Error processing accepted friend requests:", error);
         // Optionally emit a permission error if needed
      }
    };

    processAcceptedRequests();
  }, [acceptedRequestsData, firestore, user]);


  // --- Memoized Data Transformation ---

  const pendingRequests = useMemo((): PendingRequest[] => {
    const incoming = (incomingRequestsData || []).map(req => ({
      id: req.id,
      name: 'Unknown User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.senderId}`,
      type: 'incoming' as const,
      senderId: req.senderId,
      receiverId: req.receiverId
    }));

    const outgoing = (outgoingRequestsData || []).map(req => ({
      id: req.id,
      name: 'Unknown User',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.receiverId}`,
      type: 'outgoing' as const,
      senderId: req.senderId,
      receiverId: req.receiverId
    }));
    
    return [...incoming, ...outgoing];
  }, [incomingRequestsData, outgoingRequestsData]);
  
  const allFriends = useMemo((): FriendData[] => {
    return (friendsData || []).map(friend => ({
      id: friend.id,
      name: friend.profile.displayName,
      avatar: friend.profile.photoURL,
      status: 'online',
      statusType: 'online',
    }));
  }, [friendsData]);
  
  const onlineFriends = useMemo(() => allFriends.filter(f => f.status === 'online'), [allFriends]);


  // --- Actions ---

  const handleOpenDM = async (friendId: string) => {
    if (!user || !firestore) return;
    const dmId = getDmId(user.uid, friendId);
    
    const dmRef = doc(firestore, 'dms', dmId);
    try {
        const dmDoc = await getDoc(dmRef);

        if (!dmDoc.exists()) {
            const participantsData = { 
                participants: [user.uid, friendId],
                isGroup: false,
                createdAt: serverTimestamp(),
                lastMessage: null,
            };
            await setDoc(dmRef, participantsData)
                .catch(error => {
                    const permissionError = new FirestorePermissionError({
                        path: dmRef.path,
                        operation: 'create',
                        requestResourceData: participantsData,
                    });
                    errorEmitter.emit('permission-error', permissionError);
                    throw error;
                });
        }
    } catch (error) {
        // This will catch the permission error on the getDoc call
        console.error("Error checking/creating DM:", error);
        // We can choose to optimistically open the DM anyway
        // or show a toast message. For a better UX, let's just proceed.
    }

    onSelectDM(dmId);
  };

  const handleAddFriend = async () => {
    if (!newFriendInput.trim() || !user || !firestore) return;

    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("profile.displayName", "==", newFriendInput.trim()), limit(1));
    
    getDocs(q).then(querySnapshot => {
        if (querySnapshot.empty) {
            toast({ title: "User not found", description: `Could not find user ${newFriendInput.trim()}.`, variant: 'destructive' });
            return;
        }
        
        const receiver = querySnapshot.docs[0];
        const receiverId = receiver.id;

        if (receiverId === user.uid) {
            toast({ title: "Cannot add yourself", description: "You cannot send a friend request to yourself.", variant: 'destructive' });
            return;
        }

        const friendRequestRef = collection(firestore, 'friendRequests');
        const requestData = {
            senderId: user.uid,
            receiverId: receiverId,
            status: 'pending',
            createdAt: serverTimestamp(),
        };
        
        addDoc(friendRequestRef, requestData).catch(error => {
            const permissionError = new FirestorePermissionError({
                path: friendRequestRef.path,
                operation: 'create',
                requestResourceData: requestData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        toast({ title: 'Friend Request Sent', description: `Your friend request to ${newFriendInput.trim()} has been sent.` });
        setNewFriendInput('');
        setActiveTab("pending");
    }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: usersRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handlePendingRequest = async (requestId: string, action: 'accept' | 'decline') => {
    if (!firestore || !user) return;
    
    const requestRef = doc(firestore, 'friendRequests', requestId);

    if (action === 'accept') {
      try {
        const requestDoc = await getDoc(requestRef);
        if (!requestDoc.exists()) {
          toast({ title: 'Error', description: 'Friend request not found.', variant: 'destructive' });
          return;
        }
        
        const { senderId, receiverId } = requestDoc.data();
        
        if (user.uid !== receiverId) {
          toast({ title: 'Error', description: 'You cannot accept this request.', variant: 'destructive' });
          return;
        }
        
        const batch = writeBatch(firestore);

        batch.update(requestRef, { status: 'accepted' });
        
        const receiverUserRef = doc(firestore, 'users', receiverId);
        batch.update(receiverUserRef, { friends: arrayUnion(senderId) });

        await batch.commit();

        toast({ title: 'Friend Added!', description: 'You are now friends.' });

      } catch (error) {
        console.error("Error accepting friend request: ", error);
        toast({ title: 'Error', description: 'Failed to accept friend request.', variant: 'destructive' });
      }
    } else { 
        deleteDoc(requestRef)
            .then(() => {
                toast({ title: 'Request Removed', description: 'The friend request has been removed.' });
            })
            .catch((error) => {
                const permissionError = new FirestorePermissionError({ path: requestRef.path, operation: 'delete' });
                errorEmitter.emit('permission-error', permissionError);
            });
    }
  };


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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
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
                 {pendingRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
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
                    Online — {onlineFriends.length}
                  </p>
                  {onlineFriends.map((friend) => (
                    <FriendItem key={friend.id} friend={friend} isDark={isDark} theme={theme} onMessageClick={() => handleOpenDM(friend.id)} />
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
                    All Friends — {allFriends.length}
                  </p>
                  {allFriends.map((friend) => (
                    <FriendItem key={friend.id} friend={friend} isDark={isDark} theme={theme} onMessageClick={() => handleOpenDM(friend.id)} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="pending" className="flex-1 mt-0 overflow-hidden">
             <ScrollArea className="h-full">
              <div className="px-6 py-4 space-y-4">
                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                    Incoming — {pendingRequests.filter(f => f.type === 'incoming').length}
                  </p>
                  {pendingRequests
                    .filter((f) => f.type === 'incoming')
                    .map((friend) => (
                      <PendingFriendItem key={friend.id} friend={friend} isDark={isDark} onAction={handlePendingRequest} />
                    ))}
                </div>

                <div className="space-y-2">
                  <p className={`text-xs uppercase tracking-wider ${isDark ? 'text-[#94a3b8]' : 'text-gray-500'}`}>
                    Outgoing — {pendingRequests.filter(f => f.type === 'outgoing').length}
                  </p>
                  {pendingRequests
                    .filter((f) => f.type === 'outgoing')
                    .map((friend) => (
                      <PendingFriendItem key={friend.id} friend={friend} isDark={isDark} onAction={handlePendingRequest} />
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
                      You can add friends with their display name. It's case-sensitive!
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newFriendInput}
                      onChange={(e) => setNewFriendInput(e.target.value)}
                      placeholder="Enter a username"
                      className={`flex-1 ${
                        isDark 
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                      }`}
                    />
                    <Button 
                      onClick={handleAddFriend}
                      className={isDark ? 'bg-[#22d3ee] hover:bg-cyan-500 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}
                      disabled={!newFriendInput}
                    >
                      Send Request
                    </Button>
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

function FriendItem({ friend, isDark, theme, onMessageClick }: { friend: any; isDark: boolean; theme: 'light' | 'dark'; onMessageClick: () => void }) {
  const statusColor = {
    online: 'bg-emerald-500',
    game: 'bg-purple-500',
    voice: 'bg-emerald-500',
    offline: 'bg-gray-500',
  }['online']; 

  return (
    <div className={`p-3 rounded-xl flex items-center gap-3 transition-all group ${
      isDark 
        ? 'bg-[#131823] border border-white/10 hover:bg-white/5 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
        : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-cyan-500/50 hover:shadow-lg'
    }`}>
        <div className="relative">
          <Avatar className={`w-12 h-12 ${isDark ? 'ring-2 ring-white/20' : 'ring-2 ring-gray-200'}`}>
            <AvatarImage src={friend.avatar} />
            <AvatarFallback>{friend.name[0]}</AvatarFallback>
          </Avatar>
          <div className={`absolute bottom-0 right-0 w-4 h-4 ${statusColor} rounded-full ${
            isDark ? 'border-2 border-[#131823]' : 'border-2 border-white'
          }`} />
        </div>
      <div className="flex-1 min-w-0">
          <p className={`truncate cursor-pointer hover:underline ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>{friend.name}</p>
        <p className={`text-sm truncate ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>{friend.status}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onMessageClick}
          className={`p-2 rounded-lg transition-colors ${
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

function PendingFriendItem({ friend, isDark, onAction }: { friend: PendingRequest; isDark: boolean; onAction: (id: string, action: 'accept' | 'decline') => void }) {
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
            <button onClick={() => onAction(friend.id, 'accept')} className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors">
              <Check className="w-5 h-5 text-white" />
            </button>
            <button onClick={() => onAction(friend.id, 'decline')} className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-[#131823] border border-white/10 hover:bg-red-500/20' 
                : 'bg-gray-100 border border-gray-200 hover:bg-red-100'
            }`}>
              <X className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-900'}`} />
            </button>
          </>
        ) : (
          <button onClick={() => onAction(friend.id, 'decline')} className={`p-2 rounded-lg transition-colors ${
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
