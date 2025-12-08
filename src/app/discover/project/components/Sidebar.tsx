
import React, { useState, useRef, useMemo } from 'react';
import type { TaskNode, Theme, BackgroundType, Page, MembersViewMode, ResourcesViewMode, CommunityViewMode } from '../types';
import { ChevronRight, ChevronDown, FileText, Plus, ArrowRightCircle, Search, X, ChevronUp, Calendar as CalendarIcon, ChevronLeft, Eye, Filter, Users, Video, Image, File as FileIcon, MoreHorizontal, Copy, Trash2, Circle, ArrowLeft, CornerDownRight, Flag, Target, CheckSquare, Zap, BookOpen, Maximize2, Folder } from 'lucide-react';
import { StatusBadge } from './Plan';

interface SidebarProps {
  tasks: TaskNode[];
  selectedTaskId: string | null;
  focusedParentId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onFocus: (id: string | null) => void;
  onAddRoot: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove?: (taskId: string, newParentId: string | null) => void;
  theme: Theme;
  background: BackgroundType;
  setTheme: (t: Theme) => void;
  setBackground: (b: BackgroundType) => void;
  isOpen?: boolean;
  onClose?: () => void;
  currentPage?: Page;
  calendarDate?: Date;
  setCalendarDate?: (d: Date) => void;
  membersView?: MembersViewMode;
  setMembersView?: (mode: MembersViewMode) => void;
  resourcesView?: ResourcesViewMode;
  setResourcesView?: (mode: ResourcesViewMode) => void;
  communityView?: CommunityViewMode;
  setCommunityView?: (mode: CommunityViewMode) => void;
  isMainView?: boolean;
  resourcePath?: (string | null)[];
  setResourcePath?: (path: (string | null)[]) => void;
}

const MAX_INLINE_DEPTH = 2; 

