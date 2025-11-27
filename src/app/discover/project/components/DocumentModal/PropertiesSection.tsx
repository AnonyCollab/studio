
import React, { useState, useRef } from 'react';
import { Users, ArrowUpRight, Plus, FileText, ArrowDownRight, ChevronDown, RotateCw, FolderTree, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { AssigneePickerModal } from './AssigneePickerModal';
import { CyclePickerModal } from './CyclePickerModal';
import { ParentPickerModal } from './ParentPickerModal';
import { TaskNode, Assignee } from '../../types';
import { INITIAL_CYCLES } from '../../constants';

interface PropertiesSectionProps {
  properties: any;
  updateProperty: (key: string, value: any) => void;
  isLight: boolean;
  tasks?: TaskNode[];
  currentTaskId?: string;
  showParentPicker?: boolean;
  setShowParentPicker?: (show: boolean) => void;
  members: Assignee[];
}

export function PropertiesSection({ 
    properties, updateProperty, isLight, tasks = [], currentTaskId = '',
    showParentPicker: controlledShowPicker, setShowParentPicker: setControlledShowPicker,
    members
}: PropertiesSectionProps) {
  const [localShowParentPicker, setLocalShowParentPicker] = useState(false);
  const [showAssigneePicker, setShowAssigneePicker] = useState(false);
  const [showCyclePicker, setShowCyclePicker] = useState(false);
  
  const showParentPicker = controlledShowPicker ?? localShowParentPicker;
  const setShowParentPicker = setControlledShowPicker ?? setLocalShowParentPicker;

  const assigneeRef = useRef<HTMLButtonElement>(null);
  const cycleRef = useRef<HTMLButtonElement>(null);
  const parentRef = useRef<HTMLButtonElement>(null);

  const labelClass = isLight ? "text-slate-400" : "text-slate-500";
  const inputClass = isLight ? "text-slate-700" : "text-slate-300";
  const emptyClass = isLight ? "text-slate-400" : "text-slate-600";
  const badgeBlocked = isLight 
    ? "bg-slate-50 border-slate-100 text-slate-600" 
    : "bg-slate-900/20 border-slate-800 text-slate-300";
  const iconColor = isLight ? "text-slate-500" : "text-slate-400";

  const getAssigneeModalPosition = () => {
    if (assigneeRef.current) {
        const rect = assigneeRef.current.getBoundingClientRect();
        return { top: rect.top, left: rect.left - 260 };
    }
    return undefined;
  };

  const getCycleModalPosition = () => {
    if (cycleRef.current) {
        const rect = cycleRef.current.getBoundingClientRect();
        return { top: rect.top, left: rect.left - 260 };
    }
    return undefined;
  };

  const getParentModalPosition = () => {
    if (parentRef.current) {
        const rect = parentRef.current.getBoundingClientRect();
        return { top: rect.top, left: rect.left - 310 };
    }
    return undefined;
  };

  const currentAssignee = members.find(a => a.displayName === properties.assign) || members.find(a => a.displayName === 'Unassigned');
  const currentCycle = INITIAL_CYCLES.find(c => c.id === properties.cycleId);
  
  const parentTask = properties.parentId ? tasks.find(t => t.id === properties.parentId) : null;

  const getAncestryPath = (startParentId: string | undefined | null): TaskNode[] => {
      const path: TaskNode[] = [];
      let currentId = startParentId;
      const visited = new Set<string>();

      while (currentId) {
          if (visited.has(currentId)) break; 
          visited.add(currentId);

          const parent = tasks.find(t => t.id === currentId);
          if (!parent) break;

          path.unshift(parent);
          currentId = parent.parentId;
      }
      return path;
  };

  const ancestryPath = getAncestryPath(properties.parentId);
  const isMilestone = properties.type === 'Milestone';

  const prevTasks = (properties.prev || []).map((id: string) => tasks.find(t => t.id === id)?.title || id);
  const nextTasks = (properties.next || []).map((id: string) => tasks.find(t => t.id === id)?.title || id);

  return (
    <div>
      <h3 className={`mb-6 uppercase text-xs font-bold tracking-wider ${labelClass}`}>Properties</h3>
      
      <div className="space-y-6">
        {!isMilestone && (
            <div className="flex flex-col gap-2 relative">
            <div className={`flex items-center gap-2 ${labelClass}`}>
                <Users className="w-4 h-4" />
                <span className="text-sm">Assignee</span>
            </div>
            <button 
                ref={assigneeRef}
                onClick={() => setShowAssigneePicker(true)}
                className={`flex items-center gap-2 pl-6 w-full text-left hover:opacity-80 transition-opacity`}
            >
                <div className={`w-6 h-6 ${currentAssignee?.type === 'team' ? 'rounded-md' : 'rounded-full'} ${currentAssignee?.color} flex items-center justify-center text-xs text-white font-bold shadow-sm`}>
                {currentAssignee?.initials}
                </div>
                <span className={`text-sm flex-1 ${inputClass}`}>{currentAssignee?.displayName || properties.assign}</span>
                <ChevronDown size={14} className={labelClass} />
            </button>

            {showAssigneePicker && (
                <AssigneePickerModal 
                    currentAssignee={properties.assign}
                    onClose={() => setShowAssigneePicker(false)}
                    onSelect={(displayName) => {
                        updateProperty('assign', displayName);
                        setShowAssigneePicker(false);
                    }}
                    position={window.innerWidth >= 1024 ? getAssigneeModalPosition() : undefined}
                    isLight={isLight}
                    members={members}
                />
            )}
            </div>
        )}

        {!isMilestone && (
            <div className="flex flex-col gap-2 relative">
            <div className={`flex items-center gap-2 ${labelClass}`}>
                <FolderTree className="w-4 h-4" />
                <span className="text-sm">Parent</span>
            </div>
            <button 
                ref={parentRef}
                onClick={() => setShowParentPicker(true)}
                className={`flex items-center gap-2 pl-6 w-full text-left hover:opacity-80 transition-opacity`}
            >
                <div className="flex-1 min-w-0">
                    <div className={`text-sm truncate ${parentTask ? inputClass : emptyClass}`}>
                        {parentTask ? parentTask.title : 'No Parent (Root)'}
                    </div>
                    {ancestryPath.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 overflow-hidden">
                            {ancestryPath.map((node, idx) => (
                                <React.Fragment key={node.id}>
                                    <span className={`text-[9px] uppercase tracking-wider ${textClassMap(node.type)}`}>
                                        {node.type}
                                    </span>
                                    {idx < ancestryPath.length && <ChevronRight size={10} className={labelClass} />}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
                <ChevronDown size={14} className={labelClass} />
            </button>

            {showParentPicker && (
                <ParentPickerModal 
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    onClose={() => setShowParentPicker(false)}
                    onSelect={(parentId) => {
                        updateProperty('parentId', parentId);
                        setShowParentPicker(false);
                    }}
                    position={window.innerWidth >= 1024 ? getParentModalPosition() : undefined}
                    isLight={isLight}
                />
            )}
            </div>
        )}

        {!isMilestone && (
            <div className="flex flex-col gap-2 relative">
            <div className={`flex items-center gap-2 ${labelClass}`}>
                <RotateCw className="w-4 h-4" />
                <span className="text-sm">Cycle</span>
            </div>
            <button 
                ref={cycleRef}
                onClick={() => setShowCyclePicker(true)}
                className={`flex items-center gap-2 pl-6 w-full text-left hover:opacity-80 transition-opacity`}
            >
                <span className={`text-sm flex-1 ${currentCycle ? inputClass : emptyClass}`}>
                    {currentCycle ? currentCycle.name : 'No Cycle'}
                </span>
                <ChevronDown size={14} className={labelClass} />
            </button>

            {showCyclePicker && (
                <CyclePickerModal 
                    currentCycleId={properties.cycleId}
                    onClose={() => setShowCyclePicker(false)}
                    onSelect={(id) => {
                        updateProperty('cycleId', id);
                        setShowCyclePicker(false);
                    }}
                    position={window.innerWidth >= 1024 ? getCycleModalPosition() : undefined}
                    isLight={isLight}
                />
            )}
            </div>
        )}

        {!isMilestone && (
            <>
                <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 ${labelClass}`}>
                    <ArrowDownRight className="w-4 h-4" />
                    <span className="text-sm">Previous Tasks</span>
                </div>
                <div className="space-y-2 pl-6">
                    {prevTasks.length === 0 && <span className={`text-xs italic ${emptyClass}`}>None</span>}
                    {prevTasks.map((item: string, idx: number) => (
                    <div key={idx} className={`flex items-center gap-2 p-1.5 rounded border ${badgeBlocked}`}>
                        <FileText className={`w-3 h-3 ${iconColor}`} />
                        <span className="text-xs font-medium truncate">{item}</span>
                    </div>
                    ))}
                </div>
                </div>

                <div className="flex flex-col gap-2">
                <div className={`flex items-center gap-2 ${labelClass}`}>
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm">Next Tasks</span>
                </div>
                <div className="space-y-2 pl-6">
                    {nextTasks.length === 0 && <span className={`text-xs italic ${emptyClass}`}>None</span>}
                    {nextTasks.map((item: string, idx: number) => (
                    <div key={idx} className={`flex items-center gap-2 p-1.5 rounded border ${badgeBlocked}`}>
                        <FileText className={`w-3 h-3 ${iconColor}`} />
                        <span className="text-xs font-medium truncate">{item}</span>
                    </div>
                    ))}
                </div>
                </div>
            </>
        )}

        <button className={`flex items-center gap-2 text-sm mt-4 transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-500 hover:text-slate-300'}`}>
          <Plus className="w-4 h-4" />
          <span>Add a property</span>
        </button>
      </div>
    </div>
  );
}

const textClassMap = (type: string) => {
    switch(type) {
        case 'Milestone': return 'text-red-500';
        case 'Goal': return 'text-purple-500';
        case 'Epic': return 'text-emerald-500';
        case 'Story': return 'text-blue-500';
        default: return 'text-slate-500';
    }
}
