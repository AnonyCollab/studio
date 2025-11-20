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

// Yjs document
const doc = new Y.Doc();

// PartyKit provider
const provider = new YPartyKitProvider(
  "blocknote-dev.yousefed.partykit.dev",
  "news-feed-collaboration-room",
  doc
);

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
export default function Editor() {
  const { theme } = useTheme();
  // Creates a new editor instance.
  const editor = useCreateBlockNote({
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
  return <BlockNoteView editor={editor} theme={customTheme} />;
}
