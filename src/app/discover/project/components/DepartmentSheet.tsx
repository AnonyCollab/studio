
import React, { useState, useMemo } from 'react';
import { X, Users, Trophy, Briefcase, MoreHorizontal, Crown, Mail, Activity, Layout, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Assignee, TaskNode, Theme, HistoryEntry } from '../types';
import { StatusBadge, PriorityIcon } from './Plan';

interface DepartmentSheetProps {
    team: Assignee | null;
    members: Assignee[]; // Members of this team
    lead?: Assignee; // Team lead
    tasks: TaskNode[]; // Tasks assigned to this team context
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
}

type Tab = 'Overview' | 'Members' | 'Work' | 'Activity';

export const DepartmentSheet: React.FC<DepartmentSheetProps> = ({ 
    team, members, lead, tasks, isOpen, onClose, theme 
}) => {
    if (!isOpen || !team) return null;

    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    
    // Styles
    const overlayClass = isLight ? "bg-black/20 backdrop-blur-sm" : "bg-black/60 backdrop-blur-sm";
    const sheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white border-white/10";
    const cardClass = isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const textMain = isLight ? "text-slate-900" : "text-white";
    const borderClass = isLight ? "border-slate-100" : "border-white/5";

    // Derived Data
    const stats = {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'Done').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        blocked: tasks.filter(t => t.priority === 'Critical').length
    };

    const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

    const teamActivity = useMemo(() => {
        const entries: (HistoryEntry & { taskTitle: string })[] = [];
        tasks.forEach(t => {
            if (t.history) {
                t.history.forEach(h => {
                    entries.push({ ...h, taskTitle: t.title });
                });
            }
        });
        return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [tasks]);

    const Backdrop = () => (
        <div className={`fixed inset-0 z-[150] ${overlayClass} animate-in fade-in duration-300`} onClick={onClose} />
    );

    const Content = () => (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between px-6 py-6 border-b flex-shrink-0 gap-4 ${borderClass}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl ${team.color} flex items-center justify-center text-white font-bold text-2xl shadow-xl`}>
                        {team.initials}
                    </div>
                    <div>
                        <h2 className={`text-3xl font-bold ${textMain}`}>{team.name}</h2>
                        <div className={`flex items-center gap-3 mt-1 text-sm ${textMuted}`}>
                            <span className="flex items-center gap-1"><Users size={14} /> {members.length + (lead ? 1 : 0)} Members</span>
                            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {stats.total} Projects</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                     <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className={`px-6 pt-2 border-b flex gap-6 overflow-x-auto ${borderClass}`}>
                {['Overview', 'Members', 'Work', 'Activity'].map(tab => (
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
                        {/* Stats Grid */}
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
                                {lead && (
                                    <div className={`p-4 mb-4 rounded-xl border flex items-center gap-4 ${cardClass} border-brand-500/30 relative overflow-hidden`}>
                                        <div className="absolute top-0 right-0 p-1.5 bg-brand-500 rounded-bl-lg text-white">
                                            <Crown size={12} />
                                        </div>
                                        <div className={`w-12 h-12 rounded-full ${lead.color} flex items-center justify-center text-white font-bold text-lg`}>
                                            {lead.initials}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${textMain}`}>{lead.name}</div>
                                            <div className={`text-xs ${textMuted}`}>Team Lead</div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    {members.slice(0, 5).map(m => (
                                        <div key={m.name} className="flex items-center gap-3 p-2">
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
                            {[...(lead ? [lead] : []), ...members].map(member => {
                                const memberTasks = tasks.filter(t => t.assignee.name === member.name && t.status === 'In Progress');
                                return (
                                    <div key={member.name} className={`p-5 rounded-2xl border flex flex-col gap-4 ${cardClass} ${lead?.name === member.name ? 'border-brand-500/40' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xl shadow-md`}>
                                                {member.initials}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg ${textMain}`}>{member.name}</h4>
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${lead?.name === member.name ? 'bg-brand-500/20 text-brand-500' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400')}`}>
                                                    {lead?.name === member.name ? 'Team Lead' : 'Member'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={`pt-4 border-t ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                                            <span className={`text-xs font-bold uppercase tracking-wider block mb-2 ${textMuted}`}>Working On</span>
                                            {memberTasks.length > 0 ? (
                                                <div className="space-y-2">
                                                    {memberTasks.slice(0, 2).map(t => (
                                                        <div key={t.id} className={`flex items-center gap-2 text-sm truncate ${textMain}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${t.priority === 'Critical' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                                            <span className="truncate">{t.title}</span>
                                                        </div>
                                                    ))}
                                                    {memberTasks.length > 2 && <div className={`text-xs ${textMuted}`}>+ {memberTasks.length - 2} more</div>}
                                                </div>
                                            ) : (
                                                <span className={`text-xs italic ${textMuted}`}>No active tasks</span>
                                            )}
                                        </div>
                                        
                                        <button className={`mt-auto w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>
                                            <Mail size={14} /> Message
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {activeTab === 'Work' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                        {['In Progress', 'Review', 'Backlog', 'Done'].map(status => {
                            const statusTasks = tasks.filter(t => t.status === status);
                            if (statusTasks.length === 0) return null;
                            
                            return (
                                <div key={status}>
                                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${textMuted}`}>
                                        <span className={`w-2 h-2 rounded-full ${status === 'In Progress' ? 'bg-blue-500' : status === 'Done' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                        {status} <span className="opacity-50">({statusTasks.length})</span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {statusTasks.map(task => (
                                            <div key={task.id} className={`p-4 rounded-xl border group hover:border-brand-500/30 transition-all ${cardClass}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-mono ${textMuted}`}>{task.id}</span>
                                                    <PriorityIcon priority={task.priority} />
                                                </div>
                                                <h4 className={`font-bold text-sm mb-3 ${textMain}`}>{task.title}</h4>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-6 h-6 rounded-full ${task.assignee.color} flex items-center justify-center text-[10px] text-white font-bold`}>
                                                            {task.assignee.initials}
                                                        </div>
                                                        <span className={`text-xs ${textMuted}`}>{task.assignee.name}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-mono ${textMuted}`}>{task.dueDate}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'Activity' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="space-y-6 relative pl-4 border-l border-dashed border-slate-700/30">
                            {teamActivity.map((entry, idx) => (
                                <div key={`${entry.id}-${idx}`} className="relative pl-6">
                                    <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${isLight ? 'bg-white border-slate-300' : 'bg-[#18181b] border-slate-700'}`} />
                                    <div className={`p-4 rounded-xl border ${cardClass}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-xs font-bold ${textMuted}`}>{new Date(entry.date).toLocaleString()}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${isLight ? 'bg-black/5' : 'bg-white/10'}`}>{entry.type}</span>
                                        </div>
                                        <p className={`text-sm ${textMain}`}>
                                            <span className="font-bold text-brand-500">{entry.user}</span> {entry.action}
                                        </p>
                                        <div className={`mt-2 text-xs p-2 rounded flex items-center gap-2 ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/5 text-slate-400'}`}>
                                            <Briefcase size={12} />
                                            <span className="font-medium truncate">{entry.taskTitle}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {teamActivity.length === 0 && (
                                <div className={`py-12 text-center italic ${textMuted}`}>No activity recorded for this team yet.</div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );

    return (
        <>
            <Backdrop />
            
            {/* Mobile Bottom Sheet */}
            <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[160] rounded-t-3xl h-[92vh] flex flex-col shadow-2xl transition-transform animate-in slide-in-from-bottom-full ${sheetClass}`}>
                <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                </div>
                <Content />
            </div>

            {/* Desktop Full Screen Modal */}
            <div className="hidden lg:flex fixed inset-0 z-[160] items-center justify-center p-8 pointer-events-none">
                <div className={`w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl border pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 ${sheetClass}`}>
                    <Content />
                </div>
            </div>
        </>
    );
};
