
'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send } from "lucide-react";
import { db } from "@/firebase/config";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

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

export function CommentItem({ postId, comment, theme = "dark" }: CommentItemProps) {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [visibleReplies, setVisibleReplies] = useState<Record<string, boolean>>({});
  const [isLiked, setIsLiked] = useState(false);
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const isDark = theme === "dark";

  useEffect(() => {
    if (!postId || !comment.id) return;

    const repliesQuery = query(collection(db, "posts", postId, "comments", comment.id, "replies"), orderBy("createdAt", "asc"));
    
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
  }, [postId, comment.id]);

  const handleSubmitReply = async (commentId: string) => {
    const content = replyContent.trim();
    if (!content) return;

    setReplyContent("");
    setReplyingTo(null);

    toast({ variant: "destructive", title: "Error", description: "Replying is currently disabled." });
  };

  const handleLikeComment = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState); // Optimistic UI update
    // Like functionality is disabled
  }

  const handleLikeReply = async (replyId: string) => {
    const newLikedState = !likedReplies[replyId];
    setLikedReplies(prev => ({...prev, [replyId]: newLikedState})); // Optimistic UI update
    // Like functionality is disabled
  }

  const toggleReplies = (commentId: string) => {
    setVisibleReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const renderReply = (reply: Reply) => {
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
                    <span className="text-xs text-gray-500">{reply.timestamp}</span>
                </div>
                <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{reply.content}</p>
            </div>
             <div className="flex items-center gap-4 mt-1.5 px-3">
                <button 
                  onClick={() => handleLikeReply(reply.id)}
                  className={cn("flex items-center gap-1 text-xs text-gray-500 transition-colors",
                    isReplyLiked ? "text-red-400" : "hover:text-red-400"
                  )}
                >
                    <Heart className={cn("w-3.5 h-3.5", isReplyLiked && "fill-current")} />
                    <span>{reply.likes}</span>
                </button>
                <button className={`text-xs text-gray-500 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>
                    Reply
                </button>
            </div>
        </div>
    </div>
  )};

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
                <span className="text-xs text-gray-500">{comment.timestamp}</span>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>{comment.content}</p>
            </div>
            <div className="flex items-center gap-4 mt-2 px-3">
            <button 
              onClick={handleLikeComment}
              className={cn("flex items-center gap-1 text-xs text-gray-500 transition-colors",
                isLiked ? "text-red-400" : "hover:text-red-400"
              )}
            >
                <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
                <span>{comment.likes}</span>
            </button>
            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className={`text-xs text-gray-500 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>
                Reply
            </button>
            {replies && replies.length > 0 && (
                <button onClick={() => toggleReplies(comment.id)} className={`text-xs text-gray-500 transition-colors ${isDark ? 'hover:text-cyan-400' : 'hover:text-cyan-600'}`}>
                    {visibleReplies[comment.id] ? 'Hide' : 'View'} {replies.length} replies
                </button>
            )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && (
                <div className="relative mt-3 ml-4">
                <Textarea
                    placeholder={`Replying to ${comment.author.name}...`}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className={`pr-10 resize-none text-sm ${isDark ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-600/50"}`}
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
