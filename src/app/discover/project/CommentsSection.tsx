import React, { useState } from 'react';

interface CommentsSectionProps {
  comments: string[];
  addComment: (comment: string) => void;
}

export function CommentsSection({ comments, addComment }: CommentsSectionProps) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div>
      <h3 className="text-gray-400 mb-4">Comments</h3>
      
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
          I
        </div>
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={handleSubmit}
          className="flex-1 bg-transparent border-none outline-none text-gray-500 placeholder-gray-600"
        />
      </div>

      {comments.length > 0 && (
        <div className="mt-4 space-y-3">
          {comments.map((comment, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                I
              </div>
              <div className="flex-1">
                <p className="text-sm">{comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}