
import React, { useMemo } from 'react';
import { Theme } from '../../types';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/app/news/components/Editor'), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />
});

interface ContentEditorProps {
  content: string;
  setContent: (content: string) => void;
  isLight: boolean;
  theme: Theme;
  collaborationId: string;
}

export function ContentEditor({ content, setContent, theme, collaborationId }: ContentEditorProps) {
  const editorComponent = useMemo(() => {
    return <Editor initialContent={content} onChange={setContent} editable={true} collaborationId={collaborationId} />;
  }, [content, setContent, collaborationId]);

  return (
    <div>
      {editorComponent}
    </div>
  );
}
