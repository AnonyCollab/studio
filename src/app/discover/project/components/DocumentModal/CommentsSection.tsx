
import React, { useState } from 'react';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/firebase/non-blocking-updates';
import { useFirestore } from '@/firebase';
import { MentionPopover } from '@/app/posts/components/MentionPopover';
import { mockUsers } from '@/app/messages/data/mockUsers';

interface CommentsSectionProps {
  comments: any[];
  addComment: (comment: string) => void;
  isLight: boolean;
  postId: string;
  theme: string;
}

export function CommentsSection({ comments, addComment: addCommentProp, isLight, postId, theme }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<EventTarget & HTMLTextAreaElement | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);

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

    const text = commentText;
    const cursorPos = mentionTarget.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    const textAfterCursor = text.substring(cursorPos);

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
        const startIndex = mentionMatch.index || 0;
        const newText = `${text.substring(0, startIndex)}@${username} ${textAfterCursor}`;
        setCommentText(newText);
    }

    setMentionQuery(null);
    setMentionTarget(null);
    mentionTarget.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user || !firestore) {
      if (!user) toast({ variant: "destructive", title: "Authentication required" });
      return;
    };
    
    try {
        await addComment(firestore, postId, commentText, user);
        setCommentText('');
    } catch(err) {
        console.error("Error adding comment: ", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to add comment." });
    }
  };


  const headerClass = isLight ? "text-slate-400" : "text-slate-500";
  const inputClass = isLight 
    ? "bg-white border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-400 focus:ring-slate-200" 
    : "bg-[#252525] border-gray-700 text-gray-300 placeholder-gray-600 focus:border-gray-500";
  const bubbleClass = isLight 
    ? "bg-slate-50 border-slate-200 text-slate-700" 
    : "bg-[#252525] border-gray-800 text-gray-300";

  return (
    <div>
        <MentionPopover
            query={mentionQuery}
            onSelect={handleMentionSelect}
            target={mentionTarget}
            users={Object.values(mockUsers)}
            theme={theme}
        >
            <form onSubmit={handleSubmit} className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
                ME
                </div>
                <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className={`flex-1 border rounded-lg px-4 py-2 outline-none transition-all shadow-sm ${inputClass}`}
                />
            </form>
       </MentionPopover>

      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment, idx) => (
            <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
                U
              </div>
              <div className={`flex-1 p-3 rounded-r-lg rounded-bl-lg border ${bubbleClass}`}>
                <p className="text-sm">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
