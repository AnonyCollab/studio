
'use client';

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PostShareCardProps {
  postId: string;
  theme: 'light' | 'dark';
}

interface PostData {
    id: string;
    title: string;
    imageUrl?: string;
    author: {
        name: string;
        avatar: string;
    };
    timestamp: string;
}

export function PostShareCard({ postId, theme }: PostShareCardProps) {
  const firestore = useFirestore();
  const router = useRouter();
  const isDark = theme === 'dark';

  const postRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'posts', postId);
  }, [firestore, postId]);
  
  const { data: post, isLoading } = useDoc<PostData>(postRef);

  const handleCardClick = () => {
    router.push(`/posts?postId=${postId}`);
  };

  if (isLoading || !post) {
    return (
      <div className={`mt-2 p-3 rounded-lg border flex items-center justify-center h-28 ${
        isDark 
          ? 'bg-[#131823] border-white/10' 
          : 'bg-white border-gray-200'
      }`}>
        <Loader className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className={`mt-2 p-3 rounded-lg border cursor-pointer transition-all ${
        isDark 
          ? 'bg-[#131823] border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' 
          : 'bg-white border-gray-200 hover:border-cyan-500/50 hover:shadow-lg'
      }`}
    >
      <div className="flex gap-4">
        {post.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`text-xs uppercase tracking-wider mb-1 ${
            isDark ? 'text-cyan-400' : 'text-cyan-600'
          }`}>
            Shared Post
          </p>
          <p className={`font-semibold truncate mb-2 ${
            isDark ? 'text-[#e5e7eb]' : 'text-gray-900'
          }`}>
            {post.title}
          </p>
          <div className="flex items-center gap-2">
             <Avatar className="w-5 h-5">
               <AvatarImage src={post.author.avatar} />
               <AvatarFallback>{post.author.name[0]}</AvatarFallback>
             </Avatar>
             <span className={`text-xs ${isDark ? 'text-[#94a3b8]' : 'text-gray-600'}`}>
                {post.author.name} · {post.timestamp}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
}

    