
import React, { useMemo, useState } from 'react';
import { TaskNode, Theme, MembersViewMode, Assignee, UserRole } from '../types';
import { Mail, MoreHorizontal, Briefcase, Crown, User, ChevronDown, ChevronUp } from 'lucide-react';
import { DepartmentSheet } from './DepartmentSheet';
import { useStore } from '../store/useStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ROLE_HIERARCHY: UserRole[] = ['Owner', 'Co-Owner', 'Coordinator', 'Team Lead', 'Member', 'Visitor'];

interface MembersProps {
    tasks: TaskNode[];
    theme: Theme;
    viewMode: MembersViewMode;
    members: Assignee[];
    onViewProfile: (member: Assignee) => void;
}

export const Members: React.FC<MembersProps> = ({ tasks, theme, viewMode, members: initialMembers, onViewProfile }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    const [selectedTeam, setSelectedTeam] = useState<Assignee | null>(null);
    const { updateMember } = useStore();

    const allMembers = initialMembers;
    const teams = allMembers.filter(m => m.type === 'team');
    const users = allMembers.filter(m => m.type === 'user');

    const getStats = (name: string) => {
        const userTasks = tasks.filter(t => t.assignee.name === name);
        return {
            total: userTasks.length,
            done: userTasks.filter(t => t.status === 'Done').length,
            inProgress: userTasks.filter(t => t.status === 'In Progress').length
        };
    };

    const getTeamDetails = (teamName: string) => {
        return {
            lead: allMembers.find(m => m.role === 'Team Lead'),
            members: allMembers.filter(m => m.role === 'Member'),
            tasks: tasks.filter(t => t.assignee.name === teamName)
        };
    };

    const canPromote = (memberRole: UserRole, targetRole: UserRole) => {
        return ROLE_HIERARCHY.indexOf(memberRole) > ROLE_HIERARCHY.indexOf(targetRole);
    };

    const canDemote = (memberRole: UserRole, targetRole: UserRole) => {
        return ROLE_HIERARCHY.indexOf(memberRole) < ROLE_HIERARCHY.indexOf(targetRole);
    };

    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight ? "bg-white/80 border-black/5 hover:border-brand-500/50" : "bg-[#18181b]/80 border-white/5 hover:border-brand-500/50";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const tableHeaderBg = isLight ? "bg-black/5 text-slate-600" : "bg-white/5 text-slate-400";
    const tableRowBorder = isLight ? "border-black/5 hover:bg-black/5" : "border-white/5 hover:bg-white/5";

    const teamDetails = selectedTeam ? getTeamDetails(selectedTeam.name) : { lead: undefined, members: [], tasks: [] };

    return (
        <>
            <div className="w-full h-full p-4 md:p-8 overflow-y-auto custom-scrollbar pb-32 md:pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className={`text-3xl font-bold mb-2 ${textMain}`}>Members</h1>
                        <p className={textMuted}>Manage your team structure and roles.</p>
                    </div>

                    <div className={`rounded-xl border overflow-hidden ${containerClass} mb-12`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className={tableHeaderBg}>
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Active Tasks</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map(member => {
                                        const stats = getStats(member.name);
                                        const currentRoleIndex = ROLE_HIERARCHY.indexOf(member.role || 'Member');

                                        return (
                                            <tr key={member.id} onClick={() => onViewProfile(member)} className={`transition-colors cursor-pointer ${tableRowBorder}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-xs`}>
                                                            {member.initials}
                                                        </div>
                                                        <span className={`font-bold text-sm ${textMain}`}>{member.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`text-xs font-mono font-bold ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'} px-2 py-1 rounded`}>
                                                        {stats.inProgress}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
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
                                                            {currentRoleIndex > 0 && (
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[currentRoleIndex - 1] }); }}>
                                                                    <ChevronUp className="mr-2 h-4 w-4 text-emerald-500" />
                                                                    <span>Promote</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            {currentRoleIndex < ROLE_HIERARCHY.length - 2 && ( // -2 because of Visitor
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[currentRoleIndex + 1] }); }}>
                                                                    <ChevronDown className="mr-2 h-4 w-4 text-rose-500" />
                                                                    <span>Demote</span>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
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

                    <div>
                        <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textMuted}`}>Departments</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teams.map(team => (
                                <div 
                                    key={team.id} 
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
