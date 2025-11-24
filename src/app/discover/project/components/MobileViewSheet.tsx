
import React, { useRef } from 'react';
import { Layout, Trello, List as ListIcon, Calendar, X, Clock, Columns, Grid, CalendarRange, Users, Crown, Network, FileText, Folder, File, Image, Video, HelpCircle, MessageCircle, RefreshCcw, BarChart, Target, Briefcase, CheckCircle2 } from 'lucide-react';
import { ViewMode, Theme, Page, CalendarViewMode, MembersViewMode, ResourcesViewMode, CommunityViewMode, DashboardViewMode } from '../types';

interface MobileViewSheetProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    
    currentPage?: Page;
    
    dashboardView?: DashboardViewMode;
    setDashboardView?: (mode: DashboardViewMode) => void;

    calendarView?: CalendarViewMode;
    setCalendarView?: (mode: CalendarViewMode) => void;

    membersView?: MembersViewMode;
    setMembersView?: (mode: MembersViewMode) => void;

    resourcesView?: ResourcesViewMode;
    setResourcesView?: (mode: ResourcesViewMode) => void;

    communityView?: CommunityViewMode;
    setCommunityView?: (mode: CommunityViewMode) => void;
    
    setFilter?: (f: any) => void;
}

export const MobileViewSheet: React.FC<MobileViewSheetProps> = ({ 
    viewMode, setViewMode, isOpen, onClose, theme, currentPage, 
    dashboardView, setDashboardView,
    calendarView, setCalendarView,
    membersView, setMembersView,
    resourcesView, setResourcesView,
    communityView, setCommunityView,
    setFilter
}) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#09090b] text-white";
    
    const touchStart = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientY - touchStart.current;
        if (delta > 75) onClose();
        touchStart.current = null;
    };

    // Options Configurations
    const roadmapOptions = [
        // Canvas removed for mobile
        { id: 'board', icon: Trello, label: 'Board' },
        { id: 'list', icon: ListIcon, label: 'List' },
        { id: 'timeline', icon: Calendar, label: 'Gantt' },
        { id: 'outline', icon: FileText, label: 'Outline' }
    ];

    const dashboardOptions = [
        { id: 'Personal', icon: Target, label: 'My Focus' },
        { id: 'Team', icon: Users, label: 'Team Pulse' },
        { id: 'Project', icon: Briefcase, label: 'Project Overview' }
    ];

    const calendarOptions = [
        { id: 'Schedule', icon: ListIcon, label: 'Schedule' },
        { id: 'Day', icon: Clock, label: 'Day' },
        { id: '3 Days', icon: Columns, label: '3 Days' },
        { id: 'Week', icon: Grid, label: 'Week' },
        { id: 'Month', icon: CalendarRange, label: 'Month' }
    ];

    const membersOptions = [
        { id: 'All', icon: Network, label: 'All' },
        { id: 'Team Members', icon: Users, label: 'Team Members' },
        { id: 'Teams', icon: Grid, label: 'Teams' },
        { id: 'Coordinators', icon: Crown, label: 'Coordinators' }
    ];

    const resourcesOptions = [
        { id: 'All', icon: Grid, label: 'All Items' },
        { id: 'Files', icon: FileText, label: 'Files' },
        { id: 'Folders', icon: Folder, label: 'Folders' },
        { id: 'PDF', icon: File, label: 'PDFs' },
        { id: 'PPTX', icon: File, label: 'Presentations' },
        { id: 'ZIP', icon: File, label: 'Archives' },
        { id: 'Image', icon: Image, label: 'Images' },
        { id: 'Video', icon: Video, label: 'Videos' }
    ];

    const communityOptions = [
        { id: 'All', icon: Grid, label: 'All' },
        { id: 'Help', icon: HelpCircle, label: 'Help & Support' },
        { id: 'Feedback', icon: MessageCircle, label: 'Feedback' },
        { id: 'Updates', icon: RefreshCcw, label: 'Updates' },
        { id: 'Polls', icon: BarChart, label: 'Polls' }
    ];

    const Backdrop = ({ onClick }: { onClick: () => void }) => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] lg:hidden animate-in fade-in duration-300" onClick={onClick} />
    );

    if (!isOpen) return null;
    
    let options: any[] = [];
    let currentMode: any = '';
    let setMode: any = () => {};

    if (currentPage === 'dashboard') { options = dashboardOptions; currentMode = dashboardView; setMode = setDashboardView; } 
    else if (currentPage === 'calendar') { options = calendarOptions; currentMode = calendarView; setMode = setCalendarView; } 
    else if (currentPage === 'members') { options = membersOptions; currentMode = membersView; setMode = setMembersView; } 
    else if (currentPage === 'resources') { options = resourcesOptions; currentMode = resourcesView; setMode = setResourcesView; } 
    else if (currentPage === 'community') { options = communityOptions; currentMode = communityView; setMode = setCommunityView; } 
    else { options = roadmapOptions; currentMode = viewMode; setMode = setViewMode; }

    const handleSelect = (id: string) => {
        if (id === 'my-tasks') {
            if (setViewMode) setViewMode('list');
            if (setFilter) setFilter('Mine');
        } else {
            if (setMode) setMode(id);
        }
        onClose();
    };

    return (
        <>
            <Backdrop onClick={onClose} />
            <div className={`fixed inset-x-0 bottom-0 z-[200] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:hidden animate-in slide-in-from-bottom-full ${mobileSheetClass} max-h-[85vh]`}>
                <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                        <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                                <Layout size={24} className="text-brand-500" />
                                Select View
                        </h2>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 pb-safe space-y-2 overflow-y-auto custom-scrollbar">
                    {options.map(v => (
                        <button
                            key={v.id}
                            onClick={() => handleSelect(v.id)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all border ${isLight ? 'border-black/5' : 'border-white/5'} ${currentMode === v.id ? 'bg-brand-500 text-white shadow-lg' : (isLight ? 'bg-slate-50 hover:bg-slate-100 text-slate-700' : 'bg-white/5 hover:bg-white/10 text-slate-300')}`}
                        >
                            <v.icon size={24} />
                            {v.label}
                            {currentMode === v.id && <div className="ml-auto w-2 h-2 rounded-full bg-white" />}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
