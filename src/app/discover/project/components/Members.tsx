
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { TaskNode, Theme, MembersViewMode, Assignee, UserRole } from '../types';
import { Mail, MoreHorizontal, Briefcase, Crown, User, ChevronDown, ChevronUp, UserPlus, LogOut, PlusCircle, Folder, Users, Layers } from 'lucide-react';
import { DepartmentSheet } from './DepartmentSheet';
import { useStore } from '../store/useStore.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

const ROLE_HIERARCHY: UserRole[] = ['Owner', 'Co-Owner', 'Coordinator', 'Team Lead', 'Member'];

interface MembersProps {
    tasks: TaskNode[];
    theme: Theme;
    viewMode: MembersViewMode;
    members: Assignee[];
    onViewProfile: (member: Assignee) => void;
}

export const Members: React.FC<MembersProps> = ({ tasks, theme, viewMode, members: initialMembers, onViewProfile }) => {
    const { user: authUser } = useUser();
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
    
    const [drilldownHistory, setDrilldownHistory] = useState<Assignee[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    
    const { updateMember, currentUser, removeMember, addMember } = useStore();
    const { toast } = useToast();
    const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');

    useEffect(() => {
        console.log("Current user role in MembersPage:", currentUser?.role);
    }, [currentUser]);

    const allMembers = initialMembers;
    const departments = allMembers.filter(m => m.type === 'team' && !m.parentId);
    const userMembers = allMembers.filter(m => m.type === 'user');

    const getStats = (assigneeName: string) => {
        const relevantTasks = tasks.filter(t => {
            const assignee = allMembers.find(m => m.displayName === assigneeName);
            if (!assignee) return false;
            
            if (assignee.type === 'team') {
                const memberIds = allMembers.filter(m => m.department === assignee.id || m.id === assignee.id).map(m => m.displayName);
                return memberIds.includes(t.assignee.displayName);
            }
            return t.assignee.displayName === assigneeName;
        });

        const done = relevantTasks.filter(t => t.status === 'Done').length;
        return {
            total: relevantTasks.length,
            done: done,
            inProgress: relevantTasks.filter(t => t.status === 'In Progress').length,
            completionRate: relevantTasks.length > 0 ? Math.round((done / relevantTasks.length) * 100) : 0,
        };
    };

    const getSubItems = (parentId: string | null | undefined, type: 'team' | 'user') => {
        if (type === 'team') {
            return allMembers.filter(m => m.type === 'team' && m.parentId === parentId);
        }
        return allMembers.filter(m => m.type === 'user' && m.department === parentId);
    }
    
    const handleAddFriend = (member: Assignee) => {
        console.log(`Sending friend request to ${member.displayName}`);
        toast({
            title: "Friend Request Sent",
            description: `A friend request has been sent to ${member.displayName}.`,
        });
    };

    const handleKickMember = (member: Assignee) => {
        if (!removeMember) return;
        removeMember(member.id);
        toast({
            title: "Member Removed",
            description: `${member.displayName} has been removed from the project.`,
        });
    }

    const handleCreateDepartment = () => {
        if (!addMember || !newDepartmentName.trim()) {
            setIsCreatingDepartment(false);
            setNewDepartmentName('');
            return;
        }

        addMember({
            name: newDepartmentName,
            displayName: newDepartmentName,
            type: 'team',
            color: 'bg-gray-500'
        });
        toast({
            title: "Department Created",
            description: `The "${newDepartmentName}" department has been created.`
        });
        setIsCreatingDepartment(false);
        setNewDepartmentName('');
    };

    const handleDrillDown = (item: Assignee) => {
        setDrilldownHistory(prev => [...prev, item]);
    };

    const handleGoBack = () => {
        setDrilldownHistory(prev => prev.slice(0, -1));
    }
    
    const handleBulkAssign = (departmentId: string | null) => {
        const departmentName = departmentId ? allMembers.find(m => m.id === departmentId)?.displayName : undefined;
        selectedMembers.forEach(memberId => {
            updateMember(memberId, { department: departmentName });
        });
        toast({
            title: 'Members Assigned',
            description: `${selectedMembers.length} members have been assigned.`,
        });
        setSelectedMembers([]);
    };

    const currentItem = drilldownHistory.length > 0 ? drilldownHistory[drilldownHistory.length - 1] : null;


    const containerClass = isLight ? "bg-white/60 border-black/5" : "bg-black/40 border-white/10";
    const cardClass = isLight ? "bg-white/80 border-black/5 hover:border-brand-500/50" : "bg-[#18181b]/80 border-white/5 hover:border-brand-500/50";
    const textMain = isLight ? "text-slate-800" : "text-slate-100";
    const textMuted = isLight ? "text-slate-500" : "text-slate-400";
    const tableHeaderBg = isLight ? "bg-black/5 text-slate-600" : "bg-white/5 text-slate-400";
    const tableRowBorder = isLight ? "border-black/5 hover:bg-black/5" : "border-white/5 hover:bg-white/5";

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
                                        <th className="px-6 py-3 w-12">
                                           <Checkbox
                                                checked={selectedMembers.length === userMembers.length && userMembers.length > 0}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedMembers(userMembers.map(m => m.id));
                                                    } else {
                                                        setSelectedMembers([]);
                                                    }
                                                }}
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider hidden md:table-cell">Active Tasks</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider hidden sm:table-cell">Department</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                     {selectedMembers.length > 0 && (
                                        <tr className={isLight ? 'bg-blue-50' : 'bg-blue-900/20'}>
                                            <td colSpan={6} className="px-6 py-2">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm font-bold ${isLight ? 'text-blue-800' : 'text-blue-200'}`}>{selectedMembers.length} selected</span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">Assign to Team</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem onClick={() => handleBulkAssign(null)}>Unassigned</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {departments.map(dept => (
                                                                <DropdownMenuItem key={dept.id} onClick={() => handleBulkAssign(dept.id)}>
                                                                    {dept.displayName}
                                                                </DropdownMenuItem>
                                                            ))}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {userMembers.map(member => {
                                        const stats = getStats(member.displayName);
                                        const currentUserRoleIndex = ROLE_HIERARCHY.indexOf(currentUser.role);
                                        const memberRoleIndex = ROLE_HIERARCHY.indexOf(member.role || 'Member');
                                        
                                        const canManage = currentUser.role === 'Owner';
                                        const isSelf = authUser?.uid === member.uid;
                                        
                                        const canPromote = canManage && !isSelf && memberRoleIndex > 0;
                                        const canDemote = canManage && !isSelf && memberRoleIndex < ROLE_HIERARCHY.length - 1;

                                        return (
                                            <tr key={member.id} className={`transition-colors ${tableRowBorder}`}>
                                                <td className="px-6 py-4">
                                                    <Checkbox 
                                                        checked={selectedMembers.includes(member.id)}
                                                        onCheckedChange={(checked) => {
                                                            setSelectedMembers(prev => checked ? [...prev, member.id] : prev.filter(id => id !== member.id));
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 cursor-pointer" onClick={() => onViewProfile(member)}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full ${member.color || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-xs`}>
                                                            {member.initials || (member.displayName || '?').charAt(0)}
                                                        </div>
                                                        <span className={`font-bold text-sm ${textMain}`}>{member.displayName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`text-xs font-mono font-bold ${isLight ? 'bg-slate-200 text-slate-700' : 'bg-white/10 text-slate-300'} px-2 py-1 rounded`}>
                                                        {stats.inProgress}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 hidden sm:table-cell">
                                                     <span className={`text-xs font-medium px-2 py-0.5 rounded ${member.department ? 'bg-blue-500/20 text-blue-300' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400')}`}>
                                                        {member.department || 'Unassigned'}
                                                     </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                     <span className={`text-xs font-medium px-2 py-0.5 rounded ${member.role === 'Owner' ? 'bg-amber-500/20 text-amber-500' : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/10 text-slate-400')}`}>
                                                        {member.role}
                                                     </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {!isSelf && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button onClick={(e) => e.stopPropagation()} className={`p-2 rounded hover:bg-white/10 ${textMuted}`}><MoreHorizontal size={16} /></button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className={`${isLight ? 'bg-white' : 'bg-[#1e1e1e] border-white/10'}`}>
                                                                {canPromote && (
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[memberRoleIndex - 1] }); }}>
                                                                        <ChevronUp className="mr-2 h-4 w-4 text-emerald-500" />
                                                                        <span>Promote</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {canDemote && (
                                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { role: ROLE_HIERARCHY[memberRoleIndex + 1] }); }}>
                                                                        <ChevronDown className="mr-2 h-4 w-4 text-rose-500" />
                                                                        <span>Demote</span>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                 {canManage && (
                                                                    <DropdownMenuSub>
                                                                        <DropdownMenuSubTrigger>
                                                                            <Briefcase className="mr-2 h-4 w-4" />
                                                                            <span>Assign Department</span>
                                                                        </DropdownMenuSubTrigger>
                                                                        <DropdownMenuPortal>
                                                                            <DropdownMenuSubContent>
                                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateMember(member.id, { department: undefined }); }}>Unassigned</DropdownMenuItem>
                                                                                {departments.map(dept => (
                                                                                    <DropdownMenuItem key={dept.id} onClick={(e) => { e.stopPropagation(); updateMember(member.id, { department: dept.displayName }); }}>
                                                                                        {dept.displayName}
                                                                                    </DropdownMenuItem>
                                                                                ))}
                                                                            </DropdownMenuSubContent>
                                                                        </DropdownMenuPortal>
                                                                    </DropdownMenuSub>
                                                                )}
                                                                {canManage && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleKickMember(member); }} className="text-red-500"><LogOut className="mr-2 h-4 w-4"/>Kick</DropdownMenuItem>}
                                                                <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleAddFriend(member); }}>
                                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                                    <span>Add Friend</span>
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className={`text-sm font-bold uppercase tracking-wider ${textMuted}`}>Departments</h2>
                            {currentUser.role === 'Owner' && !isCreatingDepartment && (
                                <Button variant="outline" size="sm" onClick={() => setIsCreatingDepartment(true)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Department
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {departments.map(dept => {
                                const deptStats = getStats(dept.displayName);
                                const deptMembers = getSubItems(dept.displayName, 'user');
                                const subTeamsCount = getSubItems(dept.id, 'team').length;

                                return (
                                    <div 
                                        key={dept.id} 
                                        onClick={() => handleDrillDown(dept)}
                                        className={`p-6 rounded-2xl border flex flex-col gap-4 shadow-lg backdrop-blur-sm cursor-pointer active:scale-[0.98] transition-all ${cardClass}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className={`w-12 h-12 rounded-lg ${dept.color || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                                <Folder size={24}/>
                                            </div>
                                            <div className="flex -space-x-3">
                                                {deptMembers.slice(0,3).map(m => (
                                                    <div key={m.id} className={`w-8 h-8 rounded-full border-2 ${m.color} ${isLight ? 'border-white' : 'border-[#18181b]'} flex items-center justify-center text-[10px] text-white`}>
                                                        {m.initials}
                                                    </div>
                                                ))}
                                                {deptMembers.length > 3 && (
                                                     <div className={`w-8 h-8 rounded-full border-2 ${isLight ? 'border-white bg-slate-200 text-slate-600' : 'border-[#18181b] bg-white/10 text-white/70'} flex items-center justify-center text-[10px]`}>
                                                         +{deptMembers.length-3}
                                                     </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg mb-1 ${textMain}`}>{dept.displayName}</h3>
                                            <div className={`flex items-center gap-4 text-xs ${textMuted}`}>
                                                 <span className="flex items-center gap-1.5"><Users size={14}/> {deptMembers.length} Members</span>
                                                 <span className="flex items-center gap-1.5"><Layers size={14}/> {subTeamsCount} Teams</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mt-auto">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className={textMuted}>Task Completion</span>
                                                <span className={`font-bold ${textMain}`}>{deptStats.completionRate}%</span>
                                            </div>
                                            <Progress value={deptStats.completionRate} className="h-2" />
                                        </div>
                                    </div>
                                );
                            })}
                            {isCreatingDepartment && (
                                <div className={`p-4 rounded-xl border-2 border-dashed flex items-center justify-center ${isLight ? 'border-brand-300 bg-brand-50' : 'border-brand-500/50 bg-brand-500/10'}`}>
                                    <div className="flex items-center gap-4 w-full">
                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-white/50'}`}>
                                            <Folder size={24} />
                                        </div>
                                        <Input 
                                            autoFocus
                                            value={newDepartmentName}
                                            onChange={(e) => setNewDepartmentName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateDepartment();
                                                if (e.key === 'Escape') {
                                                    setNewDepartmentName('');
                                                    setIsCreatingDepartment(false);
                                                }
                                            }}
                                            onBlur={handleCreateDepartment}
                                            placeholder="New Department..."
                                            className={`h-auto p-0 bg-transparent border-0 font-bold text-lg ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${textMain} placeholder:text-slate-500`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DepartmentSheet 
                item={currentItem}
                members={currentItem ? getSubItems(currentItem.displayName, 'user') : []}
                teams={currentItem ? getSubItems(currentItem.id, 'team') : []}
                tasks={currentItem ? tasks.filter(t => t.assignee.displayName === currentItem.displayName) : []}
                isOpen={!!currentItem}
                onClose={() => setDrilldownHistory([])}
                onBack={drilldownHistory.length > 1 ? handleGoBack : undefined}
                onSelectTeam={handleDrillDown}
                onViewProfile={onViewProfile}
                theme={theme}
            />
        </>
    );
};
