

'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { CommentItem } from "./CommentItem";
import { useFirestore, useUser } from "@/firebase";
import { addComment } from "@/firebase/non-blocking-updates";
import { MentionPopover } from "./MentionPopover";
import { mockUsers } from "@/app/messages/data/mockUsers";

interface Author {
  name: string;
  avatar: string;
}

interface Comment {
  id:string;
  authorId: string;
  content: string;
  timestamp: string;
  createdAt: Timestamp;
  likes: number;
}

interface CommentSectionProps {
  postId: string;
  theme?: "light" | "dark";
}

export function CommentSection({ postId, theme = "dark" }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const isDark = theme === "dark";
  const firestore = useFirestore();
  const { user } = useUser();

  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<EventTarget & HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!firestore || !postId) return;

    const q = query(collection(firestore, "posts", postId, "comments"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          authorId: data.authorId,
          content: data.content,
          createdAt: data.createdAt,
          timestamp: data.createdAt ? formatDistanceToNow(data.createdAt.toDate(), { addSuffix: true }) : 'just now',
          likes: data.likes,
        } as Comment;
      });
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [firestore, postId]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);

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

    const text = newComment;
    const cursorPos = mentionTarget.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
        const startIndex = mentionMatch.index || 0;
        const newText = `${text.substring(0, startIndex)}@${username} ${textAfterCursor}`;
        setNewComment(newText);
    }

    setMentionQuery(null);
    setMentionTarget(null);
    mentionTarget.focus();
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    if (!user) {
      toast({ variant: "destructive", title: "Authentication required", description: "You must be logged in to comment." });
      return;
    }
    
    if (!firestore) return;

    try {
      await addComment(firestore, postId, content, user);
      setNewComment("");
    } catch(err) {
      console.error("Error adding comment: ", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to add comment." });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 p-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <h3 className={isDark ? "text-white" : "text-gray-900"}>Comments ({comments.length})</h3>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} postId={postId} comment={comment} theme={theme} />
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>

      {/* Add Comment Form - Sticky at bottom */}
      <div className={`sticky bottom-0 p-6 border-t ${isDark ? 'bg-[#0a0e1a] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
        <MentionPopover
            query={mentionQuery}
            onSelect={handleMentionSelect}
            target={mentionTarget}
            users={Object.values(mockUsers)}
            theme={theme}
        >
            <form onSubmit={handleSubmitComment} className="relative">
            <Textarea
                placeholder="Add a comment... (@mention someone)"
                value={newComment}
                onChange={handleCommentChange}
                className={`pr-12 resize-none ${isDark ? "bg-[#131823] border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400/50" : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-cyan-500/50"}`}
                rows={2}
            />
            <Button
                type="submit"
                disabled={!newComment.trim()}
                size="icon"
                className={`absolute right-2 bottom-2 h-8 w-8 ${isDark ? 'bg-cyan-400 hover:bg-cyan-500 text-gray-900' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
            >
                <Send className="w-4 h-4" />
            </Button>
            </form>
        </MentionPopover>
      </div>
    </div>
  );
}
