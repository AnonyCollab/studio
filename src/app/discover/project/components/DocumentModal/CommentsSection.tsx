
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addComment } from '@/firebase/non-blocking-updates';
import { collection, query, orderBy } from 'firebase/firestore';
import { MentionPopover } from '@/app/posts/components/MentionPopover';
import { mockUsers } from '@/app/messages/data/mockUsers';
import { CommentItem } from '@/app/posts/components/CommentItem';

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: string;
  createdAt: any;
  likes: number;
}


interface CommentsSectionProps {
  taskId: string;
  isLight: boolean;
  theme: string;
  projectId: string | null;
}

export function CommentsSection({ taskId, isLight, theme, projectId }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionTarget, setMentionTarget] = useState<EventTarget & HTMLTextAreaElement | null>(null);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const commentsQuery = useMemoFirebase(() => {
    if (!firestore || !projectId || !taskId) {
      console.log('CommentsSection: Skipping query because firestore, projectId, or taskId is missing.', { firestore, projectId, taskId });
      return null;
    }
    const path = `projects/${projectId}/tasks/${taskId}/comments`;
    console.log("DEBUG: Constructing comments query for path:", path);
    return query(collection(firestore, path), orderBy('createdAt', 'asc'));
  }, [firestore, projectId, taskId]);

  const { data: commentsData } = useCollection<Comment>(commentsQuery);

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
    if (!commentText.trim() || !user || !firestore || !projectId) {
      if (!user) toast({ variant: "destructive", title: "Authentication required" });
      return;
    };
    
    try {
        await addComment(firestore, `projects/${projectId}/tasks/${taskId}`, commentText, user, true);
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
                {user?.displayName?.[0] || '?'}
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

      {(commentsData || []).length > 0 && (
        <div className="space-y-4">
          {commentsData?.map((comment) => (
             <CommentItem key={comment.id} postId={taskId} comment={comment} theme={theme} isTaskComment={true} projectId={projectId} />
          ))}
        </div>
      )}
    </div>
  );
}
