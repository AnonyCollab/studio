
import React, { useState } from 'react';
import { TaskNode, Status, Theme } from '../../types';
import { PriorityIcon } from '../Plan';
import { Layers } from 'lucide-react';

interface KanbanViewProps {
    tasks: TaskNode[];
    selectedTaskId: string | null;
    onSelect: (id: string) => void;
    onUpdateTask: (id: string, updates: Partial<TaskNode>) => void;
    theme: Theme;
    isReadOnly?: boolean;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ tasks, selectedTaskId, onSelect, onUpdateTask, theme, isReadOnly }) => {
    const columns: Status[] = ['Backlog', 'In Progress', 'Review', 'Done'];
    const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);

    const [dragOverColumn, setDragOverColumn] = useState<Status | null>(null);

    // Filter out items that HAVE a parentId from the top level view to keep it clean.
    const visibleTasks = tasks.filter(t => !t.parentId);

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        if (isReadOnly) return;
        e.dataTransfer.setData('text/plain', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, status: Status) => {
        if (isReadOnly) return;
        e.preventDefault();
        setDragOverColumn(status);
    };

    const handleDragLeave = () => {
        setDragOverColumn(null);
    };

    const handleDrop = (e: React.DragEvent, status: Status) => {
        if (isReadOnly) return;
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onUpdateTask(taskId, { status });
        }
        setDragOverColumn(null);
    };

    const columnClass = isLight 
        ? "bg-white/60 border-black/5 shadow-xl backdrop-blur-xl" 
        : "bg-black/40 border-white/10 shadow-xl backdrop-blur-xl";
    
    const headerBorderClass = isLight ? "border-black/5" : "border-white/5";
    const titleClass = isLight ? "text-slate-700" : "text-slate-200";
    
    const cardClass = isLight 
        ? "bg-white/90 border-black/5 shadow-sm hover:shadow-md text-slate-700" 
        : "bg-[#18181b]/90 border-white/5 shadow-sm hover:shadow-md text-slate-200";
    
    const cardBorderClass = (taskId: string) => {
        if (selectedTaskId === taskId) return "border-brand-500 ring-1 ring-brand-500/30";
        return isLight ? "border-slate-200 hover:border-brand-400/50" : "border-slate-700 hover:border-brand-400/50";
    };

    return (
        <div className="w-full h-full p-1 md:p-2 overflow-x-auto">
            <div className="flex gap-2 md:gap-6 h-full pb-4 min-w-max">
                {columns.map(status => (
                    <div 
                        key={status} 
                        className={`
                            flex-1 rounded-xl md:rounded-2xl border flex flex-col transition-colors duration-200 w-[85vw] md:w-[280px] md:min-w-[280px]
                            ${columnClass}
                            ${dragOverColumn === status ? (isLight ? 'bg-brand-500/10 ring-2 ring-brand-400' : 'bg-brand-500/20 ring-2 ring-brand-500') : ''}
                        `}
                        onDragOver={(e) => handleDragOver(e, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status)}
                    >
                        <div className={`p-3 md:p-4 border-b ${headerBorderClass} flex justify-between items-center flex-shrink-0`}>
                            <h3 className={`font-bold text-xs md:text-sm uppercase tracking-wide ${titleClass}`}>{status}</h3>
                            <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full font-bold ${isLight ? 'bg-black/5 text-black' : 'bg-white/10 text-white'}`}>
                                {visibleTasks.filter(t => t.status === status).length}
                            </span>
                        </div>

                        <div className="p-2 md:p-3 space-y-2 md:space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {visibleTasks.filter(t => t.status === status).map(task => {
                                const subtaskCount = task.childrenIds?.length || 0;
                                const completedSubtasks = task.childrenIds ? tasks.filter(t => task.childrenIds?.includes(t.id) && t.status === 'Done').length : 0;

                                return (
                                    <div 
                                        key={task.id} 
                                        draggable={!isReadOnly}
                                        onDragStart={(e) => handleDragStart(e, task.id)}
                                        onClick={() => onSelect(task.id)} 
                                        className={`
                                            p-3 md:p-4 rounded-lg md:rounded-xl border transition-all
                                            flex flex-col gap-2 md:gap-3 group backdrop-blur-md
                                            ${isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
                                            ${cardClass}
                                            ${cardBorderClass(task.id)}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] font-mono ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{task.id}</span>
                                            <PriorityIcon priority={task.priority} />
                                        </div>
                                        
                                        <p className="text-sm font-bold leading-snug line-clamp-2">{task.title}</p>
                                        
                                        {/* Subtask Indicator */}
                                        {subtaskCount > 0 && (
                                            <div className="flex items-center gap-2 text-[10px] font-medium opacity-60">
                                                <Layers size={12} />
                                                <span>{completedSubtasks}/{subtaskCount} subtasks</span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-1">
                                            <div className={`w-6 h-6 rounded-full ${task.assignee.color} flex items-center justify-center text-[9px] font-bold text-white ring-2 ${isLight ? 'ring-white/50' : 'ring-black/50'} shadow-sm`}>
                                                {task.assignee.initials}
                                            </div>
                                            <span className={`text-[10px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {task.dueDate}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
