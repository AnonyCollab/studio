
'use client';

import { ArrowLeft, MoreHorizontal, Image as ImageIcon, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import dynamic from 'next/dynamic';
import "@blocknote/core/fonts/inter.css";
import { useMemo } from 'react';
import "@blocknote/mantine/style.css";


// Lazily load the editor component
const Editor = dynamic(() => import("../components/Editor"), { ssr: false });

export default function WritePage() {
    const { theme } = useTheme();

    const editorComponent = useMemo(() => {
        // @ts-ignore
        return <Editor theme={theme} />;
    }, [theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-gray-100 flex flex-col">
       <main className="flex-1 flex flex-col items-center w-full pt-6">
        <div className="w-full max-w-4xl px-4">
          {editorComponent}
        </div>
      </main>
    </div>
  );
}
