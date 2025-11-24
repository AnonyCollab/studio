
'use client';

import React, { useRef, useEffect } from 'react';
import { 
    Layout, BarChart3, Layers, Calendar, Users, FolderHeart, MessageSquare, Info, Palette, 
    Check, CheckCircle2, Briefcase, X, User, Shield, ChevronDown, Bell, Home, Compass, Newspaper, Handshake
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Page, Theme, BackgroundType, TaskNode, FilterOption, CurrentUser, UserRole } from '../types';
import { StatusBadge, PriorityIcon } from './Plan';
import { useUser } from '@/firebase';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';

interface HeaderProps {
    currentPage: Page;
    setPage: (page: Page) => void;
    theme: Theme;
    background: BackgroundType;
    setTheme: (t: Theme) => void;
    setBackground: (b: BackgroundType) => void;
    tasks?: TaskNode[];
    filter?: FilterOption;
    setFilter?: (f: FilterOption) => void;
    selectTask?: (id: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (v: boolean) => void;
    isMobileTasksOpen: boolean;
    setIsMobileTasksOpen: (v: boolean) => void;
    currentUser?: CurrentUser;
    setCurrentUser?: (u: CurrentUser) => void;
}

const Backdrop: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140] lg:hidden animate-in fade-in duration-300" onClick={onClick} />
);