const TaskTreeItem: React.FC<{
  taskId: string;
  allTasks: TaskNode[];
  depth: number;
  selectedTaskId: string | null;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onFocus: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove?: (taskId: string, newParentId: string | null) => void;
  onDrillDown: (id: string) => void;
  isLight: boolean;
  isMainView?: boolean;
  index?: number;
  isLast?: boolean;
}> = ({ taskId, allTasks, depth, selectedTaskId, onSelect, onAddChild, onFocus, onDelete, onDuplicate, onMove, onDrillDown, isLight, isMainView, index, isLast }) => {
  const task = allTasks.find(t => t.id === taskId);
  const [expanded, setExpanded] = React.useState(true);
  const [showMenu, setShowMenu] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false); 
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isLongHovered, setIsLongHovered] = React.useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setShowMenu(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
      setIsHovered(true);
      if (!isMainView) {
          hoverTimer.current = setTimeout(() => {
              setIsLongHovered(true);
          }, 350);
      }
  };

  const handleMouseLeave = () => {
      setIsHovered(false);
      if (hoverTimer.current) {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = null;
      }
      setIsLongHovered(false);
  };

  if (!task) return null;

  // DnD Handlers
  const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData('taskId', task.id);
      e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const droppedTaskId = e.dataTransfer.getData('taskId');
      if (droppedTaskId && droppedTaskId !== task.id && onMove) {
          onMove(droppedTaskId, task.id);
          setExpanded(true);
      }
  };

  // Progress Logic
  const getProgress = (rootId: string) => {
      let total = 0;
      let completed = 0;
      const count = (id: string) => {
          const t = allTasks.find(x => x.id === id);
          if (!t) return;
          if (t.childrenIds && t.childrenIds.length > 0) {
              t.childrenIds.forEach(count);
          } else {
              total++;
              if (t.status === 'Done') completed++;
          }
      };
      count(rootId);
      return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const progress = getProgress(task.id);
  
  // Determine Visual Type
  const isMilestone = task.type === 'Milestone';
  const isGoal = task.type === 'Goal';
  const isEpic = task.type === 'Epic';
  const isStory = task.type === 'Story';
  const isSubIssue = task.type === 'Sub-issue';
  const isIssue = task.type === 'Issue';

  const getTypeTextColor = () => {
      if (isMilestone) return 'text-red-500';
      if (isGoal) return 'text-purple-500';
      if (isEpic) return 'text-emerald-500';
      if (isStory) return 'text-blue-500';
      if (isIssue) return 'text-yellow-500';
      return 'text-slate-500';
  };

  // Inline Delete Confirmation UI
  if (isDeleting) {
      return (
          <div 
            className={`flex items-center justify-between py-2 pr-2 mb-1 rounded-r-xl animate-in fade-in slide-in-from-left-2 duration-200 ${isLight ? 'bg-red-50 border-l-4 border-red-500' : 'bg-red-900/20 border-l-4 border-red-500'}`}
            style={{ paddingLeft: isMainView ? '12px' : (depth === 0 ? '12px' : `${(depth * 10) + 12}px`) }}
          >
              <span className={`text-xs font-bold ${isLight ? 'text-red-600' : 'text-red-400'}`}>Delete this task?</span>
              <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setIsDeleting(false); }} className={`px-2 py-1 text-xs font-bold rounded transition-colors ${isLight ? 'hover:bg-white/50 text-slate-500' : 'hover:bg-white/10 text-slate-400'}`}>Cancel</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} className="px-2 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600 shadow-sm transition-colors">Delete</button>
              </div>
          </div>
      );
  }

  const children = task.childrenIds || [];
  const hasChildren = children.length > 0;
  
  const hoverClass = isLight ? "hover:bg-black/5" : "hover:bg-white/5";
  const selectedClass = isMainView 
    ? (isLight ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-brand-900/20 border-brand-500/50 text-brand-300") 
    : (isLight ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white");
  
  const defaultClass = isLight ? "text-slate-600" : "text-slate-300";
  const dragOverClass = isLight ? "bg-brand-50 ring-2 ring-brand-500/50" : "bg-brand-900/20 ring-2 ring-brand-500/50";

  const showDrillDown = isMainView && depth >= MAX_INLINE_DEPTH && hasChildren;
  
  // Icon Logic
  let Icon = FileText;
  if (isMilestone) Icon = Flag;
  else if (isGoal) Icon = Target;
  else if (isEpic) Icon = Zap;
  else if (isStory) Icon = BookOpen;
  else if (isSubIssue) Icon = CornerDownRight;
  else if (isIssue) Icon = CheckSquare;

  const handleItemClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isMainView) {
          onFocus(task.id);
          if (hasChildren) setExpanded(!expanded);
      } else {
          if (hasChildren) {
              if (showDrillDown) onDrillDown(task.id);
              else setExpanded(!expanded);
          } else {
              onSelect(task.id);
          }
      }
  };

  // RENDER MILESTONE (Only in Main View)
  if (isMainView && isMilestone) {
      return (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-300 relative pl-[16px]">
            {/* Timeline Line */}
            <div className={`absolute left-[16px] top-0 bottom-0 w-[2px] ${isLast ? 'h-[44px]' : ''} ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}></div>
            {index !== 0 && <div className={`absolute left-[16px] top-0 h-6 w-[2px] ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />}
            
            <div 
                className={`
                    ml-[48px] p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden
                    ${isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-md' : 'bg-white/5 border-white/5 hover:bg-white/10'}
                    ${selectedTaskId === task.id ? 'ring-2 ring-brand-500 border-brand-500' : ''}
                `}
                onClick={() => onSelect(task.id)}
            >
                {/* Background Progress Bar */}
                <div className={`absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-500`} style={{ width: `${progress}%` }} />
                
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30`}>
                            <Flag size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-60`}>Milestone</div>
                            <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{task.title}</h3>
                            <div className={`text-xs font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {hasChildren ? `${progress}% Complete` : 'No sub-issues'}
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={task.status} />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="flex -space-x-2">
                        <div className={`w-6 h-6 rounded-full border-2 ${isLight ? 'border-white bg-blue-500' : 'border-[#18181b] bg-blue-500'}`} />
                        <div className={`w-6 h-6 rounded-full border-2 ${isLight ? 'border-white bg-purple-500' : 'border-[#18181b] bg-purple-500'}`} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); onAddChild(task.id); setExpanded(true); }} className={`p-1.5 rounded hover:bg-black/10 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} title="Add Subtask"><Plus size={16} /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDuplicate(task.id); }} className={`p-1.5 rounded hover:bg-black/10 ${isLight ? 'text-slate-600' : 'text-slate-300'}`} title="Duplicate"><Copy size={16} /></button>
                    </div>
                </div>
            </div>

            {expanded && hasChildren && (
                <div 
                    className={`mt-4 ml-0 pl-0 space-y-2 cursor-pointer group/line transition-colors`}
                    onClick={(e) => {
                        if(isMainView) {
                            e.stopPropagation();
                            setExpanded(false);
                        }
                    }}
                >
                    {children.map((childId, i) => (
                        <TaskTreeItem
                            key={childId}
                            taskId={childId}
                            allTasks={allTasks}
                            depth={depth + 1}
                            selectedTaskId={selectedTaskId}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            onFocus={onFocus}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onMove={onMove}
                            onDrillDown={onDrillDown}
                            isLight={isLight}
                            isMainView={true}
                            isLast={i === children.length-1}
                        />
                    ))}
                </div>
            )}
        </div>
      );
  }

  // Standard List Item (Goal, Epic, Story, Issue)
  const goalStyle = isGoal && isMainView ? `border-l-4 ${isLight ? 'border-l-blue-500 bg-blue-50/50' : 'border-l-blue-500 bg-blue-500/10'}` : '';

  return (
    <div className="animate-in fade-in slide-in-from-left-1 duration-300 relative" onClick={(e) => e.stopPropagation()}>
      
      {/* Reddit-style Thread Line (Only in Main View) */}
      {isMainView && depth > 0 && hasChildren && expanded && !showDrillDown && (
          <div 
            className={`absolute left-[16px] top-[36px] bottom-0 w-[2px] z-0 transition-colors cursor-pointer hover:bg-brand-500 ${isLight ? 'bg-slate-200' : 'bg-white/10'}`}
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          />
      )}

      <div className="relative flex items-center">
        <div
            className={`
                flex-1 group flex items-center py-2 pr-3 cursor-pointer transition-all mb-0.5 rounded-xl relative z-10
                ${isDragOver ? dragOverClass : (selectedTaskId === task.id ? selectedClass : `${defaultClass} ${hoverClass}`)}
                ${isMainView ? `border border-transparent ${goalStyle} py-3` : ''}
            `}
            style={{ 
                marginLeft: isMainView ? (depth === 1 ? '48px' : '0px') : '0px',
                paddingLeft: isMainView ? (depth === 1 ? '12px' : '12px') : (depth === 0 ? '12px' : `${(depth * 10) + 12}px`), 
            }}
            onClick={handleItemClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            draggable
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Icon Area (Main View) */}
            {isMainView && (
                <button
                    className={`w-8 h-8 flex items-center justify-center rounded-md mr-2 transition-colors ${hasChildren ? (isLight ? 'hover:bg-black/10 text-slate-400' : 'hover:bg-white/10 text-slate-500') : 'opacity-40 pointer-events-none'}`}
                    onClick={(e) => { e.stopPropagation(); if(hasChildren) setExpanded(!expanded); else onSelect(task.id); }}
                >
                    {hasChildren ? (expanded && !showDrillDown ? <ChevronDown size={18} /> : <ChevronRight size={18} />) : (isMainView ? <Circle size={8} /> : null)}
                </button>
            )}
            
            <div className="flex-1 min-w-0 flex items-center gap-2">
                {(!isMainView && isLongHovered) ? (
                    <div className="flex items-center justify-between w-full gap-1 animate-in fade-in duration-200">
                        <button onClick={(e) => { e.stopPropagation(); onFocus(task.id); }} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Go to directory">
                            Go
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onSelect(task.id); }} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${isLight ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300'}`} title="Open task">
                            Open
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onAddChild(task.id); setExpanded(true); }} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${isLight ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'}`} title="Add Subtask">
                            Add
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setIsDeleting(true); }} className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${isLight ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'}`} title="Delete task">
                            Del
                        </button>
                    </div>
                ) : (
                    <>
                        {!isMainView && (
                             <Icon size={14} className={getTypeTextColor()} />
                        )}
                        {isMainView && isGoal && <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1.5 py-0.5 rounded bg-white/10">GOAL</span>}
                        {isMainView && isEpic && <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">EPIC</span>}
                        
                        <span className={`truncate leading-none py-1.5 ${task.status === 'Done' ? 'line-through opacity-50' : ''} ${isGoal && isMainView ? 'font-bold text-base' : (isMainView ? 'text-base lg:text-sm' : 'text-sm font-medium')} ${!isMainView ? '' : getTypeTextColor()}`}>
                            {task.title}
                        </span>
                    </>
                )}
            </div>
            
            {isMainView && <StatusBadge status={task.status} />}

            {/* Actions (Main View Only) */}
            <div className="flex items-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-2">
                {isMainView && (
                    <>
                        <button 
                            className={`p-1.5 rounded-lg transition-colors mr-1 ${isLight ? 'hover:bg-brand-500/10 text-slate-400 hover:text-brand-500' : 'hover:bg-white/10 text-slate-500 hover:text-white'}`}
                            title="Go To (Focus View)"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFocus(task.id);
                            }}
                        >
                            <ArrowRightCircle size={16} />
                        </button>
                        <button 
                            className={`p-1.5 rounded-lg transition-colors mr-1 ${isLight ? 'hover:bg-brand-500/10 text-slate-400 hover:text-brand-500' : 'hover:bg-white/10 text-slate-500 hover:text-white'}`}
                            title="Add Sub-task"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(task.id);
                                setExpanded(true);
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </>
                )}
                
                {isMainView && (
                    <div className="relative" ref={menuRef}>
                        <button 
                            className={`p-1.5 rounded-lg transition-colors ${isLight ? 'hover:bg-brand-500/10 text-slate-400 hover:text-brand-500' : 'hover:bg-white/10 text-slate-500 hover:text-white'}`}
                            title="More Options"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <MoreHorizontal size={16} />
                        </button>
                        {showMenu && (
                            <div className={`absolute right-0 top-full mt-1 w-32 rounded-xl border shadow-xl z-50 overflow-hidden animate-in zoom-in-95 duration-100 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1e1e1e] border-white/10'}`}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDuplicate(task.id); setShowMenu(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 hover:bg-brand-500/10 hover:text-brand-500 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}
                                >
                                    <Copy size={14} /> Duplicate
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsDeleting(true); setShowMenu(false); }}
                                    className={`w-full text-left px-3 py-2 text-xs font-bold flex items-center gap-2 hover:bg-red-500/10 hover:text-red-500 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <>
            {showDrillDown ? (
                <div className={`${isMainView ? 'ml-[27px] my-1 pl-4 border-l-2' : ''} ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDrillDown(task.id); }}
                        className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-colors ${isLight ? 'text-brand-600 hover:bg-brand-50' : 'text-brand-400 hover:bg-white/5'}`}
                    >
                        View {children.length} sub-issues <ArrowRightCircle size={14} />
                    </button>
                </div>
            ) : (
                <div 
                    className={`${isMainView ? `pl-4 transition-colors` : ''}`}
                    style={{ marginLeft: isMainView ? '16px' : '0px' }}
                    onClick={(e) => {
                        if(isMainView) {
                            e.stopPropagation();
                        }
                    }}
                >
                {children.map((childId) => (
                    <TaskTreeItem
                        key={childId}
                        taskId={childId}
                        allTasks={allTasks}
                        depth={depth + 1}
                        selectedTaskId={selectedTaskId}
                        onSelect={onSelect}
                        onAddChild={onAddChild}
                        onFocus={onFocus}
                        onDelete={onDelete}
                        onDuplicate={onDuplicate}
                        onMove={onMove}
                        onDrillDown={onDrillDown}
                        isLight={isLight}
                        isMainView={isMainView}
                    />
                ))}
                </div>
            )}
        </>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
    tasks, selectedTaskId, focusedParentId, onSelect, onAddChild, onFocus, onAddRoot, onDelete, onDuplicate, onMove,
    theme, background, setTheme, setBackground, isOpen, onClose,
    currentPage, calendarDate, setCalendarDate,
    membersView, setMembersView, resourcesView, setResourcesView, communityView, setCommunityView,
    isMainView, resourcePath, setResourcePath
}) => {
  // ... rest of the component (unchanged logic for container, calendar etc) ...
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drillDownStack, setDrillDownStack] = useState<string[]>([]);

  const isLight = ['Light', 'Sephiroa', 'Green'].includes(theme);
  
  const touchStart = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientY; };
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStart.current === null) return;
      const delta = e.changedTouches[0].clientY - touchStart.current;
      if (delta > 75 && onClose) onClose();
      touchStart.current = null;
  };
  
  let rootTasks: TaskNode[] = [];
  
  const currentParentId = drillDownStack.length > 0 ? drillDownStack[drillDownStack.length - 1] : null;
  const currentParentTask = currentParentId ? tasks.find(t => t.id === currentParentId) : null;

  if (searchQuery) {
      rootTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));
  } else if (currentParentId) {
      rootTasks = tasks.filter(t => currentParentTask?.childrenIds?.includes(t.id));
  } else if (focusedParentId) {
      const parent = tasks.find(t => t.id === focusedParentId);
      if (parent && parent.childrenIds) {
          rootTasks = tasks.filter(t => parent.childrenIds?.includes(t.id));
      }
  } else {
      rootTasks = tasks.filter((t) => !t.parentId);
  }

  const handleDrillDown = (id: string) => {
      setDrillDownStack(prev => [...prev, id]);
  };

  const handleBack = () => {
      setDrillDownStack(prev => prev.slice(0, -1));
  };

  const baseClass = isMainView 
    ? `w-full h-full rounded-none lg:rounded-2xl ${isLight ? 'bg-white/60' : 'bg-black/40'}` 
    : `w-80 border rounded-2xl shadow-2xl ${isLight ? 'bg-white/95 lg:bg-white/80 border-black/5' : 'bg-[#09090b]/95 lg:bg-black/40 border-white/10'}`;

  const containerClass = `${baseClass} backdrop-blur-xl`;
  const textClass = isLight ? "text-slate-800" : "text-slate-200";
  const iconButtonClass = isLight ? "text-slate-500 hover:bg-black/5 hover:text-black" : "text-slate-400 hover:bg-white/10 hover:text-white";
  const searchBg = isLight ? "bg-slate-100 focus-within:bg-white focus-within:ring-2 ring-brand-500/20" : "bg-white/5 focus-within:bg-black/40 focus-within:ring-2 ring-brand-500/30";
  const searchInput = isLight ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-slate-500";
  const mobileSheetClass = isLight ? "bg-white text-slate-900" : "bg-[#09090b] text-white";

  const handleMonthChange = (delta: number) => {
      if (setCalendarDate && calendarDate) {
          const newDate = new Date(calendarDate);
          newDate.setMonth(newDate.getMonth() + delta);
          setCalendarDate(newDate);
      }
  };
  const handleYearChange = (delta: number) => {
    if (setCalendarDate && calendarDate) {
        const newDate = new Date(calendarDate);
        newDate.setFullYear(newDate.getFullYear() + delta);
        setCalendarDate(newDate);
    }
  };
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const renderContextLayers = (title: string, icon: React.ElementType, items: { label: string, icon?: React.ElementType, active?: boolean }[], setViewFn: any) => (
    <div className="flex flex-col h-full w-full">
        {isOpen && (
            <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                </div>
                <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                            {React.createElement(icon, { size: 18 })}
                        </div>
                        <span className={`font-bold text-2xl ${textClass}`}>{title}</span>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                        <X size={24} />
                    </button>
                </div>
            </div>
        )}
        <div className="p-6 flex flex-col gap-3">
             <div className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-60 ${textClass}`}>Active Filters</div>
             {items.map((item, i) => (
                 <div key={i} onClick={() => { setViewFn(item.label); if (onClose) onClose(); }} className={`p-4 rounded-xl border flex items-center justify-between group cursor-pointer ${item.active ? (isLight ? 'bg-brand-50 border-brand-200' : 'bg-brand-500/10 border-brand-500/30') : (isLight ? 'bg-slate-50 border-black/5 hover:bg-slate-100' : 'bg-white/5 border-white/5 hover:bg-white/10')}`}>
                    <div className="flex items-center gap-3">
                        {item.icon && React.createElement(item.icon, { size: 18, className: item.active ? 'text-brand-500' : (isLight ? 'text-slate-400' : 'text-slate-500') })}
                        <span className={`font-bold ${item.active ? 'text-brand-500' : textClass}`}>{item.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${item.active ? 'bg-brand-500 border-brand-500' : 'border-slate-500 group-hover:border-slate-400'}`} />
                 </div>
             ))}
        </div>
    </div>
  );

  const resourceFilters = [
    { label: 'All', icon: Eye, active: resourcesView === 'All' },
    { label: 'Files', icon: FileIcon, active: resourcesView === 'Files' },
    { label: 'Folders', icon: Folder, active: resourcesView === 'Folders' },
    { label: 'PDF', icon: FileText, active: resourcesView === 'PDF' },
    { label: 'Image', icon: Image, active: resourcesView === 'Image' },
    { label: 'Video', icon: Video, active: resourcesView === 'Video' },
  ];

  const renderContent = (isMobile: boolean) => {
    if (currentPage === 'calendar' && calendarDate && setCalendarDate) {
        return (
            <div className="flex flex-col h-full w-full">
                 {isMobile ? (
                    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                        <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                            <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                        </div>
                        <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                                    <CalendarIcon size={18} />
                                </div>
                                <span className={`font-bold text-2xl ${textClass}`}>Navigate</span>
                            </div>
                            <button onClick={onClose} className={`p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                 ) : null}

                 <div className="p-6 flex flex-col gap-6">
                    <div className="text-center">
                         <div className={`text-xs font-bold uppercase tracking-wider mb-4 opacity-60 ${textClass}`}>Select Month</div>
                         <div className="flex items-center justify-between mb-6 bg-white/5 p-2 rounded-xl border border-transparent">
                             <button onClick={() => handleYearChange(-1)} className={`p-2 rounded-lg hover:bg-brand-500/20 hover:text-brand-500 ${textClass}`}><ChevronLeft /></button>
                             <span className={`text-xl font-bold ${textClass}`}>{calendarDate.getFullYear()}</span>
                             <button onClick={() => handleYearChange(1)} className={`p-2 rounded-lg hover:bg-brand-500/20 hover:text-brand-500 ${textClass}`}><ChevronRight /></button>
                         </div>
                         
                         <div className="grid grid-cols-3 gap-2">
                            {MONTHS.map((m, i) => (
                                <button
                                    key={m}
                                    onClick={() => {
                                        const newDate = new Date(calendarDate);
                                        newDate.setMonth(i);
                                        setCalendarDate(newDate);
                                        if(isMobile && onClose) onClose();
                                    }}
                                    className={`py-3 rounded-lg text-sm font-medium transition-all ${
                                        calendarDate.getMonth() === i 
                                        ? 'bg-brand-500 text-white shadow-md' 
                                        : `${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`
                                    }`}
                                >
                                    {m.substring(0, 3)}
                                </button>
                            ))}
                         </div>
                    </div>
                    <button onClick={() => { setCalendarDate(new Date()); if(isMobile && onClose) onClose(); }} className={`w-full py-3 rounded-xl font-bold ${isLight ? 'bg-slate-200 text-slate-800' : 'bg-white/10 text-white'}`}>
                        Jump to Today
                    </button>
                 </div>
            </div>
        )
    }

    if (currentPage === 'members' && setMembersView) return renderContextLayers('Directory Filters', Users, [
        { label: 'All', active: membersView === 'All', icon: Users }, 
        { label: 'Team Members', active: membersView === 'Team Members', icon: Users }, 
        { label: 'Teams', active: membersView === 'Teams', icon: Eye }, 
        { label: 'Coordinators', active: membersView === 'Coordinators', icon: Filter }
    ], setMembersView);
    if (currentPage === 'resources' && setResourcesView) {
      return renderContextLayers('Resources Filters', Folder, resourceFilters, setResourcesView);
    }
    if (currentPage === 'community' && setCommunityView) return renderContextLayers('Topics', MoreHorizontal, [
        { label: 'All', active: communityView === 'All' },
        { label: 'Help', active: communityView === 'Help' }, 
        { label: 'Feedback', active: communityView === 'Feedback' }, 
        { label: 'Updates', active: communityView === 'Updates' }, 
        { label: 'Polls', active: communityView === 'Polls' }
    ], setCommunityView);

    return (
    <div className="flex flex-col h-full w-full">
        {isMobile ? (
             <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className="w-full flex items-center justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
                    <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-slate-300' : 'bg-white/20'}`} />
                </div>
                <div className="flex items-center justify-between px-6 pb-4 border-b border-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/20">
                            <FileText size={18} />
                        </div>
                        <span className={`font-bold text-2xl ${textClass}`}>Outline</span>
                    </div>
                    <div className="flex gap-2">
                         {!isMainView && (
                             <button onClick={onAddRoot} className={`p-2 rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white transition-colors`}>
                                 <Plus size={24} />
                             </button>
                         )}
                        <button onClick={onClose} className={`p-2 rounded-full ${isLight ? 'bg-slate-100 hover:bg-slate-200' : 'bg-white/10 hover:bg-white/20'}`}>
                            <X size={24} />
                        </button>
                    </div>
                </div>
             </div>
        ) : (
            <div className={`h-[60px] flex items-center px-3 border-b border-transparent flex-shrink-0 justify-between`}>
                {!isMainView && (
                    <button onClick={() => setCollapsed(!collapsed)} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${iconButtonClass}`} title={collapsed ? "Expand" : "Collapse"}>
                        {collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </button>
                )}
                <div className={`flex items-center gap-2 transition-opacity duration-300 ${collapsed && !isMainView ? 'opacity-100' : (isMainView ? 'px-3' : 'opacity-50')}`}>
                     <span className={`font-bold tracking-wide ${isMainView ? 'text-2xl' : 'text-sm'}`}>{isMainView ? 'Project Outline' : 'OUTLINE'}</span>
                     {!isMainView && (
                        <button onClick={(e) => { e.stopPropagation(); onAddRoot(); }} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ml-2 ${isLight ? 'bg-brand-500/10 text-brand-500 hover:bg-brand-500 hover:text-white' : 'bg-white/5 hover:bg-white/10 text-brand-400'}`} title="Add New Task">
                            <Plus size={18} />
                        </button>
                     )}
                </div>
            </div>
        )}

        <div className={`flex flex-col flex-1 min-h-0 transition-all duration-500 ease-in-out ${!isMainView && collapsed ? 'max-h-0 opacity-0' : 'h-full opacity-100'}`}>
            {!currentParentId && (
                <div className={`px-4 lg:px-4 py-4 flex-shrink-0 ${isMobile ? 'pb-2' : ''} ${isMainView ? 'max-w-3xl mx-auto w-full flex flex-col min-h-0' : ''}`}>
                    <div className={`relative flex items-center rounded-xl transition-all duration-200 ${searchBg}`}>
                        <Search className={`absolute left-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                        <input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full h-12 bg-transparent border-none outline-none pl-12 pr-4 text-base ${searchInput}`} />
                    </div>
                </div>
            )}
            
            <div className={`flex-1 overflow-y-auto custom-scrollbar pb-24 px-2 touch-pan-y ${isMainView ? 'max-w-3xl mx-auto w-full px-4 md:px-8' : ''}`}>
                
                {currentParentId && isMainView && (
                    <div className="animate-in slide-in-from-right duration-300">
                        <button 
                            onClick={handleBack}
                            className={`flex items-center gap-2 mb-6 text-sm font-bold px-4 py-3 rounded-xl transition-colors ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                            <ArrowLeft size={18} /> Back to {currentParentTask?.title || 'Outline'}
                        </button>
                        <div className="mb-8 px-2">
                            <h1 className={`text-3xl font-bold mb-2 ${textClass}`}>{currentParentTask?.title}</h1>
                            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sub-issues breakdown</p>
                        </div>
                    </div>
                )}

                <div className={`space-y-1 mt-2`}>
                    {rootTasks.map((task, index) => (
                        <TaskTreeItem
                            key={task.id}
                            taskId={task.id}
                            allTasks={tasks}
                            depth={currentParentId ? 0 : 0} 
                            selectedTaskId={selectedTaskId}
                            onSelect={(id) => { onSelect(id); if (isMobile && onClose) onClose(); }}
                            onAddChild={onAddChild}
                            onFocus={onFocus}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                            onMove={onMove}
                            onDrillDown={handleDrillDown}
                            isLight={isLight}
                            isMainView={isMainView}
                            index={index}
                            isLast={index === rootTasks.length - 1}
                        />
                    ))}
                </div>
            </div>
        </div>
    </div>
  )};

  if (isMainView) {
      return (
        <div className={`flex flex-col w-full h-full overflow-hidden ${containerClass}`}>
            {renderContent(false)}
        </div>
      );
  }

  return (
    <>
        <div className={`relative flex flex-col transition-all duration-500 ease-in-out hidden lg:flex overflow-hidden ${containerClass} ${collapsed && !isMainView ? 'h-[60px]' : 'h-full'}`}>
            {renderContent(false)}
        </div>
        {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] lg:hidden animate-in fade-in duration-300" onClick={onClose} />}
        <div className={`fixed inset-x-0 bottom-0 z-[200] h-[85vh] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-300 lg:hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'} ${mobileSheetClass}`}>
            {renderContent(true)}
        </div>
    </>
  );
};
