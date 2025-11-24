
import { TaskNode, Assignee, Priority, Cycle, UserProfile, UserPost, UserArticle, UserActivity, FileItem } from './types';
import { FileText, Link, Image, Video, Archive } from 'lucide-react';

export const MOCK_ASSIGNEES: Assignee[] = [
  { name: 'Alex Chen', initials: 'AC', color: 'bg-blue-500', type: 'user' },
  { name: 'Sarah Jones', initials: 'SJ', color: 'bg-pink-500', type: 'user' },
  { name: 'Mike Ross', initials: 'MR', color: 'bg-yellow-500', type: 'user' },
  { name: 'Frontend Team', initials: 'FE', color: 'bg-indigo-600', type: 'team' },
  { name: 'Design Team', initials: 'DS', color: 'bg-rose-600', type: 'team' },
  { name: 'Backend Team', initials: 'BE', color: 'bg-emerald-600', type: 'team' },
  { name: 'Unassigned', initials: '?', color: 'bg-slate-600', type: 'user' },
];

export const MOCK_PROFILE: UserProfile = {
  name: 'Alex Chen',
  initials: 'AC',
  color: 'bg-blue-500',
  type: 'user',
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

export const INITIAL_TASKS: TaskNode[] = [
  {
    id: 'TASK-101',
    title: 'Q4 Strategic Roadmap',
    description: 'Define key milestones and deliverables for the Q4 marketing push.',
    status: 'Done',
    priority: 'High',
    type: 'Milestone', // MILESTONE
    assignee: MOCK_ASSIGNEES[0],
    startDate: 'Oct 01',
    dueDate: 'Oct 05',
    color: '#ef4444', // Red for Milestone
    position: { x: 50, y: 250 },
    next: ['TASK-102', 'TASK-103'],
    prev: [],
    childrenIds: ['TASK-102', 'TASK-103'],
    size: 'L',
    history: [],
    attachments: [],
    checklist: [],
    cycleId: 'CYCLE-1'
  },
  {
    id: 'TASK-102',
    title: 'Brand Refresh',
    description: 'Execute new visual identity across all channels.',
    status: 'In Progress',
    priority: 'Medium',
    type: 'Goal', // GOAL
    assignee: MOCK_ASSIGNEES[4], 
    startDate: 'Oct 06',
    dueDate: 'Oct 15',
    color: '#8b5cf6', 
    position: { x: 400, y: 100 },
    next: ['GATEWAY-1'],
    prev: ['TASK-101'],
    childrenIds: ['TASK-104', 'TASK-106'],
    parentId: 'TASK-101',
    size: 'M',
    history: [],
    checklist: [],
    cycleId: 'CYCLE-1'
  },
  {
    id: 'TASK-103',
    title: 'Backend Migration',
    description: 'Migrate legacy SQL database to the new distributed cluster.',
    status: 'In Progress',
    priority: 'Critical',
    type: 'Goal', // GOAL
    assignee: MOCK_ASSIGNEES[5],
    startDate: 'Oct 06',
    dueDate: 'Oct 20',
    color: '#8b5cf6', 
    position: { x: 400, y: 400 },
    next: ['GATEWAY-1'],
    prev: ['TASK-101'],
    childrenIds: [],
    parentId: 'TASK-101',
    size: 'XL',
    history: [],
    checklist: [],
    cycleId: 'CYCLE-1'
  },
  {
    id: 'GATEWAY-1',
    title: 'Sync Point',
    description: 'Wait for both Brand Refresh and Backend Migration',
    status: 'In Progress',
    priority: 'High',
    type: 'Gateway',
    gatewayType: 'AND',
    assignee: MOCK_ASSIGNEES[0],
    startDate: 'Oct 20',
    dueDate: 'Oct 20',
    color: '#3b82f6',
    position: { x: 650, y: 250 },
    next: ['TASK-104'],
    prev: ['TASK-102', 'TASK-103'],
    childrenIds: [],
    parentId: 'TASK-101', // Visually belongs to the milestone timeline
    size: 'S'
  },
  {
    id: 'TASK-104',
    title: 'User Authentication Flow',
    description: 'Implement new JWT based auth with refresh tokens.',
    status: 'Backlog',
    priority: 'High',
    type: 'Epic', // EPIC
    assignee: MOCK_ASSIGNEES[3],
    startDate: 'Oct 21',
    dueDate: 'Oct 25',
    color: '#10b981', 
    position: { x: 800, y: 250 },
    next: ['TASK-105'],
    prev: ['GATEWAY-1'],
    childrenIds: ['TASK-105'],
    parentId: 'TASK-102',
    size: 'M',
    history: [],
    checklist: [],
    cycleId: 'CYCLE-2'
  },
  {
    id: 'TASK-105',
    title: 'Login Page UI',
    description: 'Design and build the login form with validation.',
    status: 'Backlog',
    priority: 'Critical',
    type: 'Issue', // ISSUE -> Yellow
    assignee: MOCK_ASSIGNEES[1],
    startDate: 'Oct 26',
    dueDate: 'Oct 27',
    color: '#eab308', // Yellow-500
    position: { x: 1150, y: 250 },
    next: [],
    prev: ['TASK-104'],
    childrenIds: [],
    parentId: 'TASK-104',
    size: 'S',
    history: [],
    checklist: [
        { id: 'cl-1', text: 'Design mockups in Figma', checked: true },
        { id: 'cl-2', text: 'Implement React component', checked: false },
        { id: 'cl-3', text: 'Add form validation', checked: false }
    ],
    cycleId: 'CYCLE-2'
  },
  {
    id: 'TASK-106',
    title: 'Update Logos',
    description: 'Replace old logos with new SVG assets.',
    status: 'In Progress',
    priority: 'Low',
    type: 'Sub-issue', // SUB-ISSUE -> Grey
    assignee: MOCK_ASSIGNEES[1],
    startDate: 'Oct 10',
    dueDate: 'Oct 12',
    color: '#64748b', // Slate-500
    position: { x: 1150, y: 400 },
    next: [],
    prev: [],
    childrenIds: [],
    parentId: 'TASK-102',
    size: 'XS',
    history: [],
    checklist: [],
    cycleId: 'CYCLE-1'
  }
];
