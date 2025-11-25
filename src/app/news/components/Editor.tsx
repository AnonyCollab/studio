
"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import {
  BlockNoteView,
  darkDefaultTheme,
  lightDefaultTheme,
  Theme,
} from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";
import { useTheme } from "@/context/ThemeContext";
import { Block } from "@blocknote/core";
import { useMemo } from "react";

// Yjs document
const doc = new Y.Doc();

// PartyKit provider
const provider = new YPartyKitProvider(
  "blocknote-dev.yousefed.partykit.dev",
  "news-feed-collaboration-room",
  doc
);

interface EditorProps {
    onChange?: (value: string) => void;
    initialContent?: string;
    editable?: boolean;
}

// Custom theme for dark mode to match app background
const darkTheme = {
  ...darkDefaultTheme,
  colors: {
    ...darkDefaultTheme.colors,
    editor: {
      ...darkDefaultTheme.colors!.editor,
      background: "hsl(var(--background))",
    },
  },
} satisfies Theme;

const customTheme = {
  light: lightDefaultTheme,
  dark: darkTheme,
};


// Our <Editor> component we can reuse later
export default function Editor({ onChange, initialContent, editable = true }: EditorProps) {
  const { theme } = useTheme();

  const initialBlocks: Block[] | undefined = useMemo(() => {
    if (!initialContent) return undefined;
    try {
      // First, try to parse it as a JSON string (which is what BlockNote saves as)
      return JSON.parse(initialContent) as Block[];
    } catch (e) {
      // If parsing fails, it's likely a plain string.
      // We'll wrap it in a paragraph block to make it valid for BlockNote.
      console.log("Initial content is not JSON, converting to paragraph block.");
      return [{ type: "paragraph", content: initialContent }];
    }
  }, [initialContent]);


  // Creates a new editor instance.
  const editor = useCreateBlockNote({
    initialContent: initialBlocks,
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: "My Username",
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      },
      showCursorLabels: "activity",
    },
  });

  // Renders the editor instance using a React component.
  return <BlockNoteView 
    editor={editor} 
    theme={customTheme}
    editable={editable}
    onChange={() => {
        if(onChange) {
            onChange(JSON.stringify(editor.document, null, 2));
        }
    }}
  />;
}
