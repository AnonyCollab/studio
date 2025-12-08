
'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, FileText, Folder } from 'lucide-react';
import { TaskNode, FileItem } from '../../types';
import { StatusBadge } from '../Plan';
import { useStore } from '../../store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFileIcon } from './ResourcePickerModal';

interface SideTaskPickerModalProps {
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onSelectResource: (resourceId: string) => void;
  tasks: TaskNode[];
  currentTaskId: string;
  isLight: boolean;
}

export function SideTaskPickerModal({ onClose, onSelectTask, onSelectResource, tasks, currentTaskId, isLight }: SideTaskPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { files } = useStore();

  const containerClass = isLight ? "bg-white border-slate-200 shadow-xl" : "bg-[#1e1e1e] border-gray-700 shadow-xl";
  const itemHover = isLight ? "hover:bg-slate-100" : "hover:bg-[#2a2a2a]";
  const textMain = isLight ? "text-slate-700" : "text-gray-300";
  const textMuted = isLight ? "text-slate-400" : "text-slate-500";
  const inputClass = isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-slate-200";

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.id !== currentTaskId) // Exclude the currently open task
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, currentTaskId, searchQuery]);
  
  const filteredResources = useMemo(() => {
    return (files || [])
      .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [files, searchQuery]);

  return (
    <>
      <div className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        className={`fixed inset-x-4 bottom-4 top-20 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-2xl z-[140] w-auto md:w-[600px] h-auto md:h-[70vh] border flex flex-col overflow-hidden ${containerClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h3 className={`font-bold ${textMain}`}>Select Item to View</h3>
            <button onClick={onClose} className={`p-1.5 rounded-full ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <X size={20} />
            </button>
        </div>
        
        <Tabs defaultValue="tasks" className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-white/5">
              <TabsList className={`grid w-full grid-cols-2 ${isLight ? 'bg-slate-100' : 'bg-black/20'}`}>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
               <div className="relative mt-4">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} size={16} />
                <Input 
                    autoFocus
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 text-sm rounded-lg outline-none border transition-all ${inputClass}`}
                />
            </div>
          </div>
          <TabsContent value="tasks" className="flex-1 overflow-y-auto custom-scrollbar m-0">
              <div className="p-2 space-y-1">
                {filteredTasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => onSelectTask(task.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg text-left ${itemHover}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>
                            <FileText size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${textMain}`}>{task.title}</div>
                            <div className={`text-[10px] font-mono opacity-60 ${textMuted}`}>{task.id}</div>
                        </div>
                        <StatusBadge status={task.status} />
                    </button>
                ))}
                {filteredTasks.length === 0 && (
                    <div className={`text-center py-8 text-sm ${textMuted}`}>No tasks found.</div>
                )}
              </div>
          </TabsContent>
          <TabsContent value="resources" className="flex-1 overflow-y-auto custom-scrollbar m-0">
              <div className="p-2 space-y-1">
                {filteredResources.map(file => (
                    <button
                        key={file.id}
                        onClick={() => onSelectResource(file.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 transition-colors rounded-lg text-left ${itemHover}`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${isLight ? 'bg-slate-100 text-slate-500' : 'bg-white/5 text-slate-400'}`}>
                            {getFileIcon(file.type, 16)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${textMain}`}>{file.name}</div>
                            <div className={`text-[10px] opacity-60 ${textMuted}`}>{file.type}</div>
                        </div>
                    </button>
                ))}
                {filteredResources.length === 0 && (
                    <div className={`text-center py-8 text-sm ${textMuted}`}>No resources found.</div>
                )}
              </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
