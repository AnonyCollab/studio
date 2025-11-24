
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { Theme, TaskNode, Assignee } from '../types';
import { MOCK_POSTS, MOCK_ARTICLES, MOCK_ACTIVITY } from '../constants';
import { MapPin, Link as LinkIcon, Building2, Users, CheckCircle2, Repeat2, MessageSquare, Heart, Share2, FileText, BookOpen, Activity, Briefcase, Calendar, ArrowLeft } from 'lucide-react';
import { StatusBadge, PriorityIcon } from './Plan';

interface ProfilePageProps {
    theme: Theme;
    tasks: TaskNode[];
    member: Assignee | null;
    onBack: () => void;
}

type Tab = 'Posts' | 'Articles' | 'Projects' | 'Activity';

const getDmId = (uid1: string, uid2: string) => [uid1, uid2].sort().join('_');

export const ProfilePage: React.FC<ProfilePageProps> = ({ theme, tasks, member, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Projects');
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const router = useRouter();
    const { user: currentUser } = useUser();

    if (!member) {
        return (
            <div className="flex items-center justify-center h-full">
                <p>No member selected.</p>
            </div>
        );
    }

    const handleMessageClick = () => {
        if (!currentUser || !member) return;
        const dmId = getDmId(currentUser.uid, member.id);
        router.push(`/messages?dm=${dmId}`);
    };
    
    // In a real app, this would be fetched based on member.id
    const profile = {
        name: member.name,
        initials: member.initials,
        color: member.color,
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
            projects: tasks.filter(t => t.assignee.name === member.name).length
        }
    };


    // Styles
    const textMain = isLight ? "text-slate-900" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const borderClass = isLight ? "border-black/10" : "border-white/10";
    const cardBg = isLight ? "bg-white/60 border-black/5 hover:bg-white/80" : "bg-white/5 border-white/5 hover:bg-white/10";
    const containerBg = isLight ? "bg-white/40" : "bg-black/20";
    const tabActive = isLight ? "border-brand-500 text-brand-600" : "border-brand-400 text-brand-400";
    const tabInactive = isLight ? "border-transparent text-slate-500 hover:text-slate-800" : "border-transparent text-slate-400 hover:text-slate-200";

    // Filter Projects
    const userProjects = tasks.filter(t => t.assignee.name === profile.name);

    return (
        <div className="w-full h-full overflow-y-auto custom-scrollbar pb-32">
            {/* Cover Image (Mock) */}
            <div className="h-48 w-full bg-gradient-to-r from-brand-600 to-purple-600 relative">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
                
                {/* Back Button for Mobile */}
                 <button onClick={onBack} className={`absolute -top-12 left-4 p-2 rounded-full text-white bg-black/20 backdrop-blur-sm lg:hidden`}>
                    <ArrowLeft size={20} />
                </button>
                
                {/* Header Profile Card */}
                <div className={`rounded-2xl border backdrop-blur-xl shadow-xl p-6 md:p-8 mb-8 flex flex-col md:flex-row gap-6 ${isLight ? 'bg-white/90 border-white' : 'bg-[#121212]/90 border-white/10'}`}>
                    
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className={`w-32 h-32 rounded-full p-1.5 bg-white shadow-lg -mt-16 md:-mt-0 md:relative`}>
                            <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold text-white ${profile.color}`}>
                                {profile.initials}
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-2">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                                <h1 className={`text-3xl font-bold mb-1 ${textMain}`}>{profile.name}</h1>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`text-lg font-medium ${textMuted}`}>{profile.roleTitle}</span>
                                    <span className={`hidden md:inline ${textMuted}`}>•</span>
                                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                                        {profile.businessType}
                                    </span>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border inline-flex ${isLight ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-blue-900/20 text-blue-200 border-blue-800/30'}`}>
                                    <Building2 size={14} />
                                    NAICS: {profile.naicsCode}
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button className="px-6 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95">
                                    Follow
                                </button>
                                <button onClick={handleMessageClick} className={`px-4 py-2 rounded-xl border font-bold transition-all ${isLight ? 'border-slate-200 hover:bg-slate-50 text-slate-700' : 'border-white/10 hover:bg-white/5 text-white'}`}>
                                    Message
                                </button>
                            </div>
                        </div>

                        <div className={`text-sm leading-relaxed mb-6 max-w-2xl ${textMain}`}>
                            {profile.bio}
                        </div>

                        <div className={`flex flex-wrap items-center gap-6 text-sm ${textMuted}`}>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                {profile.location}
                            </div>
                            {profile.website && (
                                <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-brand-500 transition-colors">
                                    <LinkIcon size={16} />
                                    {profile.website}
                                </a>
                            )}
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                Joined {profile.joinedDate}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className={`grid grid-cols-3 gap-4 mb-8 py-6 px-8 rounded-2xl border ${isLight ? 'bg-white/60 border-black/5' : 'bg-white/5 border-white/5'}`}>
                    <div className="text-center border-r border-white/10 last:border-0">
                        <div className={`text-2xl font-bold ${textMain}`}>{profile.stats.followers}</div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Followers</div>
                    </div>
                    <div className="text-center border-r border-white/10 last:border-0">
                        <div className={`text-2xl font-bold ${textMain}`}>{profile.stats.following}</div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Following</div>
                    </div>
                    <div className="text-center border-r border-white/10 last:border-0">
                        <div className={`text-2xl font-bold ${textMain}`}>{profile.stats.projects}</div>
                        <div className={`text-xs font-bold uppercase tracking-wider ${textMuted}`}>Projects</div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Main Column */}
                    <div className="flex-1 min-w-0">
                        
                        {/* Sticky Tabs */}
                        <div className={`sticky top-0 z-30 backdrop-blur-xl border-b mb-6 flex gap-8 ${borderClass} ${isLight ? 'bg-white/80' : 'bg-[#020617]/80'}`}>
                            {['Projects', 'Posts', 'Articles', 'Activity'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as Tab)}
                                    className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? tabActive : tabInactive}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6 min-h-[400px]">
                            
                            {/* POSTS TAB */}
                            {activeTab === 'Posts' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {MOCK_POSTS.map(post => (
                                        <div key={post.id} className={`p-6 rounded-2xl border transition-all ${cardBg}`}>
                                            {post.isRepost && (
                                                <div className={`flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider ${textMuted}`}>
                                                    <Repeat2 size={14} /> Reposted from {post.originalAuthor}
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold ${profile.color}`}>
                                                    {profile.initials}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className={`font-bold text-sm ${textMain}`}>{profile.name}</h3>
                                                            <span className={`text-xs ${textMuted}`}>{post.time}</span>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm leading-relaxed mb-4 ${textMain}`}>{post.content}</p>
                                                    <div className="flex gap-2 mb-4">
                                                        {post.tags.map(t => (
                                                            <span key={t} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-300'}`}>#{t}</span>
                                                        ))}
                                                    </div>
                                                    <div className={`flex items-center gap-6 pt-3 border-t ${borderClass}`}>
                                                        <button className={`flex items-center gap-2 text-sm hover:text-rose-500 transition-colors ${textMuted}`}>
                                                            <Heart size={16} /> {post.likes}
                                                        </button>
                                                        <button className={`flex items-center gap-2 text-sm hover:text-blue-500 transition-colors ${textMuted}`}>
                                                            <MessageSquare size={16} /> {post.comments}
                                                        </button>
                                                        <button className={`flex items-center gap-2 text-sm hover:text-green-500 transition-colors ${textMuted}`}>
                                                            <Share2 size={16} /> {post.shares}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ARTICLES TAB */}
                            {activeTab === 'Articles' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {MOCK_ARTICLES.map(article => (
                                        <div key={article.id} className={`p-6 rounded-2xl border group cursor-pointer transition-all ${cardBg}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${textMuted}`}>
                                                    <FileText size={14} /> Article
                                                </div>
                                                <span className={`text-xs ${textMuted}`}>{article.date}</span>
                                            </div>
                                            <h3 className={`text-xl font-bold mb-2 group-hover:text-brand-500 transition-colors ${textMain}`}>{article.title}</h3>
                                            <p className={`text-sm mb-4 leading-relaxed ${textMuted}`}>{article.excerpt}</p>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-xs font-mono px-2 py-1 rounded ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-300'}`}>
                                                    {article.readTime}
                                                </span>
                                                <div className={`flex items-center gap-2 text-sm ${textMuted}`}>
                                                    <BookOpen size={16} /> Read more
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PROJECTS TAB */}
                            {activeTab === 'Projects' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {userProjects.length === 0 && (
                                        <div className={`py-12 text-center italic ${textMuted}`}>No active projects found.</div>
                                    )}
                                    {userProjects.map(task => (
                                        <div key={task.id} className={`p-4 rounded-xl border flex flex-col gap-3 transition-all ${cardBg}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400'}`}>
                                                        <Briefcase size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className={`font-bold text-sm ${textMain}`}>{task.title}</h4>
                                                        <div className={`text-xs font-mono opacity-60 ${textMuted}`}>{task.id}</div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={task.status} />
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="flex items-center gap-2">
                                                    <PriorityIcon priority={task.priority} />
                                                    <span className={`text-xs ${textMuted}`}>{task.priority}</span>
                                                </div>
                                                <div className={`text-xs flex items-center gap-1 ${textMuted}`}>
                                                    <Calendar size={12} /> Due {task.dueDate}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ACTIVITY TAB */}
                            {activeTab === 'Activity' && (
                                <div className="relative pl-6 border-l border-dashed border-slate-700/30 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    {MOCK_ACTIVITY.map((act, i) => (
                                        <div key={act.id} className="relative">
                                            <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-4 ${isLight ? 'bg-white border-slate-200' : 'bg-[#020617] border-slate-700'}`} />
                                            <div className="flex flex-col gap-1">
                                                <div className={`text-sm ${textMain}`}>
                                                    <span className="font-bold capitalize">{act.type}d</span> on <span className="font-medium italic">"{act.target}"</span>
                                                </div>
                                                <div className={`text-xs flex items-center gap-1 ${textMuted}`}>
                                                    <Activity size={12} /> {act.date}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Sidebar (Desktop) - Network */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className={`sticky top-24 rounded-2xl border p-6 ${cardBg}`}>
                            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${textMain}`}>
                                <Users size={16} /> Similar Profiles
                            </h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold`}>
                                            U{i}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-bold truncate ${textMain}`}>User Name {i}</div>
                                            <div className={`text-xs truncate ${textMuted}`}>Software Engineer</div>
                                        </div>
                                        <button className={`p-1.5 rounded-lg border ${isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-400' : 'border-white/10 hover:bg-white/10 text-white/40'}`}>
                                            <CheckCircle2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button className={`w-full mt-6 py-2 text-xs font-bold rounded-lg border border-dashed ${isLight ? 'border-slate-300 text-slate-500 hover:bg-slate-50' : 'border-white/20 text-slate-400 hover:bg-white/5'}`}>
                                View All
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
