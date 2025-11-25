
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Hash } from 'lucide-react';

interface CreateChannelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  theme: 'light' | 'dark';
  serverId: string;
}

export function CreateChannelDialog({ isOpen, onOpenChange, theme, serverId }: CreateChannelDialogProps) {
  const [channelName, setChannelName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const isDark = theme === 'dark';

  const handleCreateChannel = async () => {
    if (!channelName.trim() || !firestore || !serverId) return;

    setIsLoading(true);
    try {
        const channelsCollection = collection(firestore, 'servers', serverId, 'channels');
        await addDocumentNonBlocking(channelsCollection, {
            name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
            type: 'text',
        });

      toast({ title: 'Channel Created!', description: `#${channelName} is ready.` });
      setChannelName('');
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating channel:", error);
      toast({ title: 'Error', description: 'Failed to create channel.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md p-0 gap-0 ${isDark ? 'bg-[#131823] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Text Channel</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Channels are where your members communicate. They're best when organized around a topic.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-4">
            <div className="relative">
                 <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <Input
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="new-channel"
                    className={`h-12 text-base pl-10 ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-cyan-400/50' : 'bg-gray-100 border-gray-300 focus:border-cyan-500/50'}`}
                />
            </div>
        </div>

        <DialogFooter className="p-6 mt-2">
           <Button variant="ghost" onClick={() => onOpenChange(false)} className={isDark ? 'text-gray-400 hover:text-white' : ''} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateChannel} className="bg-cyan-500 hover:bg-cyan-600 text-white" disabled={isLoading || !channelName.trim()}>
            {isLoading ? 'Creating...' : 'Create Channel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
