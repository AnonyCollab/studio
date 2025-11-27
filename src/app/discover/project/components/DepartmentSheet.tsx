
'use client';

import React, { useState, useMemo } from 'react';
import { X, Users, Briefcase, PlusCircle, Folder, ArrowLeft, Layers, User, ChevronUp, ChevronDown, MoreHorizontal, Mail, UserPlus, LogOut } from 'lucide-react';
import { Assignee, TaskNode, Theme, UserRole } from '../types';
import { PriorityIcon, StatusBadge } from './Plan';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStore } from '../store/useStore';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DepartmentSheetProps {
    item: Assignee | null;
    members: Assignee[]; // Members of this team/dept
    teams: Assignee[]; // Teams under this dept
    tasks: TaskNode[]; // Tasks assigned to this context
    isOpen: boolean;
    onClose: () => void;
    onBack?: () => void;
    onSelectTeam: (team: Assignee) => void;
    onViewProfile: (member: Assignee) => void;
    theme: Theme;
}

type Tab = 'Overview' | 'Members' | 'Teams' | 'Work' | 'Activity';
const ROLE_HIERARCHY: UserRole[] = ['Owner', 'Co-Owner', 'Coordinator', 'Team Lead', 'Member'];


const Backdrop: React.FC<{ onClick: () => void, isLight: boolean }> = ({ onClick, isLight }) => {
    const overlayClass = isLight ? "bg-black/20 backdrop-blur-sm" : "bg-black/60 backdrop-blur-sm";
    return <div className={`fixed inset-0 z-[150] ${overlayClass} animate-in fade-in duration-300`} onClick={onClick} />;
};

