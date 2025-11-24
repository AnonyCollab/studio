
import React, { useMemo, useState } from 'react';
import { TaskNode, Theme, MembersViewMode, Assignee } from '../types';
import { Mail, MoreHorizontal, Trophy, Briefcase, ExternalLink, Crown } from 'lucide-react';
import { DepartmentSheet } from './DepartmentSheet';

interface MembersProps {
    tasks: TaskNode[];
    theme: Theme;
    viewMode: MembersViewMode;
    members: Assignee[];
}

export const Members: React.FC<MembersProps> = ({ tasks, theme, viewMode, members }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [selectedTeam, setSelectedTeam] = useState<Assignee | null>(null);
    
    // Stats calculation
    const getStats = (name: string) => {
        const userTasks = tasks.filter(t => t.assignee.name === name);
        return {
            total: userTasks.length,
            done: userTasks.filter(t => t.status === 'Done').length,
            inProgress: userTasks.filter(t => t.status === 'In Progress').length
        };
    };

    const allMembers = members;
    
    // Mock Logic for separation (using initials for demo reliability)
    const projectCoordinators = allMembers.filter(m => ['AC', 'SJ'].includes(m.initials) || m.name.includes('Owner') || m.name.includes('Manager'));
    const teamCoordinators = allMembers.filter(m => m.initials === 'MR' || m.name.includes('Lead'));
    const otherMembers = allMembers.filter(m => 
        !projectCoordinators.includes(m) && !teamCoordinators.includes(m) && m.type === 'user'
    );
    const teams = allMembers.filter(m => m.type === 'team');

    // Helper to get detailed team info for the modal
    const getTeamDetails = (teamName: string) => {
        if (teamName === 'Frontend Team') {
            return {
                lead: allMembers.find(m => m.initials === 'MR'), // Mike Ross
                members: allMembers.filter(m => ['AC', 'SJ'].includes(m.initials)), // Mock members
                tasks: tasks.filter(t => t.assignee.name === teamName || t.assignee.name === 'Mike Ross')
            };
        } else if (teamName === 'Design Team') {
            return {
                lead: allMembers.find(m => m.initials === 'SJ'), // Sarah Jones
                members: [],
                tasks: tasks.filter(t => t.assignee.name === teamName || t.assignee.name === 'Sarah Jones')
            };
        } else {
            return {
                lead: undefined,
                members: [],
                tasks: tasks.filter(t => t.assignee.name === teamName)
            };
        }
    };

    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight ? "bg-white/80 border-black/5 hover:border-brand-500/50" : "bg-[#18181b]/80 border-white/5 hover:border-brand-500/50";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const tableHeaderBg = isLight ? "bg-black/5 text-slate-600" : "bg-white/5 text-slate-400";
    const tableRowBorder = isLight ? "border-black/5 hover:bg-black/5" : "border-white/5 hover:bg-white/5";

    const MemberCard: React.FC<{ member: Assignee; role: string }> = ({ member, role }) => {
        const stats = getStats(member.name);
        return (
            <div className={`p-6 rounded-2xl border shadow-lg backdrop-blur-sm transition-all group ${cardClass}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {member.initials}
                    </div>
                    <div className="flex gap-2">
                        <span className="p-1 rounded bg-brand-500/20 text-brand-500">
                            <Crown size={16} />
                        </span>
                    </div>
                </div>
                
                <h3 className={`text-lg font-bold mb-1 ${textMain}`}>{member.name}</h3>
                <p className={`text-xs font-medium mb-4 ${textMuted}`}>{role}</p>
                
                <div className={`grid grid-cols-3 gap-2 py-3 border-t border-b mb-4 ${isLight ? 'border-black/5' : 'border-white/5'}`}>
                    <div className="text-center">
                        <div className={`text-xs font-bold ${textMain}`}>{stats.total}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Tasks</div>
                    </div>
                    <div className="text-center border-l border-r border-dashed border-slate-700/20">
                        <div className="text-xs font-bold text-emerald-500">{stats.done}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Done</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs font-bold text-blue-500">{stats.inProgress}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Active</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-slate-300'}`}>
                        <Mail size={14} /> Message
                    </button>
                </div>
            </div>
        );
    }

    const teamDetails = selectedTeam ? getTeamDetails(selectedTeam.name) : { lead: undefined, members: [], tasks: [] };

    return (
        <>
            <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${textMain}`}>{viewMode === 'All' ? 'Directory' : viewMode}</h1>
                        <p className={textMuted}>Manage your team structure and roles.</p>
                    </div>

                    {/* Section 1: Project Coordinators (Cards) */}
                    {(viewMode === 'All' || viewMode === 'Coordinators') && (
                        <div className="mb-12">
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${textMuted}`}>
                                <Trophy size={16} className="text-yellow-500" />
                                Project Coordinators
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projectCoordinators.map(m => (
                                    <MemberCard key={m.name} member={m} role="Project Owner" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 2: Team Coordinators (Cards) */}
                    {(viewMode === 'All' || viewMode === 'Team Members') && (
                        <div className="mb-12">
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${textMuted}`}>
                                <Briefcase size={16} className="text-blue-500" />
                                My Team Leads
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {teamCoordinators.map(m => (
                                    <MemberCard key={m.name} member={m} role="Team Lead" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 3: Other Members (List) */}
                    {(viewMode === 'All' || viewMode === 'Team Members') && (
                        <div className="mb-12">
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Team Members</h2>
                            <div className={`rounded-xl border overflow-hidden ${containerClass}`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className={tableHeaderBg}>
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Role</th>
                                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-center">Tasks</th>
                                                <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {otherMembers.map(member => {
                                                const stats = getStats(member.name);
                                                return (
                                                    <tr key={member.name} className={`transition-colors ${tableRowBorder}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xs`}>
                                                                    {member.initials}
                                                                </div>
                                                                <span className={`font-bold text-sm ${textMain}`}>{member.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 hidden md:table-cell">
                                                            <span className={`text-xs ${textMuted}`}>Contributor</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-xs font-mono font-bold ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'} px-2 py-1 rounded`}>
                                                                {stats.total}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className={`p-2 rounded hover:bg-white/10 ${textMuted}`}>
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Section 4: Teams (Cards) */}
                    {(viewMode === 'All' || viewMode === 'Teams') && (
                        <div>
                            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Departments</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {teams.map(team => (
                                    <div 
                                        key={team.name} 
                                        onClick={() => setSelectedTeam(team)}
                                        className={`p-6 rounded-2xl border shadow-lg backdrop-blur-sm flex items-center justify-between cursor-pointer active:scale-[0.98] ${cardClass}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg ${team.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                                {team.initials}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold ${textMain}`}>{team.name}</h3>
                                                <p className={`text-xs ${textMuted}`}>{getStats(team.name).total} Active Tasks</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DepartmentSheet 
                team={selectedTeam}
                members={teamDetails.members}
                lead={teamDetails.lead}
                tasks={teamDetails.tasks}
                isOpen={!!selectedTeam}
                onClose={() => setSelectedTeam(null)}
                theme={theme}
            />
        </>
    );
};