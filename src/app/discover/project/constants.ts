
import { TaskNode, Assignee, Priority, Cycle, UserProfile, UserPost, UserArticle, UserActivity, FileItem } from './types';
import { FileText, Link, Image, Video, Archive } from 'lucide-react';

export const MOCK_ASSIGNEES: Assignee[] = [
  { id: 'u1', name: 'Alex Chen', initials: 'AC', color: 'bg-blue-500', type: 'user', role: 'Owner' },
  { id: 'u2', name: 'Sarah Jones', initials: 'SJ', color: 'bg-pink-500', type: 'user', role: 'Co-Owner' },
  { id: 'u3', name: 'Mike Ross', initials: 'MR', color: 'bg-yellow-500', type: 'user', role: 'Coordinator' },
  { id: 'u4', name: 'Jessica Pearson', initials: 'JP', color: 'bg-emerald-500', type: 'user', role: 'Team Lead' },
  { id: 'u5', name: 'Harvey Specter', initials: 'HS', color: 'bg-purple-500', type: 'user', role: 'Member' },
  { id: 't1', name: 'Frontend Team', initials: 'FE', color: 'bg-indigo-600', type: 'team' },
  { id: 't2', name: 'Design Team', initials: 'DS', color: 'bg-rose-600', type: 'team' },
  { id: 't3', name: 'Backend Team', initials: 'BE', color: 'bg-emerald-600', type: 'team' },
  { id: 'u-unassigned', name: 'Unassigned', initials: '?', color: 'bg-slate-600', type: 'user', role: 'Visitor' },
];

export const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Alex Chen',
  initials: 'AC',
  color: 'bg-blue-500',
  type: 'user',
  role: 'Owner',
  roleTitle: 'Senior Product Architect',
  businessType: 'Solopreneur',
  naicsCode: '541511 - Custom Computer Programming Services',
  location: 'San Francisco, CA',
  website: 'alexchen.dev',
  bio: 'Building digital ecosystems for agile teams. Focused on React performance and collaborative AI interfaces. Currently scaling OmniCanvas.',
  joinedDate: 'September 2021',
  stats: {
    followers: 1204,
    following: 450,
    projects: 12
  }
};

export const MOCK_POSTS: UserPost[] = [
    {
        id: 'p1',
        author: 'Alex Chen',
        role: 'Product Owner',
        time: '2 hours ago',
        content: 'Just wanted to share the updated design system for Q4. The new token structure should make theming much easier across the board. Great work @DesignTeam!',
        likes: 24,
        comments: 5,
        tags: ['Announcement', 'Design'],
        type: 'Updates',
        shares: 2
    },
    {
        id: 'p2',
        author: 'Sarah Jones',
        role: 'Frontend Lead',
        time: '5 hours ago',
        content: 'Heads up: The API gateway will be undergoing maintenance tonight at 02:00 UTC. Expect minor downtime in the staging environment.',
        likes: 12,
        comments: 0,
        tags: ['DevOps', 'Maintenance'],
        type: 'Updates',
        shares: 0
    },
    {
        id: 'p3',
        author: 'Mike Ross',
        role: 'Backend Dev',
        time: '1 day ago',
        content: 'Has anyone experienced latency issues with the new Redis cluster? I am seeing some spikes in the monitoring dashboard.',
        likes: 8,
        comments: 14,
        tags: ['Question', 'Backend'],
        type: 'Help',
        shares: 1
    },
    {
        id: 'p4',
        author: 'Emily White',
        role: 'UX Researcher',
        time: '2 days ago',
        content: 'What do we think about moving the main navigation to a bottom bar on desktop as well? Poll below.',
        likes: 45,
        comments: 32,
        tags: ['UX', 'Poll'],
        type: 'Polls',
        shares: 5
    }
];

export const MOCK_FILES: FileItem[] = [
    { id: 'f1', name: 'Brand_Guidelines_v2.pdf', type: 'PDF', size: '4.2 MB', date: 'Oct 12, 2023', icon: FileText, color: 'text-red-500', bg: 'bg-red-500/10' },
    { id: 'f2', name: 'Q4_Roadmap_Presentation.pptx', type: 'PPTX', size: '12.5 MB', date: 'Oct 10, 2023', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 'f3', name: 'Hero_Banner_Assets.zip', type: 'ZIP', size: '145 MB', date: 'Oct 08, 2023', icon: Archive, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'f4', name: 'UI_Kit_v3.fig', type: 'Figma', size: 'Link', date: 'Oct 05, 2023', icon: Link, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 'f5', name: 'Landing_Page_Mockup.png', type: 'Image', size: '2.1 MB', date: 'Sep 28, 2023', icon: Image, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'f6', name: 'Demo_Walkthrough.mp4', type: 'Video', size: '450 MB', date: 'Sep 25, 2023', icon: Video, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export const MOCK_ARTICLES: UserArticle[] = [
  {
    id: 'a1',
    title: 'Optimizing React for Heavy Canvas Interaction',
    excerpt: 'A deep dive into requestAnimationFrame and memoization techniques for 60fps rendering.',
    date: 'Oct 12, 2023',
    readTime: '5 min read',
    likes: 128
  },
  {
    id: 'a2',
    title: 'The Solopreneur Stack: 2024 Edition',
    excerpt: 'My curated list of tools for managing a one-person software consultancy.',
    date: 'Sep 28, 2023',
    readTime: '8 min read',
    likes: 340
  }
];

export const MOCK_ACTIVITY: UserActivity[] = [
  { id: 'act1', type: 'like', target: 'Sarah Jones\'s update on API Gateway', date: '30 mins ago' },
  { id: 'act2', type: 'comment', target: 'Q4 Strategic Roadmap Task', date: '2 hours ago' },
  { id: 'act3', type: 'join', target: 'Frontend Team', date: '1 week ago' },
  { id: 'act4', type: 'share', target: 'Design Team Guidelines', date: '2 weeks ago' }
];

export const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#64748b', // slate
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export const PRIORITY_LEVELS: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export const INITIAL_CYCLES: Cycle[] = [
    { id: 'CYCLE-1', name: 'Sprint 23', startDate: 'Oct 01', endDate: 'Oct 14', status: 'Active' },
    { id: 'CYCLE-2', name: 'Sprint 24', startDate: 'Oct 15', endDate: 'Oct 28', status: 'Upcoming' },
];
