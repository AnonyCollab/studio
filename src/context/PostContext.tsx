
'use client';

import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  imageUrl: string;
  title: string;
  description: string;
  tags: string[];
  likes: number;
  comments: number;
  reposts: number;
  shares: number;
  timestamp: string;
  problemDetails: string;
  problemSummary: string;
  whatIveTried: string;
  whatIveTriedSummary: string;
  expectedOutcome: string;
  expectedOutcomeSummary: string;
  sector: string;
}

interface PostContextType {
  selectedPost: Post | null;
  setSelectedPost: (post: Post | null) => void;
  showCreatePost: boolean;
  setShowCreatePost: (show: boolean) => void;
  isDetailOpen: boolean;
  handleCloseDetail: () => void;
  handleOpenCreatePost: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const isDetailOpen = selectedPost !== null || showCreatePost;

  const handleCloseDetail = () => {
    setSelectedPost(null);
    setShowCreatePost(false);
  };

  const handleOpenCreatePost = () => {
    setSelectedPost(null);
    setShowCreatePost(true);
  };

  const value = useMemo(() => ({
    selectedPost,
    setSelectedPost,
    showCreatePost,
    setShowCreatePost,
    isDetailOpen,
    handleCloseDetail,
    handleOpenCreatePost,
  }), [selectedPost, showCreatePost, isDetailOpen]);

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
