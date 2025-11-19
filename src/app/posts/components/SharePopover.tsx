
'use client';

import { ReactNode, useState, useMemo, useEffect } from "react";
import { Check, Copy, Twitter, Linkedin, Facebook, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  isGroup: boolean;
}

interface SharePopoverProps {
  children: ReactNode;
}

export function SharePopover({ children }: SharePopoverProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user: currentUser } = useUser();
  const firestore = useFirestore();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sentTo, setSentTo] = useState<string[]>([]);
  
  const dmsQuery = useMemoFirebase(() => {
    if (!firestore || !currentUser) return null;
    return query(collection(firestore, 'dms'), where('participants', 'array-contains', currentUser.uid));
  }, [firestore, currentUser]);

  const { data: dmsData } = useCollection(dmsQuery);

  useEffect(() => {
    if (!dmsData || !firestore || !currentUser) return;

    const fetchConversations = async () => {
      const convos: Conversation[] = await Promise.all(
        dmsData.map(async (dm) => {
          if (dm.isGroup) {
            return {
              id: dm.id,
              name: dm.groupName,
              avatar: dm.groupAvatar,
              isGroup: true,
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
            name: otherUserData.displayName || 'Unknown User',
            avatar: otherUserData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
            isGroup: false,
          };
        })
      );
      setConversations(convos.filter(Boolean) as Conversation[]);
    };

    fetchConversations();
  }, [dmsData, firestore, currentUser]);

  const copyToClipboard = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setHasCopied(true);
      toast({
        title: "Link Copied!",
        description: "The post URL has been copied to your clipboard.",
      });
      setTimeout(() => {
          setHasCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please try again.",
      });
    }
  };

  const handleSend = async (conversationId: string) => {
    if (!firestore || !currentUser) return;
    
    const messageText = `Check out this post: ${window.location.href}`;
    const messageData = {
        senderId: currentUser.uid,
        text: messageText,
        createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(firestore, 'dms', conversationId, 'messages'), messageData);
    
    setSentTo(prev => [...prev, conversationId]);

    toast({
        title: "Post Sent!",
        description: "The post has been sent to the conversation.",
    });

    setTimeout(() => {
      setSentTo(prev => prev.filter(id => id !== conversationId));
      setIsOpen(false);
    }, 2000);
  };


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <div className="p-4 space-y-2">
            <h4 className="font-medium leading-none">Share Post</h4>
            <p className="text-sm text-muted-foreground">
              Share this post with others.
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 pb-4">
            <Input
              value={typeof window !== 'undefined' ? window.location.href : ''}
              readOnly
              className="h-9"
            />
            <Button onClick={copyToClipboard} size="icon" className="h-9 w-9">
              {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex justify-around px-4 pb-4">
            <Button variant="ghost" size="icon"><Twitter className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Linkedin className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Facebook className="h-5 w-5" /></Button>
          </div>
          <Separator />
           <div className="p-4 space-y-2">
             <h4 className="font-medium leading-none">Send to</h4>
             <Input placeholder="Search friends or groups..." className="h-9" />
           </div>
           <ScrollArea className="h-48">
             <div className="px-4 pb-4">
                {conversations.map(convo => (
                    <div key={convo.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={convo.avatar} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm">{convo.name}</span>
                        </div>
                        <Button
                          variant={sentTo.includes(convo.id) ? "ghost" : "default"}
                          size="sm"
                          className="h-8 px-3"
                          onClick={() => handleSend(convo.id)}
                          disabled={sentTo.includes(convo.id)}
                        >
                          {sentTo.includes(convo.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                    </div>
                ))}
             </div>
           </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
