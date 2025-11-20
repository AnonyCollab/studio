
'use client';
import { useMemo } from 'react';
import { BlockNoteView } from "@blocknote/react";
import { useCreateBlockNote } from "@blocknote/react";
import { Block, BlockNoteEditor } from '@blocknote/core';

interface EditorProps {
  initialContent?: Block[];
  onChange?: (content: Block[]) => void;
  theme: "light" | "dark";
}

export default function Editor({ initialContent, onChange, theme }: EditorProps) {
  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent ? initialContent : undefined,
  });

  const handleEditorChange = () => {
    if (onChange) {
      onChange(editor.document);
    }
  };

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
