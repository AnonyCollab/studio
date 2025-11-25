
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, writeBatch, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface CreateServerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
}

export function CreateServerDialog({ isOpen, onOpenChange, theme }: CreateServerDialogProps) {
  const [serverName, setServerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const handleCreateServer = async () => {
    if (!serverName.trim() || !currentUser || !firestore) return;

    setIsLoading(true);
    try {
      const batch = writeBatch(firestore);
      
      const serverRef = doc(collection(firestore, 'servers'));
      
      batch.set(serverRef, {
        name: serverName.trim(),
        ownerId: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp(),
        iconUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(serverName.trim())}`
      });

      // Create a default 'general' text channel
      const generalChannelRef = doc(collection(firestore, 'servers', serverRef.id, 'channels'));
      batch.set(generalChannelRef, {
        name: 'general',
        type: 'text',
        serverId: serverRef.id,
      });

      // Create a default 'Lobby' voice channel
      const lobbyChannelRef = doc(collection(firestore, 'servers', serverRef.id, 'channels'));
      batch.set(lobbyChannelRef, {
        name: 'Lobby',
        type: 'voice',
        serverId: serverRef.id,
      });
      
      await batch.commit();

      toast({ title: 'Server Created!', description: `${serverName} is ready.` });
      setServerName('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating server:", error);
      toast({ title: 'Error', description: 'Failed to create server.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md p-0 gap-0 ${isDark ? 'bg-[#131823] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader className="p-6 pb-4 text-center">
          <DialogTitle className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Customize Your Server</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Give your new server a personality with a name. You can always change it later.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
          <div className="text-center">
             <div className="w-24 h-24 rounded-full bg-cyan-500/20 inline-flex items-center justify-center mb-4">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(serverName) || 'Server'}`} alt="Server Icon Preview" className="w-20 h-20 rounded-full" />
             </div>
          </div>
          <Input
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="Enter a Server Name"
            className={`h-12 text-base text-center ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400/50' : 'bg-gray-100 border-gray-300 focus:border-cyan-500/50'}`}
          />
        </div>

        <DialogFooter className="p-6 flex-col">
          <Button onClick={handleCreateServer} className="w-full h-12 text-base bg-cyan-500 hover:bg-cyan-600 text-white" disabled={isLoading || !serverName.trim()}>
            {isLoading ? 'Creating...' : 'Create Server'}
          </Button>
          <Button variant="link" onClick={() => onOpenChange(false)} className={isDark ? 'text-gray-400 hover:text-white' : ''} disabled={isLoading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    