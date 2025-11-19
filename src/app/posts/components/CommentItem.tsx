

'use client';

import { useState, useEffect, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send } from "lucide-react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { useFirestore, useUser } from "@/firebase";
import { addReply, toggleLikeComment, toggleLikeReply } from "@/firebase/non-blocking-updates";
import { MentionPopover } from "./MentionPopover";
import { mockUsers } from "@/app/messages/data/mockUsers";

interface Author {
  name: string;
  avatar: string;
}

interface Reply {
  id: string;
  author: Author;
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  likes: number;
}

interface Comment {
  id:string;
  author: Author;
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  likes: number;
}

interface CommentItemProps {
  postId: string;
  comment: Comment;
  theme?: "light" | "dark";
}

const renderContentWithMentions = (content: string, isDark: boolean) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className={isDark ? "text-cyan-400 font-semibold" : "text-cyan-600 font-semibold"}>
            {part}
          </span>
        );
      }
      return part;
    });
};

export function CommentItem({ postId, comment, theme = "dark" }: CommentItemProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [visibleReplies, setVisibleReplies] = useState<Record<string, boolean>>({});
  const [isLiked, setIsLiked] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isDark = theme === "dark";

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<EventTarget & HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!firestore || !postId || !comment.id) return;

    const repliesQuery = query(collection(firestore, "posts", postId, "comments", comment.id, "replies"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(repliesQuery, (replySnapshot) => {
        const repliesData = replySnapshot.docs.map(replyDoc => {
            const replyData = replyDoc.data();
            return {
                id: replyDoc.id,
                ...replyData,
                timestamp: replyData.createdAt ? formatDistanceToNow(replyData.createdAt.toDate(), { addSuffix: true }) : 'just now',
            } as Reply;
        });
        setReplies(repliesData);
    });

    return () => unsubscribe();
  }, [firestore, postId, comment.id]);

  const handleSubmitReply = async (commentId: string) => {
    const content = replyContent.trim();
    if (!content) return;
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "You must be logged in to reply." });
      return;
    }
    if (!firestore) return;

    try {
      await addReply(firestore, postId, commentId, content, user);
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Error adding reply: ", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to add reply." });
    }
  };

  const handleLikeComment = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if(firestore) {
        toggleLikeComment(firestore, postId, comment.id, isLiked);
    }
  }

  const handleLikeReply = async (replyId: string) => {
    const newLikedState = !likedReplies[replyId];
    setLikedReplies(prev => ({...prev, [replyId]: newLikedState}));
    if (firestore) {
        toggleLikeReply(firestore, postId, comment.id, replyId, likedReplies[replyId]);
    }
  }

  const toggleReplies = (commentId: string) => {
    setVisibleReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setReplyContent(text);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w+)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionTarget(e.target);
    } else {
      setMentionQuery(null);
      setMentionTarget(null);
    }
  };

  const handleMentionSelect = (username: string) => {
    if (!mentionTarget) return;

    const text = replyContent;
    const cursorPos = mentionTarget.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
        const startIndex = mentionMatch.index || 0;
        const newText = `${text.substring(0, startIndex)}@${username} ${textAfterCursor}`;
        setReplyContent(newText);
    }

    setMentionQuery(null);
    setMentionTarget(null);
  };


  const renderReply = useCallback((reply: Reply) => {
    const isReplyLiked = likedReplies[reply.id];
    return (
    <div key={reply.id} className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={reply.author.avatar} />
            <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <div className={`rounded-lg p-2.5 border ${isDark ? "bg-[#131823] border-white/10" : "bg-gray-100 border-gray-200"}`}>
                <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{reply.author.name}</p>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{reply.timestamp}</span>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {renderContentWithMentions(reply.content, isDark)}
                </p>
            </div>
             <div className="flex items-center gap-4 mt-1.5 px-3">
                <button 
                  onClick={() => handleLikeReply(reply.id)}
                  className={cn("flex items-center gap-1 text-xs transition-colors",
                    isReplyLiked ? "text-red-400" : isDark ? "text-gray-500 hover:text-red-400" : "text-gray-500 hover:text-red-500"
                  )}
                >
                    <Heart className={cn("w-3.5 h-3.5", isReplyLiked && "fill-current")} />
                    <span>{reply.likes}</span>
                </button>
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} 
                  className={`text-xs transition-colors ${isDark ? 'text-gray-500 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}
                >
                    Reply
                </button>
            </div>
        </div>
    </div>
  )}, [isDark, likedReplies, handleLikeReply, replyingTo, comment.id]);

  return (
    <div className="flex gap-3">
        <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
            <div className={`rounded-lg p-3 border ${isDark ? "bg-[#131823] border-white/10" : "bg-gray-100 border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
                <p className={`text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{comment.author.name}</p>
                <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{comment.timestamp}</span>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {renderContentWithMentions(comment.content, isDark)}
            </p>
            </div>
            <div className="flex items-center gap-4 mt-2 px-3">
            <button 
              onClick={handleLikeComment}
              className={cn("flex items-center gap-1 text-xs transition-colors",
                isLiked ? "text-red-400" : isDark ? "text-gray-500 hover:text-red-400" : "text-gray-500 hover:text-red-500"
              )}
            >
                <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
                <span>{comment.likes}</span>
            </button>
            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className={`text-xs transition-colors ${isDark ? 'text-gray-500 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
                Reply
            </button>
            {replies && replies.length > 0 && (
                <button onClick={() => toggleReplies(comment.id)} className={`text-xs transition-colors ${isDark ? 'text-gray-500 hover:text-cyan-400' : 'text-gray-500 hover:text-cyan-600'}`}>
                    {visibleReplies[comment.id] ? 'Hide' : 'View'} {replies.length} replies
                </button>
            )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && (
            <MentionPopover
                query={mentionQuery}
                onSelect={handleMentionSelect}
                target={mentionTarget}
                users={Object.values(mockUsers)}
                theme={theme}
            >
                <div className="relative mt-3 ml-4">
                    <Textarea
                        placeholder={`Replying to ${comment.author.name}...`}
                        value={replyContent}
                        onChange={handleReplyChange}
                        className={`pr-10 resize-none text-sm ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`}
                        rows={1}
                    />
                    <Button
                        type="button"
                        onClick={() => handleSubmitReply(comment.id)}
                        disabled={!replyContent.trim()}
                        size="icon"
                        className={`absolute right-1.5 bottom-1.5 h-7 w-7 ${isDark ? 'bg-cyan-400 hover:bg-cyan-500 text-gray-900' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
                    >
                        <Send className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </MentionPopover>
            )}

            {/* Replies Section */}
            {visibleReplies[comment.id] && replies && replies.length > 0 && (
            <div className="mt-4 pl-8 space-y-4">
                {replies.map(reply => renderReply(reply))}
            </div>
            )}
        </div>
    </div>
  )
}

    