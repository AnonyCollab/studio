
'use client';
import React, { useMemo } from 'react';
import { TaskNode } from '../../../types';
import { CheckCircle2, AlertTriangle, Layers, Users, Crown } from 'lucide-react';
import { useStore } from '../../../store/useStore';

export const ProjectOverviewView = () => {
    const { tasks, theme, members } = useStore();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const projectTasks = tasks;

    const getCompletionRate = (taskList: TaskNode[]) => {
        if (taskList.length === 0) return 0;
        const done = taskList.filter(t => t.status === 'Done').length;
        return Math.round((done / taskList.length) * 100);
    };

    const getCriticalCount = (taskList: TaskNode[]) => taskList.filter(t => t.priority === 'Critical' && t.status !== 'Done').length;

    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const cardClass = isLight ? "bg-white/80 border-black/5 shadow-sm hover:shadow-md" : "bg-[#18181b]/60 border-white/5 shadow-sm hover:bg-[#18181b]/80";
    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    
    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${cardClass}`}>
            <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${textMuted}`}>{label}</p>
                <h3 className={`text-3xl font-bold ${textMain}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon size={24} />
            </div>
        </div>
    );

    const DistributionChart = ({ data, title, type = 'priority' }: { data: any, title: string, type?: 'priority' }) => {
        const total = Object.values(data).reduce((a: any, b: any) => a + b, 0) as number;
        return (
            <div className={`p-6 rounded-2xl border flex flex-col ${containerClass} backdrop-blur-xl shadow-xl`}>
                <h3 className={`text-lg font-bold mb-4 ${textMain}`}>{title}</h3>
                <div className="flex-1 flex items-end gap-3 px-2 h-[250px]">
                    {Object.entries(data).map(([key, value]: any) => {
                        const height = total > 0 ? (value / total) * 100 : 0;
                        let color = 'bg-slate-500';
                        if (key === 'Critical') color = 'bg-rose-500';
                        else if (key === 'High') color = 'bg-orange-500';
                        else if (key === 'Medium') color = 'bg-blue-500';
                        
                        return (
                            <div key={key} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                <div className={`text-lg font-bold ${textMain} transition-opacity`}>{value}</div>
                                <div className="w-full bg-slate-800/10 rounded-t-md relative overflow-hidden group-hover:bg-slate-800/20 transition-colors h-full flex items-end">
                                    <div
                                        className={`w-full rounded-t-md transition-all duration-1000 ${color} opacity-80 group-hover:opacity-100`}
                                        style={{ height: `${Math.max(height, 5)}%` }}
                                    />
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 truncate w-full text-center">{key}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

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
