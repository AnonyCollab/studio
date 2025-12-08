
import React, { useState, useMemo } from 'react';
import { X, Minimize2, MoreHorizontal, ArrowRight, Sparkles, ChevronDown, FileText, ArrowUpRight, ArrowDownRight, Layers, Plus, Clock, Link as LinkIcon, History, MessageCircle, Maximize2, Columns } from 'lucide-react';
import { motion } from 'framer-motion';
import { DocumentHeader } from './DocumentHeader';
import { PropertiesSection } from './PropertiesSection';
import { ContentEditor } from './ContentEditor';
import { CommentsSection } from './CommentsSection';
import { ChecklistSection } from './ChecklistSection';
import { ResourcePickerModal } from './ResourcePickerModal';
import { breakDownTask } from '@/ai/flows/breakDownTaskFlow';
import type { TaskNode, Theme, Attachment, CurrentUser, TaskType, FileItem, Status, Priority } from '../../types';
import { StatusBadge } from '../Plan';
import { useStore } from '../../store/useStore.tsx';
import { FilePreview } from '../FilePreview';
import { SideTaskPickerModal } from './SideTaskPickerModal';
import { cn } from '@/lib/utils';

interface DocumentModalProps {
  task: TaskNode;
  tasks?: TaskNode[];
  currentUser?: CurrentUser;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<TaskNode>) => void;
  onUpdateTaskConnections: (startId: string, endId: string) => void;
  onAddSubTask: (task: Partial<TaskNode>) => void;
  theme: Theme;
  projectId: string | null;
  isSideView?: boolean;
  isFullScreen?: boolean;
  setIsFullScreen?: (isFullScreen: boolean) => void;
  selectSideResource?: (file: FileItem) => void;
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

const getFileIcon = (type?: string) => {
    if (!type) return <FileText size={16} />;
    if (type.startsWith('image/')) return <FileText size={16} />;
    if (type.startsWith('video/')) return <FileText size={16} />;
    if (type.includes('zip') || type.includes('archive')) return <FileText size={16} />;
    if (type.includes('pdf')) return <FileText size={16} />;
    return <FileText size={16} />;
};

const STATUS_VALUES: Status[] = ['Backlog', 'In Progress', 'Review', 'Done'];
const PRIORITY_VALUES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];


