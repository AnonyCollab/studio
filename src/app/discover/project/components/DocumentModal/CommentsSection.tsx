
import React, { useState } from 'react';

interface CommentsSectionProps {
  comments: string[];
  addComment: (comment: string) => void;
  isLight: boolean;
}

export function CommentsSection({ comments, addComment, isLight }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (commentText.trim()) {
        addComment(commentText);
        setCommentText('');
      }
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
      <h3 className={`mb-6 uppercase text-xs font-bold tracking-wider ${headerClass}`}>Comments ({comments.length})</h3>
      
      <div className="flex items-start gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
          ME
        </div>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleSubmit}
          className={`flex-1 border rounded-lg px-4 py-2 outline-none transition-all shadow-sm ${inputClass}`}
        />
      </div>

      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((comment, idx) => (
            <div key={idx} className="flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm">
                U
              </div>
              <div className={`flex-1 p-3 rounded-r-lg rounded-bl-lg border ${bubbleClass}`}>
                <p className="text-sm">{comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
