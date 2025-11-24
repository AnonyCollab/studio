
import React from 'react';
import { Layers, Layout, Plus, CheckCircle2, Menu } from 'lucide-react';
import { Page, ViewMode, Theme } from '../types';

interface MobileDockProps {
    currentPage: Page;
    viewMode: ViewMode;
    setPage: (p: Page) => void;
    setViewMode: (m: ViewMode) => void;
    onToggleSidebar: () => void;
    onToggleViewMenu: () => void;
    onToggleMobileTasks: () => void;
    onToggleMobileMenu: () => void;
    onAddTask: () => void;
    isSidebarOpen: boolean;
    isViewMenuOpen: boolean;
    theme: Theme;
}

export const MobileDock: React.FC<MobileDockProps> = ({
    currentPage,
    viewMode,
    setPage,
    setViewMode,
    onToggleSidebar,
    onToggleViewMenu,
    onToggleMobileTasks,
    onToggleMobileMenu,
    onAddTask,
    isSidebarOpen,
    isViewMenuOpen,
    theme
}) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    
    // Base classes
    const containerClass = isLight 
        ? "bg-white/90 border-black/10 shadow-2xl" 
        : "bg-black/60 border-white/10 shadow-2xl";
    
    const iconClass = isLight ? "text-slate-600 active:bg-black/5" : "text-slate-300 active:bg-white/10";
    
    const dockItemClass = `flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all duration-200 active:scale-95 ${iconClass}`;

    // Pages where Layers (Sidebar) and Layout (Views) are active
    // Now active on basically all main pages to support custom views/filters
    const showNavControls = true; 

    return (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-auto animate-in slide-in-from-bottom-10 duration-500 fade-in">
            <div className={`flex items-center gap-1 p-1.5 rounded-2xl backdrop-blur-2xl border ${containerClass}`}>
                
                {/* 1. Layers (Sidebar / Filters) */}
                <button onClick={onToggleSidebar} className={`${dockItemClass} ${isSidebarOpen ? 'text-brand-500 bg-brand-500/10' : ''}`}>
                    <Layers size={24} strokeWidth={2} />
                </button>

                {/* 2. View Switcher */}
                <button onClick={onToggleViewMenu} className={`${dockItemClass} ${isViewMenuOpen ? 'text-brand-500 bg-brand-500/10' : ''}`}>
                    <Layout size={24} strokeWidth={2} />
                </button>

                {/* 3. ADD TASK (Center) */}
                <button 
                    onClick={onAddTask}
                    className="w-14 h-14 -mt-8 mb-0 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 active:scale-95 transition-transform mx-2 ring-4 ring-transparent hover:ring-brand-500/20"
                >
                    <Plus size={28} strokeWidth={3} />
                </button>

                {/* 4. My Tasks (Issues) */}
                <button onClick={onToggleMobileTasks} className={dockItemClass}>
                    <CheckCircle2 size={24} strokeWidth={2} />
                </button>

                {/* 5. Main Menu */}
                <button onClick={onToggleMobileMenu} className={dockItemClass}>
                    <Menu size={24} strokeWidth={2} />
                </button>

            </div>
        </div>
    );
};
