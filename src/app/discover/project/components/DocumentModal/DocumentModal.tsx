
import React, { useState } from 'react';
import { X, Minimize2, MoreHorizontal, ArrowRight, Sparkles, ChevronDown, FileText, ArrowUpRight, ArrowDownRight, Layers, Plus, Clock, Link, History } from 'lucide-react';
import { DocumentHeader } from './DocumentHeader';
import { PropertiesSection } from './PropertiesSection';
import { ContentEditor } from './ContentEditor';
import { CommentsSection } from './CommentsSection';
import { ChecklistSection } from './ChecklistSection';
import { ResourcePickerModal } from './ResourcePickerModal';
import { breakDownTask } from '../../services/geminiService';
import { TaskNode, Theme, Attachment, CurrentUser, TaskType } from '../../types';
import { MOCK_ASSIGNEES } from '../../constants';
import { StatusBadge } from '../Plan';

interface DocumentModalProps {
  task: TaskNode;
  tasks?: TaskNode[];
  currentUser?: CurrentUser;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TaskNode>) => void;
  onAddSubTask: (task: Partial<TaskNode>) => void;
  theme: Theme;
}

const MobileSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean, isLight: boolean }> = ({ title, children, defaultOpen = false, isLight }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const borderClass = isLight ? "border-slate-100" : "border-white/5";
    
    return (
        <div className={`border-b ${borderClass}`}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between py-4 text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}
            >
                {title}
                <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="pb-6 animate-in slide-in-from-top-2 fade-in duration-200">{children}</div>}
        </div>
    );
};

const HIERARCHY: Record<TaskType, number> = {
    'Milestone': 0,
    'Goal': 1,
    'Epic': 2,
    'Story': 3,
    'Issue': 4,
    'Sub-issue': 5,
    'Gateway': 6
};

