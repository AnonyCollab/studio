
import React, { useMemo, useEffect } from 'react';
import { TaskNode, Theme, DashboardViewMode, CurrentUser } from '../types';
import { StatusBadge, PriorityIcon } from './Plan';
import {
    CheckCircle2, AlertTriangle, Clock, TrendingUp, Users, Layers,
    Target, Zap, AlertCircle, Briefcase, Crown
} from 'lucide-react';
import { useStore } from '../store/useStore.tsx';

interface DashboardProps {
}

export const Dashboard: React.FC<DashboardProps> = () => {
    const { currentUser: storeUser, tasks, theme, dashboardView, setDashboardView, isStoreLoading, members } = useStore();
    
    // Ensure currentUser has both name and displayName for consistency
    const currentUser = useMemo(() => ({
        ...storeUser,
        name: storeUser.displayName,
    }), [storeUser]);

    useEffect(() => {
        console.log("--- Dashboard Debug ---");
        console.log("Is Store Loading?", isStoreLoading);
        console.log("Current User:", currentUser);
        console.log("Tasks Received:", tasks);
        console.log("Members Received:", members);
        console.log("-----------------------");
    }, [currentUser, tasks, isStoreLoading, members]);
    
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    // Get current user's team name, or default if not available
    const currentTeamName = currentUser.teamName || '';

    const teamMembers = useMemo(() => {
        // For now, we consider all users to be part of the team for the 'Team Pulse' view
        return (members || [])
            .filter(m => m.type === 'user')
            .map(m => m.displayName);
    }, [members]);

    // --- Data Selectors (FIXED LOGIC) ---

    const myTasks = useMemo(() => {
        if (!currentUser) return [];
        return tasks.filter(t => t.assignee.id === currentUser.id);
    }, [tasks, currentUser]);

    const teamTasks = useMemo(() => {
        if (!currentTeamName) return [];
        const teamMemberIds = members.filter(m => m.department === currentTeamName).map(m => m.id);
        
        return tasks.filter(t => 
            t.assignee.id === currentTeamName || // Assigned to the team directly
            teamMemberIds.includes(t.assignee.id) // Assigned to a member of the team
        );
    }, [tasks, members, currentTeamName]);

    const projectTasks = tasks;

    // --- Helper Functions ---

    const getCompletionRate = (taskList: TaskNode[]) => {
        if (taskList.length === 0) return 0;
        const done = taskList.filter(t => t.status === 'Done').length;
        return Math.round((done / taskList.length) * 100);
    };

    const getCriticalCount = (taskList: TaskNode[]) => taskList.filter(t => t.priority === 'Critical' && t.status !== 'Done').length;

    const getUpcomingDeadlines = (taskList: TaskNode[]) => {
        return taskList
            .filter(t => t.status !== 'Done')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 3);
    };

    // --- Styles ---
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight
        ? "bg-white/80 border-black/5 shadow-sm hover:shadow-md"
        : "bg-[#18181b]/60 border-white/5 shadow-sm hover:bg-[#18181b]/80";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";

    // --- Widgets ---

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
                {tasks.length === 0 && (
                    <div className={`flex flex-col items-center justify-center h-full text-center opacity-50 ${textMuted}`}>
                        <CheckCircle2 size={32} className="mb-2" />
                        <p>{emptyMsg}</p>
                    </div>
                )}
                {tasks.map(t => (
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
                ))}
            </div>
        </div>
    );

    const DistributionChart = ({ data, title, type = 'status' }: { data: any, title: string, type?: 'status' | 'priority' }) => {
        const total = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
        return (
            <div className={`p-6 rounded-2xl border flex flex-col ${containerClass} backdrop-blur-xl shadow-xl`}>
                <h3 className={`text-lg font-bold mb-6 ${textMain}`}>{title}</h3>
                <div className="flex-1 flex items-end gap-3 px-2 pb-2 h-[180px]">
                    {Object.entries(data).map(([key, value]: any) => {
                        const height = total > 0 ? (value / total) * 100 : 0;
                        let color = 'bg-slate-500';
                        if (type === 'status') {
                            if (key === 'Done') color = 'bg-emerald-500';
                            if (key === 'In Progress') color = 'bg-brand-500';
                            if (key === 'Review') color = 'bg-amber-500';
                        } else {
                            if (key === 'Critical') color = 'bg-rose-500';
                            if (key === 'High') color = 'bg-orange-500';
                            if (key === 'Medium') color = 'bg-blue-500';
                        }

                        return (
                            <div key={key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                <div className={`text-xs font-bold ${textMain} opacity-0 group-hover:opacity-100 transition-opacity`}>{value}</div>
                                <div className="w-full bg-slate-800/10 rounded-t-md relative overflow-hidden group-hover:bg-slate-800/20 transition-colors h-full flex items-end">
                                    <div
                                        className={`w-full rounded-t-md transition-all duration-1000 ${color} opacity-80 group-hover:opacity-100`}
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                </div>
                                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 truncate w-full text-center">{key}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- Tab Content Renderers ---

    const renderPersonalTab = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Welcome Banner */}
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

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                    label="My Tasks"
                    value={myTasks.length}
                    icon={Target}
                    color="bg-brand-500/20 text-brand-500"
                    subtext={`${myTasks.filter(t => t.status === 'In Progress').length} in progress`}
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

            {/* Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                <TaskListWidget
                    title="Focus for Today"
                    tasks={myTasks.filter(t => t.status === 'In Progress')}
                    emptyMsg="No active tasks. Pull from backlog?"
                />
                <TaskListWidget
                    title="Up Next / Backlog"
                    tasks={myTasks.filter(t => t.status === 'Backlog')}
                    emptyMsg="You're all caught up!"
                />
                <div className={`p-6 rounded-2xl border flex flex-col ${containerClass} backdrop-blur-xl shadow-xl`}>
                    <h3 className={`text-lg font-bold mb-6 ${textMain}`}>Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                                    <Layers size={14} className={textMuted} />
                                </div>
                                <div>
                                    <p className={`text-sm ${textMain}`}>Moved <span className="font-bold">Task-{100 + i}</span> to <span className="text-brand-500">In Review</span></p>
                                    <p className={`text-xs ${textMuted}`}>2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTeamTab = () => {
        const statusData = {
            'Backlog': teamTasks.filter(t => t.status === 'Backlog').length,
            'In Progress': teamTasks.filter(t => t.status === 'In Progress').length,
            'Review': teamTasks.filter(t => t.status === 'Review').length,
            'Done': teamTasks.filter(t => t.status === 'Done').length,
        };

        const workload = teamMembers.map(member => ({
            displayName: member,
            count: teamTasks.filter(t => t.assignee.displayName === member).filter(t => t.status !== 'Done').length,
            initials: member.split(' ').map(n => n[0]).join('')
        }));

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className={`text-2xl font-bold ${textMain}`}>{currentTeamName || "Team"} Pulse</h2>
                        <p className={textMuted}>Collaborative overview and workload distribution.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        label="Active Sprint Items"
                        value={teamTasks.filter(t => t.status !== 'Done').length}
                        icon={Briefcase}
                        color="bg-blue-500/20 text-blue-500"
                    />
                    <StatCard
                        label="Blocked Items"
                        value={teamTasks.filter(t => t.priority === 'Critical').length}
                        icon={AlertCircle}
                        color="bg-rose-500/20 text-rose-500"
                        subtext="Needs attention"
                    />
                    <StatCard
                        label="Team Velocity"
                        value="12 pts"
                        icon={TrendingUp}
                        color="bg-purple-500/20 text-purple-500"
                        subtext="Avg per day"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DistributionChart data={statusData} title="Sprint Progress" />

                    <div className={`p-6 rounded-2xl border flex flex-col ${containerClass} backdrop-blur-xl shadow-xl`}>
                        <h3 className={`text-lg font-bold mb-6 ${textMain}`}>Member Workload</h3>
                        <div className="space-y-4">
                            {workload.map(m => (
                                <div key={m.displayName} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-brand-400 to-blue-600`}>
                                            {m.initials}
                                        </div>
                                        <span className={`text-sm font-bold ${textMain}`}>{m.displayName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 w-24 h-2 bg-slate-800/20 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${m.count > 5 ? 'bg-rose-500' : m.count > 2 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(m.count * 10, 100)}%` }}
                                            />
                                        </div>
                                        <span className={`text-xs font-mono ${textMuted}`}>{m.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <TaskListWidget
                        title="Team Blockers"
                        tasks={teamTasks.filter(t => t.priority === 'Critical')}
                        emptyMsg="No critical blockers."
                    />
                </div>
            </div>
        );
    };

    const renderProjectTab = () => {
        const priorityData = {
            'Critical': projectTasks.filter(t => t.priority === 'Critical').length,
            'High': projectTasks.filter(t => t.priority === 'High').length,
            'Medium': projectTasks.filter(t => t.priority === 'Medium').length,
            'Low': projectTasks.filter(t => t.priority === 'Low').length,
        };

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className={`text-2xl font-bold ${textMain}`}>Project Executive Summary</h2>
                        <p className={textMuted}>High-level metrics and timeline health.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <StatCard label="Total Scope" value={projectTasks.length} icon={Layers} color="bg-brand-500/20 text-brand-500" />
                    <StatCard label="Completion" value={`${getCompletionRate(projectTasks)}%`} icon={CheckCircle2} color="bg-emerald-500/20 text-emerald-500" />
                    <StatCard label="Total Blockers" value={getCriticalCount(projectTasks)} icon={AlertTriangle} color="bg-rose-500/20 text-rose-500" />
                    <StatCard label="Contributors" value={members.length} icon={Users} color="bg-blue-500/20 text-blue-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DistributionChart data={priorityData} title="Risk Distribution" type="priority" />

                    <div className={`p-6 rounded-2xl border flex flex-col ${containerClass} backdrop-blur-xl shadow-xl`}>
                        <h3 className={`text-lg font-bold mb-6 ${textMain}`}>Upcoming Milestones</h3>
                        <div className="space-y-0 relative">
                            <div className={`absolute left-[19px] top-2 bottom-2 w-0.5 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />
                            {projectTasks.filter(t => t.size === 'XL' || t.size === 'L').slice(0, 4).map((t, i) => (
                                <div key={t.id} className="flex gap-4 items-center relative py-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 ${isLight ? 'border-white bg-slate-100 text-slate-500' : 'border-[#18181b] bg-white/10 text-white'}`}>
                                        <Crown size={16} />
                                    </div>
                                    <div className={`flex-1 p-3 rounded-xl border ${isLight ? 'bg-white border-slate-100' : 'bg-white/5 border-white/5'}`}>
                                        <div className="flex justify-between">
                                            <h4 className={`font-bold text-sm ${textMain}`}>{t.title}</h4>
                                            <span className={`text-xs font-mono ${textMuted}`}>{t.dueDate}</span>
                                        </div>
                                        <p className={`text-xs mt-1 line-clamp-1 ${textMuted}`}>{t.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Desktop Tabs
    const tabs: { id: DashboardViewMode; label: string; icon: React.ElementType }[] = [
        { id: 'Personal', label: 'My Focus', icon: Target },
        { id: 'Team', label: 'Team Pulse', icon: Users },
        { id: 'Project', label: 'Project Overview', icon: Briefcase },
    ];

    // Show loading state while data is being fetched
    if (isStoreLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className={`text-center ${textMuted}`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                {/* Desktop Tab Switcher (Visible on lg screens) */}
                <div className="hidden lg:flex justify-center mb-4">
                    <div className={`flex p-1 rounded-xl border ${containerClass}`}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setDashboardView && setDashboardView(tab.id)}
                                className={`
                                    flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
                                    ${dashboardView === tab.id
                                        ? (isLight ? 'bg-white shadow-sm text-slate-900' : 'bg-white/10 text-white shadow-sm')
                                        : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white')}
                                `}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {dashboardView === 'Personal' && renderPersonalTab()}
                {dashboardView === 'Team' && renderTeamTab()}
                {dashboardView === 'Project' && renderProjectTab()}
            </div>
        </div>
    );
};
