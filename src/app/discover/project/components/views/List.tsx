
import React from 'react';
import { TaskNode, Theme } from '../../types';
import { StatusBadge, PriorityIcon } from '../Plan';
import { Clock, Briefcase } from 'lucide-react';

interface ListViewProps {
    tasks: TaskNode[];
    selectedTaskId: string | null;
    onSelect: (id: string) => void;
    theme: Theme;
}

export const ListView: React.FC<ListViewProps> = ({ tasks, selectedTaskId, onSelect, theme }) => {
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    // Common Styles
    const containerClass = isLight 
        ? "bg-white/60 border-black/5 shadow-xl backdrop-blur-xl" 
        : "bg-black/40 border-white/10 shadow-xl backdrop-blur-xl";
    
    const headerBg = isLight ? "bg-white/40" : "bg-black/20";
    const headerTextClass = isLight ? "text-slate-600" : "text-slate-400";
    const borderClass = isLight ? "border-black/5" : "border-white/5";
    const textClass = isLight ? "text-slate-700" : "text-slate-300";
    const rowHoverClass = isLight ? "hover:bg-white/50" : "hover:bg-white/5";
    const selectedClass = isLight ? "bg-brand-500/10" : "bg-brand-500/20";
    
    // Matching Mobile My Tasks Style
    const cardBg = isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-white/5";

    return (
        <div className="w-full h-full p-0 md:p-6 overflow-hidden flex flex-col">
            
            {/* DESKTOP TABLE VIEW */}
            <div className={`hidden md:block w-full h-full overflow-y-auto custom-scrollbar rounded-2xl border ${containerClass}`}>
                <table className="w-full text-left border-collapse">
                    <thead className={`sticky top-0 z-10 backdrop-blur-md ${headerBg}`}>
                        <tr className={`border-b text-xs font-bold uppercase tracking-wider ${borderClass} ${headerTextClass}`}>
                            <th className="py-4 pl-6 w-32">ID</th>
                            <th className="py-4 min-w-[200px]">Title</th>
                            <th className="py-4 w-32">Status</th>
                            <th className="py-4 w-32">Priority</th>
                            <th className="py-4 w-48">Assignee</th>
                            <th className="py-4 w-32 pr-6">Due</th>
                        </tr>
                    </thead>
                    <tbody className={`text-sm ${textClass}`}>
                        {tasks.map(task => (
                            <tr 
                                key={task.id} 
                                onClick={() => onSelect(task.id)} 
                                className={`
                                    border-b transition-colors cursor-pointer
                                    ${borderClass} 
                                    ${selectedTaskId === task.id ? selectedClass : rowHoverClass}
                                `}
                            >
                                <td className="py-3 pl-6 font-mono text-xs opacity-60">{task.id}</td>
                                <td className="py-3 font-medium pr-2">{task.title}</td>
                                <td className="py-3"><StatusBadge status={task.status} /></td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2"><PriorityIcon priority={task.priority} /> {task.priority}</div>
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full ${task.assignee.color} flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10`}>
                                            {task.assignee.initials}
                                        </div>
                                        <span className="text-xs font-medium opacity-80">{task.assignee.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 pr-6 opacity-70 font-mono text-xs">{task.dueDate}</td>
                            </tr>
                        ))}
                        {tasks.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center opacity-50 italic">
                                    No tasks found in this view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="md:hidden w-full h-full overflow-y-auto custom-scrollbar p-4 pb-32 space-y-3">
                {tasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                        <Briefcase size={32} className="opacity-50" />
                        <span className="text-sm">No tasks found.</span>
                    </div>
                )}
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        onClick={() => onSelect(task.id)} 
                        className={`p-4 rounded-2xl cursor-pointer group transition-all border shadow-sm ${cardBg} ${selectedTaskId === task.id ? 'ring-1 ring-brand-500 border-brand-500/50' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <StatusBadge status={task.status} />
                            <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 ${isLight ? 'bg-white border border-slate-200' : 'bg-white/10'}`}>
                                <PriorityIcon priority={task.priority} size={14} />
                                <span className={`text-[10px] font-bold uppercase ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>{task.priority}</span>
                            </div>
                        </div>
                        
                        <div className={`font-bold text-base mb-4 leading-snug ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {task.title}
                        </div>
                        
                        <div className={`flex items-center justify-between pt-3 border-t ${borderClass}`}>
                             <div className="flex items-center gap-2">
                                 <div className={`w-6 h-6 rounded-full ${task.assignee.color} flex items-center justify-center text-[10px] text-white font-bold shadow-sm`}>
                                     {task.assignee.initials}
                                 </div>
                                 <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{task.assignee.name}</span>
                             </div>
                             <div className={`text-[10px] font-mono flex items-center gap-1.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                                 <Clock size={12} /> 
                                 Due {task.dueDate}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