export const DocumentModal: React.FC<DocumentModalProps> = ({ 
  task: initialTask, 
  tasks: allTasks = [], 
  currentUser, 
  onClose, 
  onUpdate, 
  onUpdateTaskConnections, 
  onAddSubTask, 
  theme, 
  projectId, 
  isSideView = false,
  isFullScreen: isExternalFullScreen = false,
  setIsFullScreen: setExternalFullScreen,
  selectSideResource
}) => {
  const { members, files, selectSideTask, closeSideResource } = useStore();
  const [aiLoading, setAiLoading] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [showSideTaskPicker, setShowSideTaskPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');
  
  const isFullScreen = setExternalFullScreen !== undefined ? isExternalFullScreen : false;
  const setIsFullScreen = setExternalFullScreen !== undefined ? setExternalFullScreen : () => {};

  const task = allTasks.find(t => t.id === initialTask.id) || initialTask;


  if (!task) return null;

  const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
  const isMilestone = task.type === 'Milestone';

  const canEdit = currentUser && (
      currentUser.role === 'Owner' || 
      currentUser.role === 'Coordinator' || 
      (currentUser.role === 'Team Lead' && task.assignee.type === 'team') || 
      (currentUser.role === 'Member' && task.assignee.name === currentUser.displayName) ||
      (currentUser.role === 'Member' && task.assignee.displayName === 'Unassigned')
  );

  const isReadOnly = false; // !canEdit; (Temporarily disabled for debugging)

  const handleUpdateProperty = (key: string, value: any) => {
    if (isReadOnly) {
      console.log(`DEBUG: Update blocked for key "${key}". Reason: User is in read-only mode.`);
      return;
    }
    
    if (key === 'assignee') {
        console.log(`DEBUG: Attempting to assign task. Received displayName: "${value}"`);
        const fullAssignee = members.find(a => a.displayName === value);
        
        if (fullAssignee) {
            console.log('DEBUG: Found matching assignee object:', fullAssignee);
            onUpdate(task.id, { assignee: fullAssignee });
        } else {
            console.error(`DEBUG: CRITICAL - Could not find assignee with displayName "${value}" in the members list.`, { allMembers: members });
        }
        return; 
    }

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
  };

  const handleResourceSelect = (file: Partial<Attachment>) => {
      if (isReadOnly) return;
      const newAttachment: Attachment = {
          id: file.id || `RES-${Math.random()}`,
          name: file.name || 'Unknown File',
          type: file.type || 'file'
      };
      onUpdate(task.id, { attachments: [...(task.attachments || []), newAttachment] });
      setShowResourcePicker(false);
  };
  
    const handleDetachResource = (resourceId: string) => {
        if (!task) return;
        const updatedAttachments = (task.attachments || []).filter(att => att.id !== resourceId);
        onUpdate(task.id, { attachments: updatedAttachments });

        // If we close the currently viewed resource, close the side panel too
        const { sideSelectedResource } = useStore.getState();
        if (sideSelectedResource?.id === resourceId) {
            closeSideResource();
        }
    };


  const properties = {
      status: task.status,
      priority: task.priority,
      size: task.size || 'M',
      dateStart: task.startDate,
      dateEnd: task.dueDate,
      assign: task.assignee.displayName,
      cycleId: task.cycleId,
      parentId: task.parentId,
      type: task.type,
      next: task.next || [],
      prev: task.prev || []
  };

  const handleAIAction = async () => {
      if (isReadOnly) return;
      setAiLoading(true);
      const subtasks = await breakDownTask({taskTitle: task.title, taskDescription: task.description});
      
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

  const parentTask = task.parentId ? allTasks.find(t => t.id === task.parentId) : null;
  const prevTasks = (task.prev || []).map(id => allTasks.find(t => t.id === id)).filter(Boolean) as TaskNode[];
  const subTasks = allTasks.filter(t => task.childrenIds?.includes(t.id));

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
          const children = allTasks.filter(t => task.childrenIds?.includes(t.id));
          const hasInvalidChild = children.some(child => {
              const childLevel = HIERARCHY[child.type];
              return childLevel <= newLevel;
          });
          if (hasInvalidChild) return false;
      }

      return true;
  });

  const containerClass = isLight ? "bg-white" : "bg-[#18181b]";
  const sidebarClass = isLight ? "bg-slate-50/50 border-slate-200" : "bg-[#09090b] border-white/10";
  const textMuted = isLight ? "text-slate-400" : "text-slate-500";
  const textMain = isLight ? "text-slate-900" : "text-slate-200";
  const iconHover = isLight ? "hover:bg-black/5 text-slate-400 hover:text-black" : "hover:bg-white/10 text-slate-500 hover:text-white";
  const borderClass = isLight ? "border-slate-100" : "border-white/5";
  const badgeBlocked = isLight ? "bg-slate-50 border-slate-100 text-slate-600" : "bg-slate-900/20 border-slate-800 text-slate-300";

  const renderResources = () => (
    <div className="space-y-2">
      {(task.attachments || []).map(att => {
        const file = files.find(f => f.id === att.id || f.name === att.name);
        return (
            <button 
                key={att.id} 
                onClick={() => file && selectSideResource?.(file)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isLight ? 'bg-slate-50 border-slate-100 hover:bg-slate-100' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
            >
                <div className={`p-2 bg-brand-500/10 rounded text-brand-500`}>
                    {getFileIcon(file?.fileType)}
                </div>
                <span className={`text-sm font-medium flex-1 ${textMain}`}>{att.name}</span>
            </button>
        )
      })}
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
  
  const getStatusColorClass = (status: string) => {
    switch (status as Status) {
        case 'Done': return 'text-emerald-400';
        case 'In Progress': return 'text-blue-400';
        case 'Review': return 'text-orange-400';
        default: return 'text-slate-400';
    }
  };

  const getPriorityColorClass = (priority: string) => {
      switch (priority as Priority) {
          case 'Critical': return 'text-red-500';
          case 'High': return 'text-orange-400';
          case 'Medium': return 'text-blue-400';
          default: return 'text-slate-400';
      }
  };

  const renderActivityText = (action: string) => {
    const parts = action.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
        if (index % 2 !== 0) { // Text between **
            if (STATUS_VALUES.includes(part as Status)) {
                return <strong key={index} className={getStatusColorClass(part)}>{part}</strong>;
            }
            if (PRIORITY_VALUES.includes(part as Priority)) {
                return <strong key={index} className={getPriorityColorClass(part)}>{part}</strong>;
            }
            if (members.some(m => m.displayName === part)) {
                return <strong key={index} className="text-purple-400 cursor-pointer hover:underline">{part}</strong>;
            }
            return <strong key={index}>{part}</strong>;
        }
        return part;
    });
  };

  const renderActivity = () => (
      <div className="space-y-4 pl-2">
        {(task.history || []).slice().reverse().map(h => (
            <div key={h.id} className="relative flex items-start gap-4">
                <div className="absolute left-[5px] top-4 -bottom-4 w-0.5 bg-white/5" />
                <div className="relative z-10 mt-1">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                </div>
                <div>
                    <p className={`text-sm ${textMain}`}>
                        <strong className="text-purple-400 cursor-pointer hover:underline">{h.user}</strong> {renderActivityText(h.action)}
                    </p>
                    <p className={`text-sm opacity-70 ${textMuted}`}>{new Date(h.date).toLocaleString()}</p>
                </div>
            </div>
        ))}
        {(task.history || []).length === 0 && <div className={`text-xs italic ${textMuted}`}>No activity yet.</div>}
    </div>
  );
  
 const renderCommentAndActivityTabs = () => {
    const tabs = [
        { id: 'comments', label: 'Comments', icon: MessageCircle },
        { id: 'activity', label: 'Activity', icon: History }
    ];

    return (
        <div className="w-full">
            <div className="flex border-b border-white/5 gap-6">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                         <div key={tab.id} className="relative">
                             <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-1 py-3 text-sm font-medium transition-colors
                                    ${isActive
                                        ? 'text-blue-400'
                                        : (isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                                    }
                                `}
                            >
                                <Icon size={14} className={isActive ? 'text-blue-400' : ''} /> {tab.label}
                            </button>
                             {isActive && (
                                <motion.div
                                    layoutId="underline"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                                />
                             )}
                         </div>
                    );
                })}
            </div>

            <div className="mt-6">
                {activeTab === 'comments' && (
                    <CommentsSection
                        taskId={task.id}
                        isLight={isLight}
                        theme={theme}
                        projectId={projectId}
                    />
                )}
                {activeTab === 'activity' && (
                     <div className="px-2">{renderActivity()}</div>
                )}
            </div>
        </div>
    );
};


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
        <div 
            className={cn(
                "w-full h-full flex flex-col overflow-hidden border transition-all duration-300",
                containerClass,
                isFullScreen && !isSideView ? "lg:rounded-none" : "lg:rounded-xl",
                isSideView ? "lg:rounded-l-none lg:rounded-r-none" : "",
                !isSideView && "lg:rounded-r-none"
              )}
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
                             <button onClick={() => setShowSideTaskPicker(true)} className={`p-2 rounded transition-colors ${iconHover}`} title="Side by Side View">
                                <Columns size={18} />
                              </button>
                              <button onClick={() => setIsFullScreen && setIsFullScreen(!isFullScreen)} className={`p-2 rounded transition-colors ${iconHover}`}>
                                  {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                              </button>
                          {!isReadOnly && <button className={`p-2 rounded transition-colors ${iconHover}`}><MoreHorizontal size={18}/></button>}
                          <button onClick={onClose} className={`p-2 rounded transition-colors ${iconHover}`}><X size={18}/></button>
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
                                members={members}
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
                                    theme={theme}
                                    collaborationId={task.id}
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
                        
                        <div className={`mt-12 border-t pt-8 ${borderClass}`}>
                             <h3 className={`mb-4 uppercase text-xs font-bold tracking-wider flex items-center gap-2 ${textMuted}`}>
                                <LinkIcon size={14} /> Attached Resources
                            </h3>
                            {renderResources()}
                        </div>
                        
                        <div className={`mt-12 pt-8 pb-24 lg:pb-0`}>
                           {renderCommentAndActivityTabs()}
                        </div>
                    </div>

                    <div className="lg:hidden flex-1 flex flex-col">
                        <MobileSection title="General" isLight={isLight} defaultOpen={true}>
                            <div className={isReadOnly ? 'pointer-events-none' : ''}>
                                <ContentEditor 
                                    content={task.description}
                                    setContent={(c) => onUpdate(task.id, { description: c })}
                                    isLight={isLight}
                                    theme={theme}
                                    collaborationId={task.id}
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

                        <MobileSection title="Comments & Activity" isLight={isLight}>
                            {renderCommentAndActivityTabs()}
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
        
        {showSideTaskPicker && (
            <SideTaskPickerModal
                tasks={allTasks}
                currentTaskId={task.id}
                onClose={() => setShowSideTaskPicker(false)}
                onSelectTask={(id) => {
                    selectSideTask(id);
                    setShowSideTaskPicker(false);
                }}
                onSelectResource={(file) => {
                    if (selectSideResource) selectSideResource(file);
                    setShowSideTaskPicker(false);
                }}
                isLight={isLight}
            />
        )}
    </>
  );
};
