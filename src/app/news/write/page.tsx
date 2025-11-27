
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
import { useMemo, useState } from 'react';
import "@blocknote/mantine/style.css";
import { Input } from '@/components/ui/input';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { publishArticle } from '@/firebase/non-blocking-updates';
import { v4 as uuidv4 } from 'uuid';

// Lazily load the editor component
const Editor = dynamic(() => import("../components/Editor"), { ssr: false });

export default function WritePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const router = useRouter();

    // Generate a unique ID for this new article's collaboration session
    const collaborationId = useMemo(() => `article-${uuidv4()}`, []);


    const handlePublish = async () => {
        if (!title.trim()) {
            toast({ variant: 'destructive', title: 'Title is required' });
            return;
        }
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'Content cannot be empty' });
            return;
        }
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'You must be logged in to publish' });
            return;
        }

        setIsSubmitting(true);
        try {
            await publishArticle(firestore, { title, content }, user);
            toast({ title: 'Success!', description: 'Your article has been published.' });
            router.push('/news');
        } catch (error) {
            console.error("Publishing error: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish article.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const editorComponent = useMemo(() => {
        return <Editor onChange={setContent} editable={true} collaborationId={collaborationId} />;
    }, [collaborationId]);

  return (
    <div className={`min-h-screen flex flex-col items-center w-full ${isDark ? 'bg-background' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-[3.5rem] z-40 h-16 flex-shrink-0 w-full max-w-4xl ${isDark ? 'bg-background' : 'bg-gray-50'}`}>
        <div className="h-full flex items-center justify-between px-4">
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
                <Button onClick={handlePublish} disabled={isSubmitting} className={isDark ? "bg-cyan-400 hover:bg-cyan-500 text-gray-900" : "bg-cyan-600 hover:bg-cyan-700 text-white"}>
                    {isSubmitting ? 'Publishing...' : 'Publish'}
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
          <Input 
            placeholder="Article Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`text-3xl md:text-4xl font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto mb-8 bg-transparent ${isDark ? 'text-white placeholder:text-gray-600' : 'text-gray-900 placeholder:text-gray-400'}`}
          />
          {editorComponent}
        </div>
      </main>
    </div>
  );
}

    