
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Search, Check } from 'lucide-react';

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  serverId: string;
  currentMembers: string[];
}

interface UserData {
  id: string;
  displayName: string;
  photoURL: string;
}

export function InviteDialog({ isOpen, onOpenChange, theme, serverId, currentMembers }: InviteDialogProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === 'dark';

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For simplicity, this fetches all users. In a real app with many users,
    // you would implement a more sophisticated search/query mechanism.
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: allUsersData } = useCollection(usersQuery);

  const availableToInvite = useMemo((): UserData[] => {
    if (!allUsersData) return [];
    return allUsersData
      .filter(u => !currentMembers.includes(u.id) && u.id !== currentUser?.uid)
      .map(u => ({
        id: u.id,
        displayName: u.profile.displayName,
        photoURL: u.profile.photoURL
      }))
      .filter(u => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allUsersData, currentMembers, currentUser, searchQuery]);
  
  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0 || !firestore || !serverId) return;
    
    setIsLoading(true);
    try {
        const serverRef = doc(firestore, 'servers', serverId);
        await updateDoc(serverRef, {
            members: arrayUnion(...selectedUsers)
        });
        toast({ title: 'Invitations Sent!', description: `Invited ${selectedUsers.length} new member(s).` });
        setSelectedUsers([]);
        onOpenChange(false);
    } catch(error) {
        console.error("Error inviting users: ", error);
        toast({ title: 'Error', description: 'Failed to send invitations.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
        setSelectedUsers([]);
        setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md p-0 gap-0 ${isDark ? 'bg-[#131823] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Invite Friends</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Search for users to invite to the server.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username"
                className={`pl-9 h-10 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                }`}
              />
            </div>

          <ScrollArea className="h-64 border rounded-lg"
           style={{
                borderColor: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))',
              }}
          >
            <div className="p-2 space-y-1">
              {availableToInvite.length === 0 && (
                <div className={`text-center py-10 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    No users found.
                </div>
              )}
              {availableToInvite.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleToggleUser(user.id)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.includes(user.id)
                        ? (isDark ? 'bg-cyan-500/20' : 'bg-cyan-100')
                        : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100')
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.photoURL} />
                    <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1">{user.displayName}</span>
                   <div className={`w-5 h-5 flex items-center justify-center rounded-sm border-2 ${selectedUsers.includes(user.id) ? 'bg-cyan-500 border-cyan-500 text-white' : (isDark ? 'border-gray-600' : 'border-gray-300')}`}>
                        {selectedUsers.includes(user.id) && <Check className="w-3.5 h-3.5" />}
                    </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="p-6 mt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className={isDark ? 'text-gray-400 hover:text-white' : ''} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} className={isDark ? 'bg-cyan-400 hover:bg-cyan-500 text-black' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} disabled={isLoading || selectedUsers.length === 0}>
            {isLoading ? 'Inviting...' : `Invite (${selectedUsers.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
