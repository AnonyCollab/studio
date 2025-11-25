
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, getDocs, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Search, Check } from 'lucide-react';

interface InviteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  serverId: string;
  currentMembers: string[];
}

export function InviteDialog({ isOpen, onOpenChange, theme, serverId, currentMembers }: InviteDialogProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isDark = theme === 'dark';

  const handleInvite = async () => {
    if (!username.trim() || !firestore || !serverId) return;

    setIsLoading(true);

    try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where("profile.displayName", "==", username.trim()), limit(1));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({ title: 'User not found', description: `No user with the name "${username.trim()}" found.`, variant: 'destructive' });
            setIsLoading(false);
            return;
        }

        const targetUser = querySnapshot.docs[0];
        const targetUserId = targetUser.id;

        if (currentMembers.includes(targetUserId)) {
             toast({ title: 'Already a member', description: `${username.trim()} is already in this server.`, variant: 'destructive' });
             setIsLoading(false);
             return;
        }

        const serverRef = doc(firestore, 'servers', serverId);
        await updateDoc(serverRef, {
            members: arrayUnion(targetUserId)
        });

        toast({ title: 'Invitation Sent!', description: `${username.trim()} has been added to the server.` });
        setUsername('');
        onOpenChange(false);

    } catch (error) {
        console.error("Error inviting user: ", error);
        toast({ title: 'Error', description: 'Failed to send invitation.', variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
        setUsername('');
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md p-0 gap-0 ${isDark ? 'bg-[#131823] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Invite Friends</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Invite a user to the server using their exact display name.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className={`pl-9 h-10 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10' 
                    : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200'
                }`}
              />
            </div>
        </div>

        <DialogFooter className="p-6 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className={isDark ? 'text-gray-400 hover:text-white' : ''} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleInvite} className={isDark ? 'bg-cyan-400 hover:bg-cyan-500 text-black' : 'bg-cyan-600 hover:bg-cyan-700 text-white'} disabled={isLoading || !username.trim()}>
            {isLoading ? 'Sending Invite...' : `Send Invite`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
