

'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send } from "lucide-react";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { CommentItem } from "./CommentItem";
import { useFirestore } from "@/firebase";

interface Author {
  name: string;
  avatar: string;
}

interface Comment {
  id:string;
  author: Author;
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

  useEffect(() => {
    if (!firestore || !postId) return;

    const q = query(collection(firestore, "posts", postId, "comments"), orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const commentsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.author,
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


  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;

    setNewComment("");
    toast({ variant: "destructive", title: "Error", description: "Adding comments is currently disabled." });
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
        <form onSubmit={handleSubmitComment} className="relative">
          <Textarea
            placeholder="Add a comment... (@mention someone)"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
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
      </div>
    </div>
  );
}
