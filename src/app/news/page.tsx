
'use client';

import { useTheme } from '@/context/ThemeContext';
import { ArticleCard } from './components/ArticleCard';
import { CategoryNav } from './components/CategoryNav';
import { TrendingTopics } from './components/TrendingTopics';
import type { Article } from './data';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function NewsPage() {
  const { theme } = useTheme();
  const firestore = useFirestore();

  const articlesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news', 'articles', 'documents'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: articlesData, isLoading } = useCollection<Article>(articlesQuery);

  const articles = useMemo(() => {
    if (!articlesData) return [];
    return articlesData.map(article => ({
      ...article,
      id: article.id, // ensure id is present
      date: article.createdAt ? formatDistanceToNow(new Date((article.createdAt as Timestamp).seconds * 1000)) + ' ago' : 'Just now',
      description: '...', // Placeholder as it is not in the DB model
      image: `https://picsum.photos/seed/${article.id}/1080/600`, // Placeholder image
    }));
  }, [articlesData]);

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const regularArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-8">
            <CategoryNav theme={theme} />
            <div>
              {isLoading && <p>Loading articles...</p>}
              {featuredArticle && (
                <ArticleCard 
                  key={featuredArticle.id} 
                  article={{...featuredArticle, author: { name: featuredArticle.authorName, image: featuredArticle.authorImage}, featured: true }} 
                  theme={theme}
                />
              )}
              {regularArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={{...article, author: { name: article.authorName, image: article.authorImage}, featured: false}} 
                  theme={theme}
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

    