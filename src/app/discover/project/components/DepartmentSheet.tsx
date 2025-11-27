
'use client';

import React, { useState, useMemo } from 'react';
import { X, Users, Briefcase, PlusCircle } from 'lucide-react';
import { Assignee, TaskNode, Theme, UserRole } from '../types';
import { PriorityIcon } from './Plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { useToast } from '@/hooks/use-toast';

interface DepartmentSheetProps {
    department: Assignee | null;
    members: Assignee[]; // Members of this team
    teams: Assignee[]; // Teams under this department
    tasks: TaskNode[]; // Tasks assigned to this team context
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
}

type Tab = 'Overview' | 'Members' | 'Teams' | 'Work' | 'Activity';


// Moved Backdrop outside of the main component
const Backdrop: React.FC<{ onClick: () => void, isLight: boolean }> = ({ onClick, isLight }) => {
    const overlayClass = isLight ? "bg-black/20 backdrop-blur-sm" : "bg-black/60 backdrop-blur-sm";
    return <div className={`fixed inset-0 z-[150] ${overlayClass} animate-in fade-in duration-300`} onClick={onClick} />;
};

// Moved Content outside of the main component
const Content: React.FC<DepartmentSheetProps & { department: Assignee }> = ({ 
    department, members, teams, tasks, onClose, theme
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const { addMember, currentUser } = useStore();
    const { toast } = useToast();
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    const sheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white border-white/10";
    const cardClass = isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const textMain = isLight ? "text-slate-900" : "text-white";
    const borderClass = isLight ? "border-slate-100" : "border-white/5";

    const canManage = currentUser.role === 'Owner';
    
    const stats = {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'Done').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        blocked: tasks.filter(t => t.priority === 'Critical').length
    };
    const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    const teamActivity = useMemo(() => {
        return []; // Placeholder
    }, [tasks]);

    const handleCreateTeam = () => {
        if (!addMember || !newTeamName.trim() || !department) {
            setIsCreatingTeam(false);
            setNewTeamName('');
            return;
        }

        addMember({
            name: newTeamName,
            type: 'team',
            color: 'bg-teal-500',
            parentId: department.id
        });
        toast({
            title: "Team Created",
            description: `The "${newTeamName}" team has been created in ${department.name}.`
        });
        setIsCreatingTeam(false);
        setNewTeamName('');
    };

    return (
        <div className="flex flex-col h-full">
            <div className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-6 border-b flex-shrink-0 gap-4 ${borderClass}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${department.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}>
                        {department.initials}
                    </div>
                    <div>
                        <h2 className={`text-3xl font-bold ${textMain}`}>{department.name}</h2>
                        <div className={`flex items-center gap-3 mt-1 text-sm ${textMuted}`}>
                            <span className="flex items-center gap-1"><Users size={14} /> {members.length} Members</span>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {tasks.length} Projects</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                     <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                        <X size={24} />
                    </button>
                </div>
            </div>

            <div className={`px-6 pt-2 border-b flex gap-6 overflow-x-auto ${borderClass}`}>
                {['Overview', 'Members', 'Teams', 'Work', 'Activity'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as Tab)}
                        className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === tab 
                            ? 'border-brand-500 text-brand-500' 
                            : `border-transparent ${textMuted} hover:${textMain}`
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-opacity-50">
                {activeTab === 'Overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className={`p-4 rounded-xl border flex flex-col gap-1 ${cardClass}`}>
                                <span className={`text-xs font-bold uppercase ${textMuted}`}>Active Tasks</span>
                                <span className={`text-2xl font-bold text-blue-500`}>{stats.inProgress}</span>
                            </div>
                            <div className={`p-4 rounded-xl border flex flex-col gap-1 ${cardClass}`}>
                                <span className={`text-xs font-bold uppercase ${textMuted}`}>Completed</span>
                                <span className={`text-2xl font-bold text-emerald-500`}>{stats.done}</span>
                            </div>
                            <div className={`p-4 rounded-xl border flex flex-col gap-1 ${cardClass}`}>
                                <span className={`text-xs font-bold uppercase ${textMuted}`}>Blocked</span>
                                <span className={`text-2xl font-bold text-rose-500`}>{stats.blocked}</span>
                            </div>
                            <div className={`p-4 rounded-xl border flex flex-col gap-1 ${cardClass}`}>
                                <span className={`text-xs font-bold uppercase ${textMuted}`}>Efficiency</span>
                                <span className={`text-2xl font-bold text-purple-500`}>{completionRate}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <h3 className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Current Focus</h3>
                                <div className="space-y-3">
                                    {tasks.filter(t => t.status === 'In Progress').slice(0, 5).map(task => (
                                        <div key={task.id} className={`p-4 rounded-xl border flex items-center justify-between ${cardClass}`}>
                                            <div>
                                                <h4 className={`font-bold text-sm ${textMain}`}>{task.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center text-white font-bold ${task.assignee.color}`}>
                                                        {task.assignee.initials}
                                                    </div>
                                                    <span className={`text-xs ${textMuted}`}>{task.assignee.name}</span>
                                                </div>
                                            </div>
                                            <PriorityIcon priority={task.priority} />
                                        </div>
                                    ))}
                                    {tasks.filter(t => t.status === 'In Progress').length === 0 && (
                                        <div className={`text-sm italic py-4 ${textMuted}`}>No active tasks currently.</div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Team Structure</h3>
                                 <div className="space-y-2">
                                    {members.slice(0, 5).map(m => (
                                        <div key={m.id} className="flex items-center gap-3 p-2">
                                            <div className={`w-8 h-8 rounded-full ${m.color} flex items-center justify-center text-white font-bold text-xs`}>
                                                {m.initials}
                                            </div>
                                            <span className={`text-sm font-medium ${textMain}`}>{m.name}</span>
                                        </div>
                                    ))}
                                    {members.length > 5 && (
                                        <div className={`text-xs pl-11 ${textMuted}`}>+ {members.length - 5} others</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Members' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...members].map(member => (
                                <div key={member.id} className={`p-5 rounded-2xl border flex flex-col gap-4 ${cardClass}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                                            {member.initials}
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-lg ${textMain}`}>{member.name}</h4>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400'}`}>
                                                {member.role || 'Member'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {activeTab === 'Teams' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                         {canManage && (
                             <Button variant="outline" size="sm" onClick={() => setIsCreatingTeam(true)}>
                                 <PlusCircle className="mr-2 h-4 w-4" />
                                 Create Team
                             </Button>
                         )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teams.map(team => (
                                <div key={team.id} className={`p-4 rounded-xl border ${cardClass}`}>
                                    <h4 className={`font-bold ${textMain}`}>{team.name}</h4>
                                </div>
                            ))}
                            {isCreatingTeam && (
                                 <div className={`p-4 rounded-xl border-2 border-dashed flex items-center gap-4 w-full ${isLight ? 'border-brand-300 bg-brand-50' : 'border-brand-500/50 bg-brand-500/10'}`}>
                                     <Input 
                                         autoFocus
                                         value={newTeamName}
                                         onChange={(e) => setNewTeamName(e.target.value)}
                                         onKeyDown={(e) => {
                                             if (e.key === 'Enter') handleCreateTeam();
                                             if (e.key === 'Escape') setIsCreatingTeam(false);
                                         }}
                                         placeholder="New Team Name"
                                         className={`h-auto p-0 bg-transparent border-0 font-bold text-base ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${textMain} placeholder:text-slate-500`}
                                     />
                                     <Button size="sm" onClick={handleCreateTeam}>Create</Button>
                                 </div>
                            )}
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};


export const DepartmentSheet: React.FC<DepartmentSheetProps> = (props) => {
    const { isOpen, onClose, department, theme } = props;
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const sheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white border-white/10";

    if (!isOpen || !department) return null;

    return (
        <>
            <Backdrop onClick={onClose} isLight={isLight} />
            
            <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[160] rounded-t-3xl h-[92vh] flex flex-col shadow-2xl transition-transform animate-in slide-in-from-bottom-full ${sheetClass}`}>
                <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                </div>
                <Content {...props} department={department} />
            </div>

            <div className="hidden lg:flex fixed inset-0 z-[160] items-center justify-center p-8 pointer-events-none">
                <div className={`w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl border pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${sheetClass}`}>
                    <Content {...props} department={department} />
                </div>
            </div>
        </>
    );
};

