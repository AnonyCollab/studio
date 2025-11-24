
import React, { useMemo, useState, useEffect } from 'react';
import { 
  Layout, 
  List as ListIcon, 
  Calendar, 
  Trello, 
  FolderOpen,
  FileText
} from 'lucide-react';
import { Status, Priority, ViewMode, TaskNode, FilterOption } from '../types';
import { CanvasView } from './views/Board';
import { KanbanView } from './views/Kanban';
import { ListView } from './views/List';
import { GanttView } from './views/Gantt';
import { Sidebar } from './Sidebar';
import { CheckCircle2, Users, Layers, Briefcase, ChevronDown, AlertCircle } from 'lucide-react';

// --- Shared Components ---
export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const styles = {
    'Backlog': 'bg-slate-700 text-slate-300',
    'In Progress': 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
    'Review': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    'Done': 'bg-green-500/20 text-green-400 border border-green-500/30',
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${styles[status]}`}>{status}</span>;
};

export const PriorityIcon: React.FC<{ priority: Priority, size?: number }> = ({ priority, size = 12 }) => {
  const colors = {
    'Low': 'text-slate-400',
    'Medium': 'text-brand-400',
    'High': 'text-orange-400',
    'Critical': 'text-red-500',
  };
  return <AlertCircle size={size} className={`${colors[priority]}`} />;
};

const Breadcrumbs: React.FC<{ tasks: TaskNode[], focusedParentId: string | null, onFocus: (id: string | null) => void, isLight: boolean }> = ({ tasks, focusedParentId, onFocus, isLight }) => {
    const getPath = (currentId: string | null): { id: string | null, title: string }[] => {
        if (!currentId) return [{ id: null, title: 'Root' }];
        const current = tasks.find(t => t.id === currentId);
        if (!current) return [{ id: null, title: 'Root' }];
        
        const parentPath = getPath(current.parentId || null);
        return [...parentPath, { id: current.id, title: current.title }];
    };

    const path = getPath(focusedParentId);

    return (
        <div className={`flex items-center gap-2 text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
             <FolderOpen size={14} className="text-brand-500" />
             {path.map((item, idx) => (
                 <React.Fragment key={item.id || 'root'}>
                    <button 
                        onClick={() => onFocus(item.id)}
                        className={`hover:text-brand-500 transition-colors ${idx === path.length - 1 ? (isLight ? 'text-slate-900 font-bold' : 'text-slate-200 font-bold') : ''}`}
                    >
                        {item.title}
                    </button>
                    {idx < path.length - 1 && <span className="text-slate-400">/</span>}
                 </React.Fragment>
             ))}
        </div>
    );
}

interface AssignedTasksWidgetProps {
    isLight: boolean;
    tasks: TaskNode[];
    filter: FilterOption;
    setFilter: (f: FilterOption) => void;
    selectTask: (id: string) => void;
}

