
import React, { useRef, useLayoutEffect } from 'react';

interface ContentEditorProps {
  content: string;
  setContent: (content: string) => void;
  isLight: boolean;
}

export function ContentEditor({ content, setContent, isLight }: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textClass = isLight ? "text-slate-800 placeholder:text-slate-300" : "text-slate-300 placeholder:text-slate-700";

  useLayoutEffect(() => {
    if (textareaRef.current) {
        // Reset height to allow shrinking
        textareaRef.current.style.height = 'inherit';
        // Set to scrollHeight
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={`w-full bg-transparent border-none outline-none resize-none min-h-[100px] leading-relaxed text-lg focus:ring-0 p-0 overflow-hidden ${textClass}`}
        placeholder="Start typing your description here..."
      />
    </div>
  );
}
