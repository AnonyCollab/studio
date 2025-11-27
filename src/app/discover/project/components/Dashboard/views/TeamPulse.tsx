
'use client';
import React, { useMemo } from 'react';
import { TaskNode } from '../../../types';
import { StatusBadge, PriorityIcon } from '../../Plan';
import { TrendingUp, Users, AlertCircle, Briefcase } from 'lucide-react';
import { useStore } from '../../../store/useStore';

export const TeamPulseView = () => {
    const { currentUser, tasks, theme, members } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const currentTeamName = currentUser.teamName || '';
    const teamMemberDisplayNames = useMemo(() => {
        if (!members) return [];
        return members.filter(m => m.department === currentTeamName).map(m => m.displayName);
    }, [members, currentTeamName]);

    const teamTasks = useMemo(() => {
        if (!currentTeamName || !tasks || !members) return [];
        return tasks.filter(t => 
            (t.assignee && t.assignee.displayName === currentTeamName) ||
            (t.assignee && teamMemberDisplayNames.includes(t.assignee.displayName))
        );
    }, [tasks, members, currentTeamName, teamMemberDisplayNames]);

    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const cardClass = isLight ? "bg-white/80 border-black/5 shadow-sm hover:shadow-md" : "bg-[#18181b]/60 border-white/5 shadow-sm hover:bg-[#18181b]/80";
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    
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

    const statusData = {
        'Backlog': teamTasks.filter(t => t.status === 'Backlog').length,
        'In Progress': teamTasks.filter(t => t.status === 'In Progress').length,
        'Review': teamTasks.filter(t => t.status === 'Review').length,
        'Done': teamTasks.filter(t => t.status === 'Done').length,
    };

    const workload = teamMemberDisplayNames.map(displayName => ({
        displayName,
        count: teamTasks.filter(t => t.assignee.displayName === displayName && t.status !== 'Done').length,
        initials: (members.find(m => m.displayName === displayName)?.initials) || '?'
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            </div>
        </div>
    );
};
