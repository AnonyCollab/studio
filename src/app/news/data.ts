
import { v4 as uuidv4 } from 'uuid';
import { Timestamp } from 'firebase/firestore';

export interface Article {
    id: string;
    title: string;
    description: string;
    authorId: string;
    authorName: string;
    authorImage: string;
    date: string;
    readTime: string;
    image: string;
    category: string;
    featured: boolean;
    content: string; // JSON string from BlockNote
    createdAt?: Timestamp | string;
}

export const mockArticles: Article[] = [
  {
    id: uuidv4(),
    title: 'The Future of Anonymous Collaboration',
    description: 'How new technologies are enabling teams to work together without revealing their identities, fostering a more meritocratic environment.',
    authorId: 'user1',
    authorName: 'Jane Doe',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    date: 'Oct 24, 2024',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1623715537851-8bc15aa8c145?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Technology',
    featured: true,
    content: JSON.stringify([
      { type: 'paragraph', content: 'The landscape of digital collaboration is undergoing a monumental shift.' },
      { type: 'paragraph', content: 'For decades, identity has been at the core of online interaction. However, a new wave of tools is challenging this paradigm, championing anonymity and pseudonymity to foster unbiased and merit-driven teamwork.' },
      { type: 'heading', level: 2, content: 'Why Anonymity Matters' },
      { type: 'paragraph', content: 'In a traditional setting, preconceived notions about a colleague\'s background, role, or seniority can subtly influence how their ideas are received. Anonymous platforms strip away these biases, allowing ideas to be judged purely on their merit.' },
    ]),
  },
  {
    id: uuidv4(),
    title: 'Designing for Privacy: A UI/UX Guide',
    description: 'Best practices for creating user interfaces that respect user privacy and build trust, with practical examples and case studies.',
    authorId: 'user2',
    authorName: 'John Smith',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    date: 'Oct 23, 2024',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1611241893603-3c359704e0ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Design',
    featured: false,
    content: JSON.stringify([
        { type: 'paragraph', content: 'Designing for privacy is no longer a "nice-to-have"; it\'s a fundamental requirement for ethical and successful products. This guide explores how to embed privacy principles directly into your UI/UX workflow.' },
    ]),
  },
  {
    id: uuidv4(),
    title: 'The Psychology of Anonymity in Teams',
    description: 'An in-depth look at how anonymity affects team dynamics, creativity, and communication, backed by recent studies.',
    authorId: 'user3',
    authorName: 'Emily White',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    date: 'Oct 22, 2024',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1709715357520-5e1047a2b691?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Culture',
    featured: false,
    content: JSON.stringify([
        { type: 'paragraph', content: 'What happens when you remove names and faces from a team meeting? This article delves into the psychological effects of anonymity on collaboration and creativity.' },
    ]),
  },
  {
    id: uuidv4(),
    title: 'Building Secure Real-Time Applications',
    description: 'A technical deep-dive into the architecture and security considerations for building real-time collaboration tools.',
    authorId: 'user4',
    authorName: 'Michael Brown',
    authorImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    date: 'Oct 21, 2024',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1666886573215-b59d8ad9970c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: 'Programming',
    featured: false,
    content: JSON.stringify([
        { type: 'paragraph', content: 'Security is paramount in real-time applications. Here, we explore end-to-end encryption, secure data synchronization, and other crucial architectural patterns.' },
    ]),
  },
];