const AssignedTasksWidget: React.FC<AssignedTasksWidgetProps> = ({ isLight, tasks, filter, setFilter, selectTask }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Updated to Solid / Non-Transparent Colors
    const containerClass = isLight 
        ? "bg-white border border-slate-200 shadow-xl" 
        : "bg-[#18181b] border border-white/10 shadow-xl";
        
    const buttonClass = isLight
        ? (isOpen ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")
        : (isOpen ? "bg-white/10 text-white" : "text-slate-300 hover:text-white hover:bg-white/5");

    const dropdownClass = isLight
        ? "bg-white border-slate-200 text-slate-800 shadow-2xl ring-1 ring-black/5"
        : "bg-[#18181b] border-white/10 text-slate-200 shadow-2xl ring-1 ring-white/10";
    
    const filterOptions = [
        { id: 'Mine', label: 'My Tasks', icon: CheckCircle2 },
        { id: 'Team', label: 'Team', icon: Users },
        { id: 'Project', label: 'Project', icon: Layers },
        { id: 'All', label: 'All', icon: Briefcase },
    ];

    const currentLabel = filterOptions.find(f => f.id === filter)?.label || 'Tasks';

    return (
        <div className="relative">
            <div className={`p-1.5 rounded-xl ${containerClass}`}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex items-center gap-2 px-3 h-[36px] rounded-lg transition-all duration-200 border border-transparent
                        ${buttonClass}
                    `}
                >
                    <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                        {tasks.length}
                    </div>
                    <span className="text-xs font-bold tracking-wide uppercase hidden sm:inline">{currentLabel}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <div className={`absolute top-full right-0 mt-2 w-80 sm:w-96 border rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col z-[60] ${dropdownClass}`}>
                    
                    {/* Filter Tabs */}
                    <div className={`p-2 border-b flex gap-1 ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-white/5'}`}>
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setFilter(opt.id as FilterOption)}
                                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${
                                    filter === opt.id 
                                    ? 'bg-brand-500 text-white shadow-md' 
                                    : (isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:bg-white/10')
                                }`}
                            >
                                <opt.icon size={14} />
                                <span className="text-[9px] font-bold uppercase">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className={`p-3 border-b ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
                        <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                            {currentLabel} ({tasks.length})
                        </h3>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-slate-500 gap-2">
                                <span className="text-2xl">🎉</span>
                                <span className="text-sm">No tasks found.</span>
                            </div>
                        )}
                        {tasks.slice(0, 10).map(task => (
                            <div
                                key={task.id}
                                onClick={() => {
                                    selectTask(task.id);
                                    setIsOpen(false);
                                }}
                                className={`p-3 rounded-xl cursor-pointer group transition-all border ${isLight ? 'bg-slate-50 border-slate-200 hover:border-brand-200 hover:bg-white' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className="text-[10px] text-slate-500 font-mono group-hover:text-brand-500 transition-colors">{task.id}</span>
                                    <StatusBadge status={task.status} />
                                </div>
                                <div className={`font-medium text-sm mb-3 line-clamp-2 leading-snug ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{task.title}</div>
                                <div className="flex items-center justify-between">
                                     <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${isLight ? 'bg-white border border-slate-100' : 'bg-black/20 border border-white/5'}`}>
                                        <PriorityIcon priority={task.priority} />
                                        <span className="text-[10px] text-slate-500 font-medium">{task.priority}</span>
                                     </div>
                                     <div className="flex items-center gap-2">
                                         <div className={`w-5 h-5 rounded-full ${task.assignee.color} flex items-center justify-center text-[9px] text-white font-bold shadow-sm`}>{task.assignee.initials}</div>
                                         <div className="text-[10px] text-slate-500 font-mono">Due {task.dueDate}</div>
                                     </div>
                                </div>
                            </div>
                        ))}
                        {tasks.length > 10 && (
                             <div className="text-center py-2 text-[10px] text-slate-500 italic">
                                 + {tasks.length - 10} more tasks
                             </div>
                        )}
                    </div>
                    <div className={`p-2 border-t text-center ${isLight ? 'border-slate-100 bg-slate-50' : 'border-white/5 bg-white/5'}`}>
                        <button 
                            onClick={() => setFilter('All')}
                            className="text-[10px] font-bold text-brand-500 hover:text-brand-600 uppercase tracking-wider py-1 transition-colors"
                        >
                            View Full List
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

interface PlanProps {
    store: any; 
    isSidebarOpen: boolean;
    setIsSidebarOpen: (v: boolean) => void;
    isViewMenuOpen: boolean;
    setIsViewMenuOpen: (v: boolean) => void;
    onToggleViewMenu: () => void;
}

export const Plan: React.FC<PlanProps> = ({ store, isSidebarOpen, setIsSidebarOpen, isViewMenuOpen, setIsViewMenuOpen, onToggleViewMenu }) => {
  const { 
      tasks, selectedTaskId, selectedTaskIds, viewMode, scale, focusedParentId, theme, background, filter, currentUser,
      setTasks, selectTask, selectTasks, setViewMode, setScale, updateTask, addTask, deleteTask, duplicateTask, moveTask, setFocusedParentId, setTheme, setBackground, setFilter
  } = store;
  
  const isLightTheme = ['Light', 'Sephiroa', 'Green'].includes(theme);
  const isReadOnly = currentUser?.role === 'Visitor';

  // Redirect mobile users from Canvas to Board
  useEffect(() => {
      const checkMobile = () => {
          if (window.innerWidth < 1024 && viewMode === 'canvas') {
              setViewMode('board');
          }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode, setViewMode]);

  // Filter Logic
  const filteredTasks = useMemo(() => {
      const currentUser = 'Alex Chen';
      const currentTeam = 'Frontend Team';

      switch(filter) {
          case 'Mine':
              return tasks.filter((t: TaskNode) => t.assignee.name === currentUser);
          case 'Team':
              return tasks.filter((t: TaskNode) => t.assignee.name === currentTeam || t.assignee.type === 'team');
          case 'Project':
              if (focusedParentId) {
                  return tasks.filter((t: TaskNode) => t.parentId === focusedParentId || t.id === focusedParentId);
              }
              return tasks.filter((t: TaskNode) => !t.parentId);
          case 'All':
              return tasks;
          default:
              return tasks;
      }
  }, [tasks, filter, focusedParentId]);

  const canvasTasks = useMemo(() => {
    if (!focusedParentId) {
        // Root View: Show ONLY Milestones (Level 0) and Goals (Level 1)
        return tasks.filter((t: TaskNode) => {
            // Level 0: Milestone
            if (!t.parentId) return true; 
            
            const parent = tasks.find(p => p.id === t.parentId);
            if (!parent) return false;
            
            // Level 1: Goal (Is child of Root/Milestone)
            return !parent.parentId; 
        });
    } else {
        // Nested View: Show Focused Task (Crown) and DIRECT Children ONLY
        return tasks.filter((t: TaskNode) => {
            // 1. The Focused Task itself
            if (t.id === focusedParentId) return true;
            
            // 2. Direct Children of Focused Task
            if (t.parentId === focusedParentId) return true;
            
            return false;
        });
    }
  }, [tasks, focusedParentId]);

  const widgetClass = isLightTheme 
    ? "bg-white/80 backdrop-blur-xl border border-black/5 text-slate-700 shadow-xl"
    : "bg-black/40 backdrop-blur-xl border border-white/10 text-slate-200 shadow-xl";

  const getButtonClass = (active: boolean) => {
      if (isLightTheme) {
          return active ? "bg-black/5 text-black shadow-sm border border-black/5" : "text-slate-500 hover:text-black hover:bg-black/5 border border-transparent";
      }
      return active ? "bg-white/10 text-white shadow-sm border border-white/5" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent";
  }

  const viewOptions = [
    { id: 'canvas', icon: Layout, label: 'Canvas' },
    { id: 'board', icon: Trello, label: 'Board' },
    { id: 'list', icon: ListIcon, label: 'List' },
    { id: 'timeline', icon: Calendar, label: 'Gantt' },
    { id: 'outline', icon: FileText, label: 'Outline' }
  ];

  return (
    <section className="relative w-full h-full font-sans overflow-hidden selection:bg-brand-500/30 flex justify-center">
       
       {/* Viewport */}
       <div className="w-full max-w-screen-2xl h-full relative flex flex-col">
           
           {/* Viewport Content */}
           <div className="flex-1 relative overflow-hidden z-0">
              {viewMode === 'canvas' && (
                  <div className="w-full h-full hidden lg:block">
                    <CanvasView 
                        tasks={canvasTasks} 
                        scale={scale} 
                        setScale={setScale}
                        setTasks={setTasks} 
                        selectedTaskId={selectedTaskId} 
                        selectedTaskIds={selectedTaskIds}
                        onSelect={selectTask}
                        onSelectTasks={selectTasks}
                        onAdd={(overrides) => !isReadOnly && addTask({ ...(focusedParentId ? { parentId: focusedParentId } : {}), ...overrides })}
                        onFocus={setFocusedParentId}
                        focusedParentId={focusedParentId}
                        theme={theme}
                        isReadOnly={isReadOnly}
                        onMove={moveTask}
                    />
                  </div>
              )}
              {viewMode === 'outline' && (
                  <div className="w-full h-full pt-2 lg:pt-24 px-0 lg:px-8 pb-24 lg:pb-8">
                      <Sidebar 
                        tasks={tasks} 
                        selectedTaskId={selectedTaskId}
                        focusedParentId={focusedParentId}
                        onSelect={selectTask}
                        onAddChild={(parentId) => !isReadOnly && addTask({ parentId })}
                        onFocus={setFocusedParentId}
                        onAddRoot={() => !isReadOnly && addTask(focusedParentId ? { parentId: focusedParentId } : {})}
                        onDelete={isReadOnly ? () => {} : deleteTask}
                        onDuplicate={isReadOnly ? () => {} : duplicateTask}
                        onMove={isReadOnly ? undefined : moveTask}
                        theme={theme}
                        background={background}
                        setTheme={setTheme}
                        setBackground={setBackground}
                        isOpen={true} 
                        onClose={() => {}}
                        isMainView={true}
                     />
                  </div>
              )}
              {viewMode !== 'canvas' && viewMode !== 'outline' && (
                <div className="w-full h-full pt-2 lg:pt-24 px-0 lg:px-8 pb-24 lg:pb-8 animate-in fade-in duration-500 flex flex-col">
                     <div className="flex-1 min-h-0">
                        {viewMode === 'board' && (
                            <KanbanView 
                                tasks={filteredTasks} 
                                selectedTaskId={selectedTaskId} 
                                onSelect={selectTask}
                                onUpdateTask={updateTask}
                                theme={theme}
                                isReadOnly={isReadOnly}
                            />
                        )}
                        {viewMode === 'list' && (
                            <ListView 
                                tasks={filteredTasks} 
                                selectedTaskId={selectedTaskId} 
                                onSelect={selectTask}
                                theme={theme}
                            />
                        )}
                        {viewMode === 'timeline' && (
                            <GanttView 
                                tasks={filteredTasks} 
                                selectedTaskId={selectedTaskId} 
                                onSelect={selectTask}
                                onUpdateTask={updateTask}
                                theme={theme}
                            />
                        )}
                     </div>
                </div>
              )}
           </div>

           {/* Floating UI Layer (z-50) */}
           
           {/* DESKTOP: Top Center View Switcher */}
           <div className="hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 z-50 justify-center">
              <div className={`flex p-1.5 rounded-xl gap-1 ${widgetClass}`}>
                {viewOptions.map(v => (
                    <button
                        key={v.id}
                        onClick={() => setViewMode(v.id as ViewMode)}
                        className={`flex items-center justify-center gap-2 px-4 h-[36px] rounded-lg text-sm font-medium transition-all duration-200
                            ${getButtonClass(viewMode === v.id)}
                        `}
                    >
                        <v.icon size={16} />
                        <span className="hidden sm:inline">{v.label}</span>
                    </button>
                ))}
              </div>
           </div>

           {/* DESKTOP: Top Right User Actions & Widgets */}
           <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-50 flex items-center gap-3 hidden lg:flex">
                <AssignedTasksWidget 
                    isLight={isLightTheme} 
                    tasks={filteredTasks} 
                    filter={filter}
                    setFilter={setFilter}
                    selectTask={selectTask}
                />
           </div>

           {/* Sidebar - Desktop Widget ONLY (Hidden in Outline View) */}
           {/* We pass isOpen=false here because Plan only manages desktop. Mobile drawer is in App.tsx. */}
           {viewMode !== 'outline' && (
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6 bottom-20 lg:bottom-6 z-50 flex flex-col pointer-events-none">
                    <div className="pointer-events-auto h-auto max-h-full flex flex-col gap-4">
                        <Sidebar 
                            tasks={tasks} 
                            selectedTaskId={selectedTaskId}
                            focusedParentId={focusedParentId}
                            onSelect={selectTask}
                            onAddChild={(parentId) => !isReadOnly && addTask({ parentId })}
                            onFocus={setFocusedParentId}
                            onAddRoot={() => !isReadOnly && addTask(focusedParentId ? { parentId: focusedParentId } : {})}
                            onDelete={isReadOnly ? () => {} : deleteTask}
                            onDuplicate={isReadOnly ? () => {} : duplicateTask}
                            onMove={isReadOnly ? undefined : moveTask}
                            theme={theme}
                            background={background}
                            setTheme={setTheme}
                            setBackground={setBackground}
                            isOpen={false} 
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                </div>
           )}
           
           {/* Breadcrumbs Widget - Fixed Bottom Left (Hidden on Mobile) */}
           <div className="fixed bottom-8 left-8 z-50 pointer-events-auto hidden lg:block">
                <div className={`px-4 py-2 rounded-xl flex items-center ${widgetClass}`}>
                     <Breadcrumbs 
                        tasks={tasks} 
                        focusedParentId={focusedParentId} 
                        onFocus={setFocusedParentId}
                        isLight={isLightTheme}
                     />
                </div>
           </div>

       </div>
    </section>
  );
};
