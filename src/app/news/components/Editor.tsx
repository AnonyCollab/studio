
'use client';
import { useMemo } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { Block, BlockNoteEditor } from '@blocknote/core';

interface EditorProps {
  initialContent?: Block[];
  onChange?: (content: Block[]) => void;
  theme: "light" | "dark";
}

export default function Editor({ initialContent, onChange, theme }: EditorProps) {
  const editor: BlockNoteEditor | null = useCreateBlockNote({
    initialContent: initialContent ? initialContent : undefined,
  });

  const handleEditorChange = () => {
    if (onChange && editor) {
      onChange(editor.document);
    }
  };

  if (!editor) {
    return <div>Loading Editor...</div>;
  }

  return (
    <div className="prose prose-lg dark:prose-invert max-w-full">
        <BlockNoteView
            editor={editor}
            theme={theme}
            onChange={handleEditorChange}
            className="bg-transparent"
        />
    </div>
  );
}
