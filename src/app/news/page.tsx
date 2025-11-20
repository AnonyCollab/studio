
'use client';

import { useTheme } from '@/context/ThemeContext';
import { ArticleCard } from './components/ArticleCard';
import { CategoryNav } from './components/CategoryNav';
import { TrendingTopics } from './components/TrendingTopics';
import { Article } from './data';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function NewsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const firestore = useFirestore();

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: articlesData, isLoading } = useCollection<Omit<Article, 'id'>>(articlesQuery);

  const articles = useMemo(() => {
    if (!articlesData) return [];
    // Correctly map the document id to the article object
    return articlesData.map(article => ({
      ...article,
      id: article.id, // Ensure the ID from the collection is included
      date: article.createdAt ? formatDistanceToNow(new Date((article.createdAt as Timestamp).seconds * 1000)) + ' ago' : 'Just now',
      description: '...', // Placeholder as it is not in the DB model
      featured: false, // Placeholder
      image: `https://picsum.photos/seed/${article.id}/1080/600`, // Placeholder image
    }));
  }, [articlesData]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-8">
            <CategoryNav theme={theme} />
            <div>
              {isLoading && <p>Loading articles...</p>}
              {articles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={{...article, author: { name: article.authorName, image: article.authorImage}}} 
                  theme={theme}
                  onClick={() => router.push(`/news/${article.id}`)}
                />
              ))}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <TrendingTopics theme={theme} />
          </aside>
        </div>
      </div>
    </div>
  );
}
