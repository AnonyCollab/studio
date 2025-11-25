
"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { Block, BlockNoteEditor } from "@blocknote/core";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import {
  BlockNoteView,
  darkDefaultTheme,
  lightDefaultTheme,
  Theme
} from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { useTheme } from "@/context/ThemeContext";
import { useMemo } from "react";

// Custom theme for dark mode to match app background
const darkTheme = {
  ...darkDefaultTheme,
  colors: {
    ...darkDefaultTheme.colors,
    editor: {
      ...darkDefaultTheme.colors!.editor,
      background: "#18181b", // Updated to match the task window background
    },
  },
} satisfies Theme;

const customTheme = {
  light: lightDefaultTheme,
  dark: darkTheme,
};

interface EditorProps {
    onChange?: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
    collaborationId?: string;
}

// Our <Editor> component we can reuse later
export default function Editor({ onChange, initialContent, editable, collaborationId }: EditorProps) {
  const { theme } = useTheme();

  const initialBlocks: Block[] | undefined = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      return JSON.parse(initialContent) as Block[];
    } catch(e) {
        // If parsing fails, treat it as plain text and wrap in a paragraph
        return [{ type: "paragraph", content: initialContent }];
    }
  }, [initialContent])

  const collaborationOptions = useMemo(() => {
    if (!collaborationId) return undefined;
    const doc = new Y.Doc();
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;

    if (!host) {
        console.error("NEXT_PUBLIC_PARTYKIT_HOST is not set in your environment variables.");
        return undefined;
    }
    
    return {
      provider: new YPartyKitProvider(host, collaborationId, doc),
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: "My Username",
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      },
      showCursorLabels: "activity",
    } as const;
  }, [collaborationId]);

  // Creates a new editor instance.
  const editor: BlockNoteEditor | null = useCreateBlockNote({
    initialContent: initialBlocks,
    collaboration: collaborationOptions,
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView 
    editor={editor} 
    theme={theme === 'dark' ? darkTheme : lightDefaultTheme}
    editable={editable}
    onChange={() => {
        if(onChange && editor && editable) {
            onChange(JSON.stringify(editor.document, null, 2));
        }
    }}
  />;
}
