'use client';

import { useTheme } from '@/context/ThemeContext';
import { notFound, useParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Bookmark, Clapperboard, Copy, Linkedin, MessageCircle, Send, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';


// This needs to be defined to be used with the useDoc hook generic
interface Article {
    id: string;
    title: string;
    description: string;
    authorName: string;
    authorImage: string;
    date: string;
    readTime: string;
    image: string;
    category: string;
    content: string; 
    createdAt?: Timestamp | string;
}


const Editor = dynamic(() => import("../components/Editor"), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />
});

export default function ArticlePage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const params = useParams();
  const articleId = params.articleId as string;
  const firestore = useFirestore();

  useEffect(() => {
    if (articleId) {
      console.log(`Opening news article with ID: ${articleId}`);
    }
  }, [articleId]);

  const articleRef = useMemoFirebase(() => {
    if (!firestore || !articleId) return null;
    return doc(firestore, 'news', articleId);
  }, [firestore, articleId]);

  const { data: articleData, isLoading } = useDoc<Article>(articleRef);
  
  const article = useMemo(() => {
    if (!articleData) return null;
    return {
        ...articleData,
        date: articleData.createdAt ? format(new Date((articleData.createdAt as Timestamp).seconds * 1000), 'MMM dd, yyyy') : 'N/A',
        image: `https://picsum.photos/seed/${articleData.id}/1200/600`, // Placeholder image
    };
  }, [articleData]);

  const editorComponent = useMemo(() => {
      if (!article?.content) return <div className="h-64 w-full bg-muted/50 animate-pulse rounded-lg" />;
      return <Editor initialContent={article.content} editable={false} />;
  }, [article?.content]);

  if (isLoading) {
    return (
        <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
            <Loader className="w-8 h-8 animate-spin" />
        </div>
    )
  }

  if (!article) {
    notFound();
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-background' : 'bg-gray-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/news" passHref>
                    <Button variant="ghost" className={`flex items-center gap-2 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to News
                    </Button>
                </Link>
            </div>
            
            <article>
                <header className="mb-12 text-center">
                    <div className="mb-4">
                        <Badge 
                            variant="outline" 
                            className={`mb-4 ${
                                isDark 
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" 
                                : "bg-cyan-100 text-cyan-700 border-cyan-300"
                            }`}
                        >
                            {article.category}
                        </Badge>
                    </div>
                    <h1 className={`text-3xl md:text-5xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{article.title}</h1>
                    <div className="flex items-center justify-center gap-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={article.authorImage} alt={article.authorName} />
                            <AvatarFallback>{article.authorName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{article.authorName}</p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{article.date} · {article.readTime}</p>
                        </div>
                    </div>
                </header>

                {article.image && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-12">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                )}
                
                <div className="prose prose-lg dark:prose-invert max-w-none mx-auto">
                     {editorComponent}
                </div>

                <Separator className={`my-12 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

                {/* Footer Actions */}
                <footer className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" className={`gap-2 ${isDark ? 'text-gray-300 hover:bg-white/5 border-white/10' : 'text-gray-700'}`}>
                            <Clapperboard className="w-5 h-5" />
                            <span>1.2K</span>
                        </Button>
                        <Button variant="outline" className={`gap-2 ${isDark ? 'text-gray-300 hover:bg-white/5 border-white/10' : 'text-gray-700'}`}>
                            <MessageCircle className="w-5 h-5" />
                            <span>87</span>
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500'}><Twitter className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500'}><Linkedin className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500'}><Copy className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500'}><Bookmark className="w-5 h-5" /></Button>
                    </div>
                </footer>
            </article>

        </div>
    </div>
  );
}
