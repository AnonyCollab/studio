"use client";

import { useState, useEffect } from 'react';
import CodeEditorPanel from '@/components/app/code-editor-panel';
import ContentRenderer from '@/components/app/content-renderer';
import { Skeleton } from '@/components/ui/skeleton';

const LS_KEYS = {
  html: 'cleanSlateHtml',
  css: 'cleanSlateCss',
  js: 'cleanSlateJs',
};

export default function Home() {
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on client-side mount
  useEffect(() => {
    try {
      const savedHtml = localStorage.getItem(LS_KEYS.html) ?? `<h1>Welcome to CleanSlate!</h1><p>Click the code icon to start editing.</p>`;
      const savedCss = localStorage.getItem(LS_KEYS.css) ?? `body {
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  text-align: center;
  background-color: #f9f9f9;
  color: #333;
}
h1 {
  font-size: 3rem;
  font-weight: 600;
  color: hsl(197, 71%, 63%);
}
p {
  font-size: 1.1rem;
  color: #666;
}`;
      const savedJs = localStorage.getItem(LS_KEYS.js) ?? `console.log("Welcome to the CleanSlate console!");`;
      
      setHtml(savedHtml);
      setCss(savedCss);
      setJs(savedJs);
    } catch (error) {
      console.error("Failed to access localStorage. Content will not be saved.", error);
    } finally {
      setIsMounted(true);
    }
  }, []);

  // Save to localStorage whenever content changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LS_KEYS.html, html);
      } catch (error) {
        console.error("Failed to save HTML to localStorage", error);
      }
    }
  }, [html, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LS_KEYS.css, css);
      } catch (error) {
        console.error("Failed to save CSS to localStorage", error);
      }
    }
  }, [css, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(LS_KEYS.js, js);
      } catch (error) {
        console.error("Failed to save JS to localStorage", error);
      }
    }
  }, [js, isMounted]);

  if (!isMounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
      <ContentRenderer html={html} css={css} js={js} />
      <CodeEditorPanel
        html={html}
        setHtml={setHtml}
        css={css}
        setCss={setCss}
        js={js}
        setJs={setJs}
      />
    </main>
  );
}
