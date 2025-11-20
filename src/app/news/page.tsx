
'use client';

import { useTheme } from '@/context/ThemeContext';
import { ArticleCard } from './components/ArticleCard';
import { CategoryNav } from './components/CategoryNav';
import { TrendingTopics } from './components/TrendingTopics';
import { mockArticles } from './data';
import { useRouter } from 'next/navigation';

export default function NewsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-8">
            <CategoryNav theme={theme} />
            <div>
              {mockArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
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
