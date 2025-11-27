
'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { addReply, toggleLikeComment, toggleLikeReply, deleteComment, deleteReply } from "@/firebase/non-blocking-updates";
import { MentionPopover } from "./MentionPopover";
import { mockUsers } from "@/app/messages/data/mockUsers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Author {
  name: string;
  avatar: string;
  uid: string;
}

interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
}

interface Reply {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  likes: number;
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  likes: number;
}

interface CommentItemProps {
  postId: string; // can also be taskId
  comment: Comment;
  theme?: "light" | "dark";
  isTaskComment?: boolean;
  projectId?: string | null;
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

const AuthorInfo = ({ authorId, isDark, timestamp }: { authorId: string, isDark: boolean, timestamp: string }) => {
  const firestore = useFirestore();
  const userRef = useMemoFirebase(() => {
    if (!firestore || !authorId) return null;
    return doc(firestore, 'users', authorId);
  }, [firestore, authorId]);
  const { data: authorData } = useDoc<{ profile: UserProfile }>(userRef);

  if (!authorData) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Loading...</p>
        </div>
    );
  }

  const author = authorData.profile;

  return (
    <div className="flex items-baseline justify-between">
      <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{author.displayName}</p>
      <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{timestamp}</span>
    </div>
  );
};


const ReplyAuthorInfo = ({ authorId, isDark, timestamp }: { authorId: string, isDark: boolean, timestamp: string }) => {
    const firestore = useFirestore();
    const userRef = useMemoFirebase(() => {
        if (!firestore || !authorId) return null;
        return doc(firestore, 'users', authorId);
    }, [firestore, authorId]);
    const { data: authorData } = useDoc<{ profile: UserProfile }>(userRef);

    if (!authorData) return <div className="h-8" />; // Placeholder for loading state

    const author = authorData.profile;

    return (
        <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={author.photoURL} />
                <AvatarFallback>{author.displayName?.[0]}</AvatarFallback>
            </Avatar>
            <div className={`rounded-lg p-2.5 border w-full ${isDark ? "bg-transparent" : "bg-gray-50"}`}>
                <div className="flex items-baseline justify-between mb-1">
                    <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{author.displayName}</p>
                    <span className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{timestamp}</span>
                </div>
            </div>
        </div>
    );
};



export function CommentItem({ postId, comment, theme = "dark", isTaskComment = false, projectId }: CommentItemProps) {
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
  const [isCommentDeleteDialogOpen, setIsCommentDeleteDialogOpen] = useState(false);
  const [isReplyDeleteDialogOpen, setIsReplyDeleteDialogOpen] = useState<string | null>(null);

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<EventTarget & HTMLTextAreaElement | null>(null);
  
  const commentAuthorRef = useMemoFirebase(() => {
    if (!firestore || !comment.authorId) return null;
    return doc(firestore, 'users', comment.authorId);
  }, [firestore, comment.authorId]);
  const { data: commentAuthorData } = useDoc<{ profile: UserProfile }>(commentAuthorRef);
  const authorProfile = commentAuthorData?.profile;


  const basePath = useMemo(() => {
    if (isTaskComment && projectId && postId && comment.id) {
      return `projects/${projectId}/tasks/${postId}/comments/${comment.id}`;
    }
    if (!isTaskComment && postId && comment.id) {
      return `posts/${postId}/comments/${comment.id}`;
    }
    return null;
  }, [isTaskComment, projectId, postId, comment.id]);

  useEffect(() => {
    if (!firestore || !basePath) return;

    const repliesQuery = query(collection(firestore, basePath, "replies"), orderBy("createdAt", "asc"));

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
  }, [firestore, basePath]);

  const handleSubmitReply = async (commentId: string) => {
    const content = replyContent.trim();
    if (!content) return;
    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "You must be logged in to reply." });
      return;
    }
    if (!firestore || !basePath) return;

    try {
      await addReply(firestore, basePath, content, user);
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
    if (firestore) {
      toggleLikeComment(firestore, postId, comment.id, isLiked, isTaskComment, projectId);
    }
  }

  const handleLikeReply = async (replyId: string) => {
    const newLikedState = !likedReplies[replyId];
    setLikedReplies(prev => ({ ...prev, [replyId]: newLikedState }));
    if (firestore && basePath) {
      toggleLikeReply(firestore, basePath, replyId, likedReplies[replyId]);
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
    const isAuthor = user && user.uid === reply.authorId;

    return (
        <div key={reply.id} className="flex items-start gap-3 group/reply">
            <ReplyAuthorInfo authorId={reply.authorId} isDark={isDark} timestamp={reply.timestamp} />
            <div className="flex-1 min-w-0">
            <div className={`rounded-lg p-2.5 border ${isDark ? "bg-transparent" : "bg-gray-50"}`}>
                
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
    )
  }, [isDark, likedReplies, handleLikeReply, replyingTo, comment.id, user, firestore, postId, isReplyDeleteDialogOpen, authorProfile]);

  return (
    <div className="flex flex-col group/comment">
      <div className="flex items-start gap-3">
        {authorProfile && (
            <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={authorProfile.photoURL} />
                <AvatarFallback>{authorProfile.displayName?.[0]}</AvatarFallback>
            </Avatar>
        )}
        <div className="flex-1">
            <div className={`rounded-lg p-3 border ${isDark ? "bg-[#18181b]" : "bg-white border-gray-200"}`}>
              <AuthorInfo authorId={comment.authorId} isDark={isDark} timestamp={comment.timestamp} />
              <p className={`text-sm mt-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
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
        </div>
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
          <div className="relative mt-3 ml-12">
            <Textarea
              placeholder={`Replying to this comment...`}
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
        <div className="mt-4 pl-12 space-y-4">
          {replies.map(reply => renderReply(reply))}
        </div>
      )}
    </div>
  )
}