export const Header: React.FC<HeaderProps> = ({ 
    currentPage, setPage, theme, background, setTheme, setBackground,
    tasks = [], filter = 'All', setFilter = (f) => {}, selectTask = (id) => {},
    isMobileMenuOpen, setIsMobileMenuOpen, isMobileTasksOpen, setIsMobileTasksOpen,
    currentUser, setCurrentUser
}) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const { user: authUser } = useUser();
    
    // Swipe Logic
    const touchStart = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: React.TouchEvent, onClose: () => void) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientY - touchStart.current;
        if (delta > 75) onClose();
        touchStart.current = null;
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen || isMobileTasksOpen) { document.body.style.overflow = 'hidden'; } 
        else { document.body.style.overflow = ''; }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen, isMobileTasksOpen]);

    const containerClass = isLight ? "border-black/5" : "border-white/5";
    const bgClass = isLight ? "bg-white/80" : "bg-black/40";
    const textClass = isLight ? "text-slate-700" : "text-slate-200";
    const activeClass = isLight ? "bg-black/5 text-black font-bold" : "bg-white/10 text-white font-bold";
    const hoverClass = isLight ? "hover:bg-black/5 hover:text-black" : "hover:bg-white/10 hover:text-white";
    const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#09090b] text-white";

    const navItems = [
        { id: 'roadmap', label: 'Roadmap', icon: Layout },
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'calendar', label: 'Calendar', icon: Calendar },
        { id: 'members', label: 'Members', icon: Users },
        { id: 'resources', label: 'Resources', icon: FolderHeart },
        { id: 'community', label: 'Community', icon: MessageSquare },
    ];

    const filterOptions = [
        { id: 'Mine', label: 'My Tasks', icon: CheckCircle2 },
        { id: 'Team', label: 'Team', icon: Users },
        { id: 'Project', label: 'Project', icon: Layers },
        { id: 'All', label: 'All', icon: Briefcase },
    ];

    const roles: UserRole[] = ['Visitor', 'Member', 'Team Lead', 'Coordinator', 'Owner'];
    
    const mainNavLinks = [
        { href: "/posts", icon: Home, label: "Home" },
        { href: "/discover", icon: Compass, label: "Discover" },
        { href: "/news", icon: Newspaper, label: "News" },
        { href: "/messages", icon: MessageSquare, label: "Messages" },
    ];

    return (
        <>
            <header className={`hidden lg:flex h-16 border-b items-center justify-between px-6 z-[60] flex-shrink-0 relative ${containerClass}`}>
                <div className={`absolute inset-0 backdrop-blur-md -z-10 ${bgClass}`} />
                <div className="flex items-center gap-4 overflow-hidden w-auto relative z-[70]">
                    <div className="flex items-center gap-3 flex-shrink-0 mr-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-3 group">
                                     <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                                        <Handshake size={18} />
                                    </div>
                                    <span className={`font-bold text-lg tracking-tight ${textClass}`}>AnonyCollab</span>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors`} />
                                </button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent className={`w-56 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e1e1e] border-gray-700'}`}>
                                {mainNavLinks.map(link => (
                                    <DropdownMenuItem key={link.href} asChild>
                                        <Link href={link.href} className={`flex items-center gap-2 ${isLight ? 'text-slate-700 focus:bg-slate-100' : 'text-slate-200 focus:bg-white/10'}`}>
                                            <link.icon size={16} />
                                            {link.label}
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <nav className="flex items-center gap-1 pr-4">
                        {navItems.map(item => (
                            <button key={item.id} onClick={() => setPage(item.id as Page)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${currentPage === item.id ? activeClass : `${textClass} ${hoverClass}`}`}>
                                <item.icon size={16} /> <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3 pl-4 border-l flex-shrink-0 border-white/10 relative z-[70]">
                     <button className={`relative p-2 transition-colors rounded-full ${isLight ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}>
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>
                    {authUser && <ProfileDropdown theme={theme} onToggleTheme={setBackground as any} />}
                </div>
            </header>

            {/* Mobile Tasks Bottom Sheet */}
            {isMobileTasksOpen && <Backdrop onClick={() => setIsMobileTasksOpen(false)} />}
            <div className={`fixed inset-x-0 bottom-0 z-[200] h-[85vh] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:hidden ${isMobileTasksOpen ? 'translate-y-0' : 'translate-y-full'} ${mobileSheetClass}`}>
                 <div onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e, () => setIsMobileTasksOpen(false))}>
                     <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsMobileTasksOpen(false)}>
                        <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                     </div>
                     <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                        <h2 className={`text-xl font-bold ${textClass} flex items-center gap-2`}><CheckCircle2 size={24} className="text-brand-500" /> My Tasks</h2>
                        <button onClick={() => setIsMobileTasksOpen(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={20} /></button>
                     </div>
                 </div>
                 <div className="flex-1 flex flex-col gap-4 overflow-hidden px-4 pt-4">
                     <div className={`p-1.5 rounded-xl border flex gap-1 flex-shrink-0 ${isLight ? 'border-black/5 bg-slate-50' : 'border-white/5 bg-white/5'}`}>
                        {filterOptions.map((opt) => (
                            <button key={opt.id} onClick={() => setFilter(opt.id as FilterOption)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${filter === opt.id ? 'bg-brand-500 text-white shadow-md' : (isLight ? 'text-slate-500 hover:bg-black/5' : 'text-slate-400 hover:bg-white/10')}`}>
                                <opt.icon size={16} /> <span className="text-[9px] font-bold uppercase">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 pb-safe">
                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2"><Briefcase size={32} /><span className="text-sm">No tasks found.</span></div>
                        )}
                        {tasks.map(task => (
                            <div key={task.id} onClick={() => { selectTask(task.id); setIsMobileTasksOpen(false); }} className={`p-3 rounded-xl cursor-pointer group transition-all border ${isLight ? 'bg-slate-50 border-black/5' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <StatusBadge status={task.status} />
                                    <div className={`px-2 py-0.5 rounded flex items-center gap-1 ${isLight ? 'bg-white' : 'bg-white/10'}`}><PriorityIcon priority={task.priority} /><span className="text-[10px] font-bold uppercase opacity-70">{task.priority}</span></div>
                                </div>
                                <div className={`font-bold text-sm mb-2 leading-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{task.title}</div>
                                <div className="flex items-center gap-3">
                                     <div className={`w-5 h-5 rounded-full ${task.assignee.color} flex items-center justify-center text-[9px] text-white font-bold`}>{task.assignee.initials}</div>
                                     <div className="text-[10px] text-slate-500 font-mono">Due {task.dueDate}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>

            {/* Mobile Menu Bottom Sheet */}
            {isMobileMenuOpen && <Backdrop onClick={() => setIsMobileMenuOpen(false)} />}
            <div className={`fixed inset-x-0 bottom-0 z-[200] h-[85vh] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-y-0' : 'translate-y-full'} ${mobileSheetClass}`}>
                <div onTouchStart={handleTouchStart} onTouchEnd={(e) => handleTouchEnd(e, () => setIsMobileMenuOpen(false))}>
                    <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                        <div className="flex items-center gap-3"><div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold"><Layers size={18} /></div><span className="font-bold text-xl">Menu</span></div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={20} /></button>
                    </div>
                </div>
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto custom-scrollbar px-6 pt-4 pb-safe">
                    <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/10 mb-4">
                        <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-1">Signed in as</div>
                        <div className="font-bold text-lg">{currentUser?.name}</div>
                        <div className="text-xs opacity-70">{currentUser?.role}</div>
                    </div>

                    <div className="text-xs font-bold uppercase tracking-wider opacity-50 mb-2">Pages</div>
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => { setPage(item.id as Page); setIsMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all ${currentPage === item.id ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-black/5'}`}>
                            <item.icon size={24} /> {item.label}
                        </button>
                    ))}
                    <button onClick={() => { setPage('profile'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all ${currentPage === 'profile' ? 'bg-brand-500 text-white shadow-lg' : 'hover:bg-black/5'}`}>
                        <User size={24} /> My Profile
                    </button>
                    
                    <div className="mt-6 mb-2 text-xs font-bold uppercase tracking-wider opacity-50">Settings</div>
                    <div className={`p-4 rounded-xl border space-y-4 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                         <div>
                            <div className="text-sm font-bold mb-3 flex items-center gap-2"><Palette size={16} /> Theme</div>
                            <div className="flex flex-wrap gap-3">
                                {['Light', 'Dark', 'Sephiroa', 'Green', 'Blue'].map(t => (
                                    <button key={t} onClick={() => setTheme(t as Theme)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${theme === t ? 'ring-2 ring-brand-500 scale-110 border-brand-500' : 'border-transparent opacity-70'}`} style={{ backgroundColor: t === 'Light' ? '#ffffff' : t === 'Sephiroa' ? '#FDFCF0' : t === 'Green' ? '#F0F5F0' : t === 'Blue' ? '#020817' : '#09090b' }}>
                                        {theme === t && <Check size={16} className={t === 'Light' || t === 'Sephiroa' || t === 'Green' ? 'text-black' : 'text-white'} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