const Content: React.FC<DepartmentSheetProps & { item: Assignee }> = ({ 
    item, members, teams, tasks, onClose, onBack, onSelectTeam, onViewProfile, theme
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const { addMember, currentUser, updateMember, removeMember } = useStore();
    const { toast } = useToast();
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    const sheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white border-white/10";
    const cardClass = isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const textMain = isLight ? "text-slate-900" : "text-white";
    const borderClass = isLight ? "border-slate-100" : "border-white/5";
    const tableHeaderBg = isLight ? "bg-black/5 text-slate-600" : "bg-white/5 text-slate-400";
    const tableRowBorder = isLight ? "border-black/5 hover:bg-black/5" : "border-white/5 hover:bg-white/5";

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
        if (!addMember || !newTeamName.trim() || !item) {
            setIsCreatingTeam(false);
            setNewTeamName('');
            return;
        }

        addMember({
            name: newTeamName,
            type: 'team',
            color: 'bg-teal-500',
            parentId: item.id
        });
        toast({
            title: "Team Created",
            description: `The "${newTeamName}" team has been created in ${item.name}.`
        });
        setIsCreatingTeam(false);
        setNewTeamName('');
    };

    const handleAddFriend = (member: Assignee) => {
        console.log(`Sending friend request to ${member.name}`);
        toast({
            title: "Friend Request Sent",
            description: `A friend request has been sent to ${member.name}.`,
        });
    };

    const handleKickMember = (member: Assignee) => {
        if (!removeMember) return;
        removeMember(member.id);
        toast({
            title: "Member Removed",
            description: `${member.name} has been removed from the project.`,
        });
    }

    return (
        <div className="flex flex-col h-full">
            <div className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-6 border-b flex-shrink-0 gap-4 ${borderClass}`}>
                <div className="flex items-center gap-4">
                     {onBack && (
                        <button onClick={onBack} className={`p-2 rounded-full -ml-2 transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}>
                        {item.initials}
                    </div>
                    <div>
                        <h2 className={`text-3xl font-bold ${textMain}`}>{item.name}</h2>
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
                        <div className={`rounded-xl border overflow-hidden ${isLight ? 'bg-white' : 'bg-black/20'} ${borderClass}`}>
                            <table className="w-full text-left">
                                <thead className={tableHeaderBg}>
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Role</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {members.map(member => {
                                        const memberRoleIndex = ROLE_HIERARCHY.indexOf(member.role || 'Member');
                                        const canManage = currentUser.role === 'Owner';
                                        const canPromote = canManage && member.id !== currentUser.id && memberRoleIndex > 0;
                                        const canDemote = canManage && member.id !== currentUser.id && memberRoleIndex < ROLE_HIERARCHY.length - 1;

                                        return (
                                            <tr key={member.id} onClick={() => onViewProfile(member)} className={`transition-colors cursor-pointer ${tableRowBorder}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${member.color || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-xs`}>
                                                            {member.initials || (member.name || '?').charAt(0)}
                                                        </div>
                                                        <span className={`font-bold text-sm ${textMain}`}>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${member.role === 'Owner' ? 'bg-amber-500/20 text-amber-500' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400')}`}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button onClick={(e) => e.stopPropagation()} className={`p-2 rounded hover:bg-white/10 ${textMuted}`}><MoreHorizontal size={16} /></button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className={`${isLight ? 'bg-white' : 'bg-[#1e1e1e] border-white/10'}`}>
                                                            {canPromote && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[memberRoleIndex - 1] }); }}><ChevronUp className="mr-2 h-4 w-4 text-emerald-500" /><span>Promote</span></DropdownMenuItem>}
                                                            {canDemote && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[memberRoleIndex + 1] }); }}><ChevronDown className="mr-2 h-4 w-4 text-rose-500" /><span>Demote</span></DropdownMenuItem>}
                                                            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddFriend(member); }}><UserPlus className="mr-2 h-4 w-4" /><span>Add Friend</span></DropdownMenuItem>
                                                            {canManage && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleKickMember(member); }} className="text-red-500"><LogOut className="mr-2 h-4 w-4"/>Kick</DropdownMenuItem>}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                         </div>
                    </div>
                )}
                 {activeTab === 'Teams' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-4">
                         {canManage && !isCreatingTeam && (
                             <Button variant="outline" size="sm" onClick={() => setIsCreatingTeam(true)}>
                                 <PlusCircle className="mr-2 h-4 w-4" />
                                 Create Team
                             </Button>
                         )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {teams.map(team => {
                                const teamStats = { total: 0, completionRate: 0 }; // Placeholder
                                return (
                                    <div key={team.id} onClick={() => onSelectTeam(team)} className={`p-4 rounded-xl border flex flex-col gap-3 cursor-pointer transition-all ${cardClass}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg ${team.color} flex items-center justify-center text-white font-bold`}>
                                                    {team.initials}
                                                </div>
                                                <h4 className={`font-bold ${textMain}`}>{team.name}</h4>
                                            </div>
                                             <div className="flex -space-x-2">
                                                {/* Placeholder for member icons */}
                                            </div>
                                        </div>
                                         <div className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className={textMuted}>Completion</span>
                                                <span className={`font-bold ${textMain}`}>{teamStats.completionRate}%</span>
                                            </div>
                                            <Progress value={teamStats.completionRate} className="h-1.5" />
                                        </div>
                                    </div>
                                );
                            })}
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
    const { isOpen, onClose, item, theme } = props;
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const sheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white border-white/10";

    if (!isOpen || !item) return null;

    return (
        <>
            <Backdrop onClick={onClose} isLight={isLight} />
            
            <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[160] rounded-t-3xl h-[92vh] flex flex-col shadow-2xl transition-transform animate-in slide-in-from-bottom-full ${sheetClass}`}>
                <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                </div>
                <Content {...props} item={item} />
            </div>

            <div className="hidden lg:flex fixed inset-0 z-[160] items-center justify-center p-8 pointer-events-none">
                <div className={`w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl border pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${sheetClass}`}>
                    <Content {...props} item={item} />
                </div>
            </div>
        </>
    );
};

