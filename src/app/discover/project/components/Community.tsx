
import React, { useMemo, useEffect } from 'react';
import { Theme, CommunityViewMode, UserPost } from '../types';
import { MessageSquare, Heart, Share2, MoreHorizontal, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

interface CommunityProps {
    theme: Theme;
    viewMode: CommunityViewMode;
    posts: UserPost[];
}

export const Community: React.FC<CommunityProps> = ({ theme, viewMode, posts }) => {
    const { currentUser } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    useEffect(() => {
        console.log("Current user role in CommunityPage:", currentUser?.role);
    }, [currentUser]);
    
    const cardClass = isLight ? "bg-white/80 border-black/5" : "bg-[#18181b]/80 border-white/5";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const inputClass = isLight ? "bg-white border-slate-200 text-slate-700" : "bg-[#18181b] border-white/10 text-slate-200";

    const displayedPosts = useMemo(() => {
        if (viewMode === 'All') return posts;
        // For specific modes, match the 'type' property or check tags for better coverage
        return posts.filter(p => {
            if (viewMode === 'Feedback') return p.tags.includes('Feedback') || p.type === 'Feedback';
            return p.type === viewMode || p.tags.includes(viewMode);
        });
    }, [viewMode, posts]);

    return (
        <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
            <div className="max-w-4xl mx-auto">
                 <div className="mb-8 text-center">
                    <h1 className={`text-3xl font-bold mb-2 ${textMain}`}>{viewMode === 'All' ? 'Community Feed' : viewMode}</h1>
                    <p className={textMuted}>Stay updated with team announcements and discussions.</p>
                </div>

                {/* Post Creator (Visual Only here, logic in CreationSheet now) */}
                <div className={`p-6 rounded-2xl border shadow-lg mb-8 opacity-50 pointer-events-none hidden lg:block ${cardClass}`}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-600 p-[2px]">
                            <div className={`w-full h-full rounded-full flex items-center justify-center font-bold text-xs ${isLight ? 'bg-white text-brand-500' : 'bg-black text-white'}`}>AC</div>
                        </div>
                        <div className="flex-1">
                            <textarea 
                                placeholder="What's on your mind? (Use the + button to post)" 
                                className={`w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20 min-h-[100px] resize-none mb-3 ${inputClass}`}
                                readOnly
                            />
                            <div className="flex justify-end">
                                <button className="px-6 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-brand-500/20">
                                    Post Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {displayedPosts.length === 0 && (
                         <div className={`text-center py-12 ${textMuted}`}>
                             <Info className="mx-auto mb-2 opacity-50" />
                             No posts found in this category.
                         </div>
                    )}
                    {displayedPosts.map((post, i) => (
                        <div key={post.id} className={`p-6 rounded-2xl border shadow-lg backdrop-blur-sm transition-all hover:translate-y-[-2px] ${cardClass}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${['bg-blue-500', 'bg-pink-500', 'bg-yellow-500', 'bg-purple-500'][i%4]}`}>
                                        {post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-sm ${textMain}`}>{post.author}</h3>
                                        <p className={`text-xs ${textMuted}`}>{post.role} • {post.time}</p>
                                    </div>
                                </div>
                                <button className={`p-1 rounded hover:bg-white/10 ${textMuted}`}>
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>

                            <div className={`text-sm mb-4 leading-relaxed whitespace-pre-wrap ${textMain}`} dangerouslySetInnerHTML={{ __html: post.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />

                            <div className="flex gap-2 mb-6">
                                {post.tags.map(tag => (
                                    <span key={tag} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isLight ? 'bg-brand-50 text-brand-600' : 'bg-brand-500/10 text-brand-400'}`}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className={`flex items-center gap-6 pt-4 border-t ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                                <button className={`flex items-center gap-2 text-sm hover:text-rose-500 transition-colors ${textMuted}`}>
                                    <Heart size={16} /> {post.likes}
                                </button>
                                <button className={`flex items-center gap-2 text-sm hover:text-blue-500 transition-colors ${textMuted}`}>
                                    <MessageSquare size={16} /> {post.comments}
                                </button>
                                <button className={`flex items-center gap-2 text-sm hover:text-green-500 transition-colors ${textMuted}`}>
                                    <Share2 size={16} /> {post.shares || 0}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
