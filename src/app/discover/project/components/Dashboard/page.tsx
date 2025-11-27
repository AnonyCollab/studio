
'use client';
import React, { useMemo } from 'react';
import { Theme, DashboardViewMode } from '../../types';
import { Target, Users, Briefcase, Zap, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore.tsx';
import { MyFocusView } from './views/MyFocus';
import { TeamPulseView } from './views/TeamPulse';
import { ProjectOverviewView } from './views/ProjectOverview';

interface DashboardProps {
}

export const Dashboard: React.FC<DashboardProps> = () => {
    const { theme, dashboardView, setDashboardView, isStoreLoading, currentUser, tasks, members } = useStore();

    console.log("--- Dashboard Debug ---");
    console.log("Is Store Loading?", isStoreLoading);
    console.log("Current User:", currentUser);
    console.log("Tasks Received:", tasks);
    console.log("Members Received:", members);
    console.log("-----------------------");


    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";

    const tabs: { id: DashboardViewMode; label: string; icon: React.ElementType }[] = [
        { id: 'Personal', label: 'My Focus', icon: Target },
        { id: 'Team', label: 'Team Pulse', icon: Users },
        { id: 'Project', label: 'Project Overview', icon: Briefcase },
    ];
    
    if (isStoreLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className={`text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

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

                {dashboardView === 'Personal' && <MyFocusView />}
                {dashboardView === 'Team' && <TeamPulseView />}
                {dashboardView === 'Project' && <ProjectOverviewView />}
            </div>
        </div>
    );
};
