
export type ViewMode = 'canvas' | 'board' | 'list' | 'timeline' | 'outline';
export type CalendarViewMode = 'Schedule' | 'Day' | '3 Days' | 'Week' | 'Month';
export type Page = 'dashboard' | 'roadmap' | 'calendar' | 'members' | 'resources' | 'community' | 'about' | 'profile' | 'settings';

export type DashboardViewMode = 'Personal' | 'Team' | 'Project';
export type MembersViewMode = 'All' | 'Team Members' | 'Teams' | 'Coordinators';
export type ResourcesViewMode = 'All' | 'Files' | 'Folders' | 'PDF' | 'PPTX' | 'ZIP' | 'Image' | 'Video';
export type CommunityViewMode = 'All' | 'Help' | 'Feedback' | 'Updates' | 'Polls';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Status = 'Backlog' | 'In Progress' | 'Review' | 'Done';
export type TaskType = 'Milestone' | 'Goal' | 'Epic' | 'Story' | 'Issue' | 'Sub-issue' | 'Gateway';

export enum DocStatus {
  TODO = 'Backlog',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done'
}

export type UserRole = 'Visitor' | 'Member' | 'Team Lead' | 'Coordinator' | 'Co-Owner' | 'Owner';


export interface CurrentUser {
    id: string;
    name: string;
    initials: string;
    role: UserRole;
    avatarColor: string;
    teamName?: string; 
}

export interface Assignee {
  id: string;
  name: string;
  initials: string;
  color: string;
  type?: 'user' | 'team';
  role?: UserRole;
}

export interface UserProfile extends Assignee {
  roleTitle: string;
  businessType: 'Business Owner' | 'Solopreneur';
  naicsCode: string; 
  location: string;
  website?: string;
  bio: string;
  stats: {
    followers: number;
    following: number;
    projects: number;
  };
  joinedDate: string;
}

export interface UserPost {
  id: string;
  author: string;
  role: string;
  time: string;
  content: string;
  likes: number;
  comments: number;
  shares?: number;
  tags: string[];
  type: string; 
  isRepost?: boolean;
  originalAuthor?: string;
}

export interface UserArticle {
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  date: string;
  readTime: string;
  likes: number;
}

export interface UserActivity {
  id: string;
  type: 'comment' | 'like' | 'share' | 'join';
  target: string; 
  date: string;
}

export interface HistoryEntry {
  id: string;
  date: string; 
  user: string;
  action: string; 
  type: 'status' | 'priority' | 'assignment' | 'creation' | 'update';
}

export interface Attachment {
  id: string;
  name: string;
  type: string; 
  url?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface FileItem {
    id: string;
    name: string;
    type: 'folder' | 'file';
    fileType?: string; // e.g., 'PDF', 'Image' for files
    size?: string;
    date: string;
    parentId: string | null;
    url?: string; // Only for files
}


export interface Cycle {
  id: string;
  name: string; 
  startDate: string;
  endDate: string;
  status: 'Active' | 'Upcoming' | 'Completed';
}

export interface TaskNode {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  type: TaskType; 
  gatewayType?: 'AND' | 'OR'; 
  assignee: Assignee;
  startDate: string;
  dueDate: string;
  color: string; 
  position: { x: number; y: number }; 
  next: string[]; 
  prev: string[]; 
  childrenIds?: string[];
  parentId?: string;
  size?: string;
  comments?: string[];
  history?: HistoryEntry[];
  attachments?: Attachment[];
  checklist?: ChecklistItem[];
  cycleId?: string;
}

export interface Document extends TaskNode {
  content?: string;
  createdAt: string;
}

export type Theme = 'Light' | 'Dark' | 'Sephiroa' | 'Green' | 'Blue';
export type BackgroundType = 'Dots' | 'Grid' | 'None';
export type FilterOption = 'All' | 'Mine' | 'Team' | 'Project';

export interface AppState {
  currentUser: CurrentUser;
  tasks: TaskNode[];
  posts: UserPost[];
  members: Assignee[];
  files: FileItem[];
  cycles: Cycle[]; 
  selectedTaskId: string | null;
  selectedTaskIds: string[]; 
  isModalOpen: boolean;
  viewMode: ViewMode;
  scale: number;
  focusedParentId: string | null;
  theme: Theme;
  background: BackgroundType;
  filter: FilterOption;
  resourcePath: (string | null)[];
}

export interface AIActionResponse {
  title: string;
  description: string;
  priority: Priority;
}
