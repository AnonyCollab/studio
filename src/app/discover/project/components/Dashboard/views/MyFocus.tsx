
'use client';
import React, { useMemo } from 'react';
import { TaskNode } from '../../../types';
import { StatusBadge, PriorityIcon } from '../../Plan';
import { CheckCircle2, Clock, Target, Zap } from 'lucide-react';
import { useStore } from '../../../store/useStore';

export const MyFocusView = () => {
    const { currentUser, tasks, theme } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const myTasks = useMemo(() => {
        if (!currentUser || !tasks) return [];
        return tasks.filter(t => t.assignee && (t.assignee.id === currentUser.id || t.assignee.uid === currentUser.id));
    }, [tasks, currentUser]);

    const getCompletionRate = (taskList: TaskNode[]) => {
        if (taskList.length === 0) return 0;
        const done = taskList.filter(t => t.status === 'Done').length;
        return Math.round((done / taskList.length) * 100);
    };

    const getUpcomingDeadlines = (taskList: TaskNode[]) => {
        return taskList
            .filter(t => t.status !== 'Done')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);
    };

    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const cardClass = isLight ? "bg-white/80 border-black/5 shadow-sm hover:shadow-md" : "bg-[#18181b]/60 border-white/5 shadow-sm hover:bg-[#18181b]/80";
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const tasksInProgress = myTasks.filter(t => t.status === 'In Progress');
    const tasksInBacklog = myTasks.filter(t => t.status === 'Backlog');

    const StatCard = ({ label, value, icon: Icon, color, subtext }: any) => (
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${cardClass}`}>
            <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>{label}</p>
                <h3 className={`text-3xl font-bold ${textMain}`}>{value}</h3>
                {subtext && <p className={`text-xs mt-1 ${textMuted}`}>{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const TaskListWidget = ({ title, tasks, emptyMsg }: { title: string, tasks: TaskNode[], emptyMsg: string }) => (
        <div className={`p-6 rounded-2xl border flex flex-col h-full ${containerClass} backdrop-blur-xl shadow-xl`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${textMain}`}>
                    {title}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isLight ? 'bg-black/5 text-black' : 'bg-white/10 text-white'}`}>{tasks.length}</span>
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 min-h-[200px]">
                {tasks.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center h-full text-center opacity-50 ${textMuted}`}>
                        <CheckCircle2 size={32} className="mb-2" />
                        <p>{emptyMsg}</p>
                    </div>
                ) : (
                    tasks.map(t => (
                        <div key={t.id} className={`p-3 rounded-xl border group transition-all cursor-pointer ${isLight ? 'bg-white border-slate-100 hover:border-brand-300' : 'bg-white/5 border-white/5 hover:border-brand-500/50'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-mono opacity-50 ${textMain}`}>{t.id}</span>
                                    <span className={`text-sm font-bold line-clamp-1 ${textMain}`}>{t.title}</span>
                                </div>
                                <PriorityIcon priority={t.priority} />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <StatusBadge status={t.status} />
                                <div className={`text-[10px] font-mono flex items-center gap-1 ${textMuted}`}>
                                    <Clock size={10} /> {t.dueDate}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className={`text-2xl font-bold ${textMain}`}>Good morning, {currentUser.displayName}.</h2>
                    <p className={textMuted}>You have {myTasks.filter(t => t.status !== 'Done').length} active tasks on your plate.</p>
                </div>
                <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}>
                    <Zap size={18} className="text-yellow-500" />
                    <span className={`text-sm font-bold ${textMain}`}>Productivity Score: 92%</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="My Tasks"
                    value={myTasks.length}
                    icon={Target}
                    color="bg-brand-500/20 text-brand-500"
                    subtext={`${tasksInProgress.length} in progress`}
                />
                <StatCard
                    label="Completed"
                    value={`${getCompletionRate(myTasks)}%`}
                    icon={CheckCircle2}
                    color="bg-emerald-500/20 text-emerald-500"
                    subtext="Last 30 days"
                />
                <StatCard
                    label="Approaching Deadlines"
                    value={getUpcomingDeadlines(myTasks).length}
                    icon={Clock}
                    color="bg-orange-500/20 text-orange-500"
                    subtext="Due within 48h"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <TaskListWidget
                    title="Focus for Today"
                    tasks={tasksInProgress}
                    emptyMsg="No active tasks. Pull from backlog?"
                />
                <TaskListWidget
                    title="Up Next / Backlog"
                    tasks={tasksInBacklog}
                    emptyMsg="You're all caught up!"
                />
                {/* Activity widget can be added back here if needed */}
            </div>
        </div>
    );
};
