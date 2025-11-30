
'use client';

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, DocumentReference, DocumentData } from 'firebase/firestore';

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
  isDetailOpen: boolean;
  handleCloseDetail: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const firestore = useFirestore();

  const postRef = useMemoFirebase<DocumentReference<DocumentData> | null>(() => {
    if (!firestore || !selectedPostId) return null;
    return doc(firestore, 'posts', selectedPostId);
  }, [firestore, selectedPostId]);
  
  const { data: selectedPost } = useDoc<Post>(postRef);

  const handleSetSelectedPost = (post: Post | null) => {
    setSelectedPostId(post ? post.id : null);
  };

  const isDetailOpen = selectedPostId !== null;

  const handleCloseDetail = () => {
    setSelectedPostId(null);
  };

  const value = useMemo(() => ({
    selectedPost,
    setSelectedPost: handleSetSelectedPost,
    isDetailOpen,
    handleCloseDetail,
  }), [selectedPost, isDetailOpen]);

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
