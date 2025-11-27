
'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId, addDoc, serverTimestamp } from 'firebase/firestore';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

interface CreateGroupDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
}

interface Friend {
  id: string;
  displayName: string;
  photoURL: string;
}

export function CreateGroupDialog({ isOpen, onOpenChange, theme }: CreateGroupDialogProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === 'dark';

  const userDocQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return collection(firestore, 'users');
  }, [firestore, currentUser]);

  const { data: friendsData } = useCollection(userDocQuery);

  const friends: Friend[] = useMemo(() => {
    if (!friendsData) return [];
    // In a real app, this should query user.friends array. For now, show all users except current.
    return friendsData
      .filter(u => u.id !== currentUser?.uid)
      .map(u => ({
        id: u.id,
        displayName: u.profile.displayName,
        photoURL: u.profile.photoURL
      }));
  }, [friendsData, currentUser]);

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0 || !currentUser || !firestore) return;
    
    setIsLoading(true);

    const participants = [currentUser.uid, ...selectedFriends];
    const groupData = {
      isGroup: true,
      groupName: groupName.trim(),
      groupAvatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${groupName.trim()}`,
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(), // Add updatedAt for sorting
      lastMessage: null,
    };
    
    try {
      const dmsCollection = collection(firestore, 'dms');
      await addDoc(dmsCollection, groupData)
        .catch(error => {
          const permissionError = new FirestorePermissionError({
            path: dmsCollection.path,
            operation: 'create',
            requestResourceData: groupData
          });
          errorEmitter.emit('permission-error', permissionError);
          throw error;
        });

      toast({ title: 'Group created!', description: `${groupName} has been created.` });
      setGroupName('');
      setSelectedFriends([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast({ title: 'Error', description: 'Failed to create group.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md p-0 gap-0 ${isDark ? 'bg-[#131823] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Create a Group</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Select friends to start a new group conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name"
            className={isDark ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400/50' : 'bg-gray-100 border-gray-300 focus:border-cyan-500/50'}
          />

          <p className="text-sm font-medium">Select Friends</p>
          <ScrollArea className="h-64 border rounded-lg"
           style={{
                borderColor: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))',
              }}
          >
            <div className="p-2 space-y-1">
              {friends.map(friend => (
                <div
                  key={friend.id}
                  onClick={() => handleToggleFriend(friend.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'
                  }`}
                >
                  <Checkbox
                    checked={selectedFriends.includes(friend.id)}
                    className="w-5 h-5"
                  />
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={friend.photoURL} />
                    <AvatarFallback>{friend.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span>{friend.displayName}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className={isDark ? 'text-gray-400 hover:text-white' : ''} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} className={isDark ? 'bg-cyan-400 hover:bg-cyan-500 text-black' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} disabled={isLoading || !groupName.trim() || selectedFriends.length === 0}>
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
