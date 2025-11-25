
import React, { useState, useEffect, useRef } from 'react';
import { 
    X, CheckSquare, ListTodo, Calendar, Flag, UserPlus, Users, 
    Upload, FolderPlus, HelpCircle, MessageSquare, RefreshCcw, BarChart, Target, Zap, BookOpen 
} from 'lucide-react';
import { Page, Theme, UserPost, Assignee, FileItem, TaskType } from '../types';
import { CommunityComposer } from './CommunityComposer';

interface CreationSheetProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: Page;
    theme: Theme;
    onCreateTask: (overrides?: any) => void;
    onAddPost?: (post: Partial<UserPost>) => void;
    onAddMember?: (member: Partial<Assignee>) => void;
    onAddFile?: (file: Partial<FileItem>) => void;
}

type PostType = 'Help' | 'Feedback' | 'Update' | 'Poll';

export const CreationSheet: React.FC<CreationSheetProps> = ({ 
    isOpen, onClose, currentPage, theme, onCreateTask, onAddPost, onAddMember, onAddFile
}) => {
    const [selectedAction, setSelectedAction] = useState<PostType | null>(null);
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#09090b] text-white";
    const itemHover = isLight ? "hover:bg-slate-100 active:bg-slate-200" : "hover:bg-white/5 active:bg-white/10";
    const borderClass = isLight ? "border-slate-100" : "border-white/5";
    
    const touchStart = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const delta = e.changedTouches[0].clientY - touchStart.current;
        if (delta > 75) onClose();
        touchStart.current = null;
    };

    useEffect(() => { if (isOpen) setSelectedAction(null); }, [isOpen]);

    const Backdrop = ({ onClick }: { onClick: () => void }) => (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] animate-in fade-in duration-300" onClick={onClick} />
    );

    if (!isOpen) return null;

    if (selectedAction) {
        return (
            <>
                <Backdrop onClick={onClose} />
                <div key="composer" className={`fixed inset-x-0 bottom-0 z-[200] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 animate-in slide-in-from-bottom-full ${mobileSheetClass} h-[85vh]`}>
                    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                            <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                        </div>
                        <CommunityComposer 
                            type={selectedAction} 
                            onClose={onClose} 
                            onBack={() => setSelectedAction(null)} 
                            theme={theme} 
                            onAddPost={onAddPost}
                        />
                    </div>
                </div>
            </>
        );
    }

    const handleInviteMember = () => {
        if (onAddMember) onAddMember({ name: `New Member ${Math.floor(Math.random()*100)}`, initials: 'NM' });
        onClose();
    }

    const handleUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file && onAddFile) {
                onAddFile({ 
                    name: file.name, 
                    type: 'file',
                    fileType: file.type,
                    size: `${(file.size / 1024).toFixed(2)} KB` 
                });
            }
        };
        input.click();
        onClose();
    }
    
    const handleCreateFolder = () => {
        if (onAddFile) {
            const folderName = prompt("Enter folder name:");
            if (folderName) {
                onAddFile({ name: folderName, type: 'folder' });
            }
        }
        onClose();
    };

    const getOptions = () => {
        switch (currentPage) {
            case 'roadmap': return [
                { label: 'New Issue', icon: CheckSquare, action: () => onCreateTask({ type: 'Issue' }), color: 'text-brand-500' }, 
                { label: 'Epic', icon: Zap, action: () => onCreateTask({ type: 'Epic' }), color: 'text-purple-500' },
                { label: 'Story', icon: BookOpen, action: () => onCreateTask({ type: 'Story' }), color: 'text-emerald-500' },
                { label: 'Goal', icon: Target, action: () => onCreateTask({ type: 'Goal' }), color: 'text-blue-500' },
                { label: 'Milestone', icon: Flag, action: () => onCreateTask({ type: 'Milestone' }), color: 'text-red-500' }
            ];
            case 'calendar': return [{ label: 'New Event', icon: Calendar, action: onCreateTask, color: 'text-emerald-500' }, { label: 'Campaign', icon: Flag, action: onCreateTask, color: 'text-orange-500' }];
            case 'members': return [{ label: 'Invite Member', icon: UserPlus, action: handleInviteMember, color: 'text-brand-500' }, { label: 'Create Team', icon: Users, action: () => console.log('Create Team'), color: 'text-purple-500' }];
            case 'resources': return [{ label: 'Upload File', icon: Upload, action: handleUpload, color: 'text-brand-500' }, { label: 'New Folder', icon: FolderPlus, action: handleCreateFolder, color: 'text-yellow-500' }];
            case 'community': return [{ label: 'Ask for Help', icon: HelpCircle, action: () => setSelectedAction('Help'), color: 'text-rose-500' }, { label: 'Submit Feedback', icon: MessageSquare, action: () => setSelectedAction('Feedback'), color: 'text-blue-500' }, { label: 'Post Update', icon: RefreshCcw, action: () => setSelectedAction('Update'), color: 'text-emerald-500' }, { label: 'Create Poll', icon: BarChart, action: () => setSelectedAction('Poll'), color: 'text-purple-500' }];
            default: return [{ label: 'New Task', icon: CheckSquare, action: onCreateTask, color: 'text-brand-500' }];
        }
    };

    const options = getOptions();
    const getTitle = () => {
        switch (currentPage) {
            case 'roadmap': return 'Create New';
            case 'calendar': return 'Schedule';
            case 'members': return 'Manage Team';
            case 'resources': return 'Add Resource';
            case 'community': return 'New Post';
            default: return 'Create';
        }
    };

    const handleOptionClick = (opt: any) => {
        opt.action();
    };

    return (
        <>
            <Backdrop onClick={onClose} />
            <div key="menu" className={`fixed inset-x-0 bottom-0 z-[200] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 animate-in slide-in-from-bottom-full ${mobileSheetClass} max-h-[85vh]`}>
                <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                    <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                        <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                    </div>
                    <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                        <h2 className="text-xl font-bold flex items-center gap-2">{getTitle()}</h2>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20"><X size={20} /></button>
                    </div>
                </div>
                <div className="p-4 pb-12 space-y-2 overflow-y-auto custom-scrollbar">
                    {options.map((opt, idx) => (
                        <button key={idx} onClick={() => handleOptionClick(opt)} className={`w-full flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all border ${borderClass} ${itemHover}`}>
                            <div className={`p-3 rounded-full bg-current/10 ${opt.color}`}><opt.icon size={24} className="text-current" /></div>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
