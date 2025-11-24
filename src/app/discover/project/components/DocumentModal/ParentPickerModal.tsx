
import React, { useState, useMemo } from 'react';
import { X, Search, FileText, CornerUpLeft } from 'lucide-react';
import { TaskNode } from '../../types';

interface ParentPickerModalProps {
  onClose: () => void;
  onSelect: (parentId: string | null) => void;
  tasks: TaskNode[];
  currentTaskId: string;
  position?: { top: number; left: number };
  isLight: boolean;
}

export function ParentPickerModal({ onClose, onSelect, tasks, currentTaskId, position, isLight }: ParentPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const textMuted = isLight ? "text-slate-400" : "text-slate-500";
  const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#18181b] text-white";
  const inputClass = isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-slate-200";

  const validParents = useMemo(() => {
      return tasks.filter(t => {
          // 1. Can't be self
          if (t.id === currentTaskId) return false;
          
          // 2. Can't be a descendant (prevent circular dependency)
          // Check if 't' is a child/descendant of 'currentTask'
          const currentTask = tasks.find(x => x.id === currentTaskId);
          if (currentTask && currentTask.childrenIds) {
             const stack = [...(currentTask.childrenIds || [])];
             const visited = new Set<string>(stack); // Track visited to prevent infinite loops if cycles exist
             
             while (stack.length > 0) {
                 const id = stack.pop()!;
                 if (id === t.id) return false; // Found target in descendants
                 
                 const child = tasks.find(c => c.id === id);
                 if (child && child.childrenIds) {
                     for(const cid of child.childrenIds) {
                         if(!visited.has(cid)) {
                             visited.add(cid);
                             stack.push(cid);
                         }
                     }
                 }
             }
          }
          
          return true;
      }).filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, currentTaskId, searchQuery]);

  const renderList = () => (
    <div className="flex flex-col h-full">
        <div className="p-2 border-b border-white/5">
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={14} />
                <input 
                    autoFocus
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none border transition-all ${inputClass}`}
                />
            </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <button
                onClick={() => onSelect(null)}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg text-left ${itemHover}`}
            >
                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-brand-500 bg-brand-500/10`}>
                    <CornerUpLeft size={16} />
                </div>
                <div>
                    <div className={`text-sm font-bold ${textMain}`}>No Parent</div>
                    <div className={`text-xs ${textMuted}`}>Move to root level</div>
                </div>
            </button>
            
            {validParents.length === 0 && (
                <div className={`text-center py-8 text-xs ${textMuted}`}>No valid parents found.</div>
            )}

            {validParents.map(task => (
                <button
                    key={task.id}
                    onClick={() => onSelect(task.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg text-left ${itemHover}`}
                >
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>
                        <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                        <div className={`text-sm font-medium truncate ${textMain}`}>{task.title}</div>
                        <div className={`text-[10px] font-mono opacity-60 ${textMuted}`}>{task.id}</div>
                    </div>
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 z-[130] bg-black/40 lg:bg-transparent" onClick={onClose} />
      
      {/* Desktop Popover */}
      <div 
        className={`hidden lg:block fixed rounded-lg z-[140] w-[300px] h-[400px] border flex flex-col overflow-hidden ${containerClass}`}
        style={position ? { top: position.top, left: position.left } : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {renderList()}
      </div>

      {/* Mobile Bottom Sheet */}
      <div className={`lg:hidden fixed inset-x-0 bottom-0 z-[150] rounded-t-2xl h-[70vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300 ${mobileSheetClass}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-bold">Select Parent Task</h2>
                <button onClick={onClose} className="p-2 rounded-full bg-white/10"><X size={20} /></button>
            </div>
            {renderList()}
      </div>
    </>
  );
}
