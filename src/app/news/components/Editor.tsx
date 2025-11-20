"use client"; // this registers <Editor> as a Client Component
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import * as Y from "yjs";
import YPartyKitProvider from "y-partykit/provider";

// Yjs document
const doc = new Y.Doc();

// PartyKit provider
const provider = new YPartyKitProvider(
  "blocknote-dev.yousefed.partykit.dev",
  "news-feed-collaboration-room",
  doc
);

// Our <Editor> component we can reuse later
export default function Editor() {
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
  return <BlockNoteView editor={editor} theme={"light"} />;
}