export const DocumentModal: React.FC<DocumentModalProps> = ({ task, tasks = [], currentUser, onClose, onUpdate, onAddSubTask, theme }) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [showParentPicker, setShowParentPicker] = useState(false);

  if (!task) return null;

  const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
  const isMilestone = task.type === 'Milestone';

  const canEdit = currentUser && (
      currentUser.role === 'Owner' || 
      currentUser.role === 'Coordinator' || 
      (currentUser.role === 'Team Lead' && task.assignee.type === 'team') || 
      (currentUser.role === 'Member' && task.assignee.name === currentUser.name) ||
      (currentUser.role === 'Member' && task.assignee.name === 'Unassigned')
  );

  const isReadOnly = !canEdit;

  const handleUpdateProperty = (key: string, value: any) => {
    if (isReadOnly) return;
    if (key === 'status') onUpdate(task.id, { status: value });
    if (key === 'priority') onUpdate(task.id, { priority: value });
    if (key === 'dateStart') onUpdate(task.id, { startDate: value });
    if (key === 'dateEnd') onUpdate(task.id, { dueDate: value });
    if (key === 'size') onUpdate(task.id, { size: value } as any);
    if (key === 'cycleId') onUpdate(task.id, { cycleId: value });
    if (key === 'parentId') onUpdate(task.id, { parentId: value }); 
    
    if (key === 'type') {
        onUpdate(task.id, { type: value });
        if ((value === 'Issue' || value === 'Sub-issue') && !task.parentId) {
            setShowParentPicker(true);
        }
    }

    if (key === 'assign') {
        const fullAssignee = MOCK_ASSIGNEES.find(a => a.name === value);
        if (fullAssignee) {
            onUpdate(task.id, { assignee: fullAssignee });
        }
    }
  };

  const handleResourceSelect = (file: Partial<Attachment>) => {
      if (isReadOnly) return;
      const newAttachment: Attachment = {
          id: file.id || `RES-${Math.random()}`,
          name: file.name || 'Unknown File',
          type: file.type || 'File'
      };
      onUpdate(task.id, { attachments: [...(task.attachments || []), newAttachment] });
      setShowResourcePicker(false);
  };

  const properties = {
      status: task.status,
      priority: task.priority,
      size: task.size || 'M',
      dateStart: task.startDate,
      dateEnd: task.dueDate,
      assign: task.assignee.name,
      cycleId: task.cycleId,
      parentId: task.parentId,
      type: task.type,
      next: task.next || [],
      prev: task.prev || []
  };

  const handleAIAction = async () => {
      if (isReadOnly) return;
      setAiLoading(true);
      const subtasks = await breakDownTask(task.title, task.description);
      
      subtasks.forEach((st, idx) => {
          onAddSubTask({
              title: st.title,
              description: st.description,
              priority: st.priority,
              status: 'Backlog',
              type: 'Issue',
              position: { x: task.position.x + 320, y: task.position.y + (idx * 140) },
              prev: [task.id],
              parentId: task.id,
          });
      });
      setAiLoading(false);
  };

  const parentTask = task.parentId ? tasks.find(t => t.id === task.parentId) : null;
  const prevTasks = (task.prev || []).map(id => tasks.find(t => t.id === id)).filter(Boolean) as TaskNode[];
  const subTasks = tasks.filter(t => task.childrenIds?.includes(t.id));

  // --- Hierarchy Logic ---
  const allowedTypes = (Object.keys(HIERARCHY) as TaskType[]).filter(newType => {
      const newLevel = HIERARCHY[newType];
      
      if (task.parentId) {
          if (parentTask) {
              const parentLevel = HIERARCHY[parentTask.type];
              if (newLevel <= parentLevel) return false;
          }
      } else {
          if (newLevel > 2) return false;
      }

      if (task.childrenIds && task.childrenIds.length > 0) {
          const children = tasks.filter(t => task.childrenIds?.includes(t.id));
          const hasInvalidChild = children.some(child => {
              const childLevel = HIERARCHY[child.type];
              return childLevel <= newLevel;
          });
          if (hasInvalidChild) return false;
      }

      return true;
  });

  const overlayClass = isLight ? "bg-black/40" : "bg-black/70";
  const containerClass = isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#18181b] border-white/10 shadow-2xl";
  const sidebarClass = isLight ? "bg-slate-50/50 border-slate-200" : "bg-[#09090b] border-white/10";
  const textMuted = isLight ? "text-slate-400" : "text-slate-500";
  const textMain = isLight ? "text-slate-900" : "text-slate-200";
  const iconHover = isLight ? "hover:bg-black/5 text-slate-400 hover:text-black" : "hover:bg-white/10 text-slate-500 hover:text-white";
  const borderClass = isLight ? "border-slate-100" : "border-white/5";
  const badgeBlocked = isLight ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-slate-900/20 border-slate-800 text-slate-300";

  const renderResources = () => (
      <div className="space-y-2">
        {(task.attachments || []).map(att => (
            <div key={att.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                <div className="p-2 bg-brand-500/20 rounded text-brand-500"><FileText size={16} /></div>
                <span className={`text-sm font-medium flex-1 ${textMain}`}>{att.name}</span>
            </div>
        ))}
        {!isReadOnly && (
            <button 
                onClick={() => setShowResourcePicker(true)}
                className={`w-full py-2 border border-dashed rounded-lg text-xs font-bold ${textMuted} hover:bg-white/5`}
            >
                + Link Resource
            </button>
        )}
    </div>
  );

  const renderActivity = () => (
      <div className="space-y-3 pl-2 border-l border-dashed border-white/10">
        {(task.history || []).slice(0, 5).map(h => (
            <div key={h.id} className="relative">
                <div className="absolute -left-[13px] top-1.5 w-2 h-2 rounded-full bg-slate-500" />
                <p className={`text-xs ${textMain}`}>
                    <span className="font-bold">{h.user}</span> {h.action}
                </p>
                <p className={`text-[10px] opacity-50 ${textMuted}`}>{new Date(h.date).toLocaleString()}</p>
            </div>
        ))}
        {(task.history || []).length === 0 && <div className={`text-xs italic ${textMuted}`}>No activity yet.</div>}
    </div>
  );

  const getSubtasksLabel = () => {
      if (task.type === 'Milestone') return 'Goals';
      if (task.type === 'Goal') return 'Epics';
      if (task.type === 'Epic') return 'Stories';
      if (task.type === 'Story') return 'Issues';
      if (task.type === 'Issue') return 'Sub-issues';
      return 'Subtasks';
  }

  const getChildType = (parentType: TaskType): TaskType => {
      switch(parentType) {
          case 'Milestone': return 'Goal';
          case 'Goal': return 'Epic';
          case 'Epic': return 'Story';
          case 'Story': return 'Issue';
          case 'Issue': return 'Sub-issue';
          default: return 'Issue';
      }
  };

  return (
    <>
        <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm p-0 lg:p-8 ${overlayClass}`} onClick={onClose}>
        <div 
            className={`w-full max-w-6xl h-full lg:h-[90vh] rounded-none lg:rounded-2xl flex flex-col lg:flex-row overflow-hidden border transition-colors duration-300 ${containerClass}`}
            onClick={e => e.stopPropagation()}
        >
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative">
                
                <div className="flex lg:hidden items-center justify-between p-4 border-b border-transparent">
                    <div className="flex items-center gap-2 opacity-50">
                        <span className="text-xs font-bold uppercase tracking-wider">Task Details</span>
                        {isReadOnly && <span className="px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] rounded font-bold">READ ONLY</span>}
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full bg-black/5 transition-colors ${iconHover}`}>
                            <X size={20} />
                        </button>
                </div>

                <div className="p-4 lg:p-12 max-w-4xl mx-auto w-full flex flex-col flex-1">
                    <div className="hidden lg:flex items-center justify-between mb-6 lg:mb-8">
                        <div className={`flex items-center text-xs lg:text-sm gap-2 ${textMuted}`}>
                            <span>Roadmap</span>
                            <ArrowRight size={12} />
                            <span>{task.type || 'Issue'}s</span>
                            <ArrowRight size={12} />
                            <span className={`truncate max-w-[150px] lg:max-w-none ${textMain}`}>{task.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {isReadOnly && <span className="px-3 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded border border-red-500/20">View Only</span>}
                            {!isReadOnly && (
                                <button 
                                    onClick={handleAIAction}
                                    disabled={aiLoading}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                                >
                                    <Sparkles size={14} />
                                    {aiLoading ? 'Generating...' : 'AI Breakdown'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mb-6 lg:mb-0 pointer-events-auto">
                        <div className={isReadOnly ? 'pointer-events-none opacity-90' : ''}>
                            <DocumentHeader 
                                title={task.title} 
                                setTitle={(t) => !isReadOnly && onUpdate(task.id, { title: t })}
                                properties={properties}
                                updateProperty={handleUpdateProperty}
                                isLight={isLight}
                                allowedTypes={allowedTypes}
                            />
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className={`mt-12 border-t pt-8 ${borderClass}`}>
                            <div className={isReadOnly ? 'pointer-events-none' : ''}>
                                <ContentEditor 
                                    content={task.description}
                                    setContent={(c) => onUpdate(task.id, { description: c })}
                                    isLight={isLight}
                                />
                            </div>
                        </div>

                        {/* Checklist - Only for Sub-issues */}
                        {task.type === 'Sub-issue' && (
                            <div className={`mt-8 border-t pt-8 ${borderClass}`}>
                                <ChecklistSection 
                                    checklist={task.checklist || []}
                                    onUpdate={(cl) => onUpdate(task.id, { checklist: cl })}
                                    theme={theme}
                                    isReadOnly={isReadOnly}
                                />
                            </div>
                        )}
                        
                        {/* Activity & Resources Tabs */}
                        <div className={`mt-12 border-t pt-8 pb-24 lg:pb-0 ${borderClass}`}>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h3 className={`mb-4 uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${textMuted}`}>
                                        <Link size={14} /> Attached Resources
                                    </h3>
                                    {renderResources()}
                                </div>
                                <div>
                                    <h3 className={`mb-4 uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${textMuted}`}>
                                        <History size={14} /> Activity Log
                                    </h3>
                                    {renderActivity()}
                                </div>
                            </div>
                        </div>

                        <div className={`mt-12 border-t pt-8 pb-24 lg:pb-0 ${borderClass}`}>
                            <CommentsSection 
                                comments={task.comments || []} 
                                addComment={(c) => {
                                    if(currentUser?.role === 'Visitor') return;
                                    const currentComments = task.comments || [];
                                    onUpdate(task.id, { comments: [...currentComments, c] } as any);
                                }}
                                isLight={isLight}
                            />
                        </div>
                    </div>

                    <div className="lg:hidden flex-1 flex flex-col">
                        <MobileSection title="General" isLight={isLight} defaultOpen={true}>
                            <div className={isReadOnly ? 'pointer-events-none' : ''}>
                                <ContentEditor 
                                    content={task.description}
                                    setContent={(c) => onUpdate(task.id, { description: c })}
                                    isLight={isLight}
                                />
                            </div>
                        </MobileSection>

                        {task.type === 'Sub-issue' && (
                            <MobileSection title="Checklist" isLight={isLight} defaultOpen={true}>
                                <ChecklistSection 
                                    checklist={task.checklist || []}
                                    onUpdate={(cl) => onUpdate(task.id, { checklist: cl })}
                                    theme={theme}
                                    isReadOnly={isReadOnly}
                                />
                            </MobileSection>
                        )}
                        
                        <MobileSection title="Resources" isLight={isLight}>
                            {renderResources()}
                        </MobileSection>

                        <MobileSection title="Activity" isLight={isLight}>
                            {renderActivity()}
                        </MobileSection>

                        {!isMilestone && (
                            <MobileSection title="Standing" isLight={isLight}>
                                <div className="space-y-4">
                                    <div>
                                        <div className={`text-xs font-bold uppercase mb-2 flex items-center gap-2 ${textMuted}`}>
                                            <ArrowDownRight size={14} /> Previous Tasks
                                        </div>
                                        {prevTasks.length === 0 && <div className="text-sm opacity-50 italic pl-6">None</div>}
                                        <div className="space-y-2 pl-2">
                                            {prevTasks.map(t => (
                                                <div key={t.id} className={`flex items-center gap-2 p-2 rounded border text-sm ${badgeBlocked}`}>
                                                    <FileText size={14} />
                                                    <span className="font-medium line-clamp-1">{t.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </MobileSection>
                        )}

                        <MobileSection title="Comments" isLight={isLight}>
                            <CommentsSection 
                                comments={task.comments || []} 
                                addComment={(c) => {
                                    if(currentUser?.role === 'Visitor') return;
                                    const currentComments = task.comments || [];
                                    onUpdate(task.id, { comments: [...currentComments, c] } as any);
                                }}
                                isLight={isLight}
                            />
                        </MobileSection>
                    </div>
                </div>
            </div>

            {/* Desktop Right Sidebar */}
            <div className={`hidden lg:flex w-80 border-l p-6 flex-col flex-shrink-0 overflow-y-auto custom-scrollbar h-full ${sidebarClass}`}>
                <div className="flex items-center justify-end gap-2 mb-8">
                    <div className="flex items-center gap-2">
                        <button className={`p-2 rounded transition-colors ${iconHover}`}><Minimize2 size={18}/></button>
                        {!isReadOnly && <button className={`p-2 rounded transition-colors ${iconHover}`}><MoreHorizontal size={18}/></button>}
                        <button onClick={onClose} className={`p-2 rounded transition-colors ${iconHover}`}><X size={18}/></button>
                    </div>
                </div>
                
                <div className={isReadOnly ? 'pointer-events-none opacity-80' : ''}>
                    <PropertiesSection 
                        properties={properties}
                        updateProperty={handleUpdateProperty}
                        isLight={isLight}
                        tasks={tasks} 
                        currentTaskId={task.id}
                        showParentPicker={showParentPicker}
                        setShowParentPicker={setShowParentPicker}
                    />
                </div>

                {/* Subtasks Section */}
                <div className="mt-8">
                    <h3 className={`mb-4 uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${textMuted}`}>
                        <Layers size={14} />
                        {getSubtasksLabel()}
                    </h3>
                    {subTasks.length > 0 && (
                        <div className="mb-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-brand-500 transition-all duration-500" 
                                style={{ width: `${(subTasks.filter(t => t.status === 'Done').length / subTasks.length) * 100}%` }} 
                            />
                        </div>
                    )}
                    <div className="space-y-2">
                        {subTasks.length === 0 && (
                            <div className={`text-xs italic pl-6 ${textMuted}`}>No subtasks yet</div>
                        )}
                        {subTasks.map(sub => (
                            <div key={sub.id} className={`p-3 rounded-xl border transition-all group cursor-pointer hover:border-brand-500/30 ${isLight ? 'bg-slate-50 border-slate-100 hover:bg-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-mono ${textMuted}`}>{sub.id}</span>
                                    <StatusBadge status={sub.status} />
                                </div>
                                <div className={`text-sm font-medium leading-tight line-clamp-2 ${textMain}`}>{sub.title}</div>
                            </div>
                        ))}
                        {!isReadOnly && (
                            <button 
                                onClick={() => onAddSubTask({ 
                                    parentId: task.id, 
                                    title: 'New Task',
                                    type: getChildType(task.type), 
                                    position: { x: task.position.x + 50, y: task.position.y + 50 } 
                                })}
                                className={`w-full py-2 mt-2 rounded-lg border border-dashed text-xs font-bold flex items-center justify-center gap-2 transition-colors ${isLight ? 'border-slate-300 text-slate-500 hover:bg-slate-50' : 'border-white/20 text-slate-400 hover:bg-white/5'}`}
                            >
                                <Plus size={14} /> Add {getSubtasksLabel().slice(0, -1)}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>

        {/* Resource Picker Integration */}
        {showResourcePicker && !isReadOnly && (
            <ResourcePickerModal 
                onClose={() => setShowResourcePicker(false)}
                onSelect={handleResourceSelect}
                isLight={isLight}
            />
        )}
    </>
  );
};
