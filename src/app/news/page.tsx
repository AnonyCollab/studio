
'use client';

import { useTheme } from '@/context/ThemeContext';
import { ArticleCard } from './components/ArticleCard';
import { CategoryNav } from './components/CategoryNav';
import { TrendingTopics } from './components/TrendingTopics';

const mockArticles = [
  {
    title: 'The Future of Anonymous Collaboration',
    description: 'How new technologies are enabling teams to work together without revealing their identities, fostering a more meritocratic environment.',
    author: 'Jane Doe',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    date: 'Oct 24, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Technology',
    featured: true,
  },
  {
    title: 'Designing for Privacy: A UI/UX Guide',
    description: 'Best practices for creating user interfaces that respect user privacy and build trust, with practical examples and case studies.',
    author: 'John Smith',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    date: 'Oct 23, 2024',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Design',
    featured: false,
  },
  {
    title: 'The Psychology of Anonymity in Teams',
    description: 'An in-depth look at how anonymity affects team dynamics, creativity, and communication, backed by recent studies.',
    author: 'Emily White',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    date: 'Oct 22, 2024',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Culture',
    featured: false,
  },
  {
    title: 'Building Secure Real-Time Applications',
    description: 'A technical deep-dive into the architecture and security considerations for building real-time collaboration tools.',
    author: 'Michael Brown',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    date: 'Oct 21, 2024',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Programming',
    featured: false,
  },
];

export default function NewsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0e1a]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            The AnonyCollab Blog
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Insights on privacy, technology, and the future of work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <main className="lg:col-span-8">
            <CategoryNav theme={theme} />
            <div>
              {mockArticles.map((article, index) => (
                <ArticleCard key={index} {...article} theme={theme} />
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
