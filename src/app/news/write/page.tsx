'use client';

import { ArrowLeft, MoreHorizontal, Settings, HelpCircle } from 'lucide-react';
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
import { useMemo } from 'react';
import "@blocknote/mantine/style.css";


// Lazily load the editor component
const Editor = dynamic(() => import("../components/Editor"), { ssr: false });

export default function WritePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const editorComponent = useMemo(() => {
        return <Editor />;
    }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-background' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 h-16 flex-shrink-0 border-b ${isDark ? 'bg-background/80 backdrop-blur-sm border-white/10' : 'bg-white/80 backdrop-blur-sm border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/news" passHref>
                    <Button variant="ghost" size="icon" className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" className={isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"}>
                    Save draft
                </Button>
                <Button className={isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}>
                    Publish
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}>
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={isDark ? 'bg-[#1a1f2e] border-white/10 text-white' : ''}>
                        <DropdownMenuItem className={isDark ? 'focus:bg-white/10' : ''}>
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className={isDark ? 'focus:bg-white/10' : ''}>
                            <HelpCircle className="w-4 h-4 mr-2" />
                            <span>Help</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />
                        <DropdownMenuItem className={isDark ? 'text-red-400 focus:bg-red-500/10 focus:text-red-400' : 'text-red-600 focus:bg-red-50 focus:text-red-600'}>
                           Discard draft
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
      </header>
      
       <main className="flex-1 flex flex-col items-center w-full pt-6">
        <div className="w-full max-w-4xl px-4">
          {editorComponent}
        </div>
      </main>
    </div>
  );
}
