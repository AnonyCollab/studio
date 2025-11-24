
import { useState, useCallback, useEffect } from 'react';
import { AppState, TaskNode, ViewMode, Status, Priority, Theme, BackgroundType, FilterOption, HistoryEntry, UserPost, Assignee, FileItem, CurrentUser, UserRole } from '../types';
import { MOCK_ASSIGNEES, INITIAL_CYCLES, MOCK_POSTS, MOCK_FILES } from '../constants';
import { FileText } from 'lucide-react'; 

export interface ExtendedAppState extends AppState {
  focusedParentId: string | null;
  setTheme: (theme: Theme) => void;
  setBackground: (bg: BackgroundType) => void;
  setFilter: (filter: FilterOption) => void;
  setCurrentUser: (user: CurrentUser) => void;
  updateMember: (id: string, updates: Partial<Assignee>) => void;
}

const STORAGE_KEY = 'omnicanvas-v1-pro';

const DEFAULT_USER: CurrentUser = {
    id: 'u1',
    name: 'Alex Chen',
    initials: 'AC',
    role: 'Owner',
    avatarColor: 'bg-blue-500',
    teamName: 'Frontend Team'
};

const DEFAULT_STATE: AppState = {
    currentUser: DEFAULT_USER,
    tasks: [],
    cycles: INITIAL_CYCLES,
    posts: MOCK_POSTS,
    members: MOCK_ASSIGNEES,
    files: MOCK_FILES,
    selectedTaskId: null,
    selectedTaskIds: [],
    isModalOpen: false,
    viewMode: 'canvas',
    scale: 1,
    focusedParentId: null,
    theme: 'Dark',
    background: 'Dots',
    filter: 'Project'
};

// Helper to bubble up date changes from children to parents (Epic -> Goal -> Milestone)
const updateCascadingDates = (tasks: TaskNode[], startTaskId: string): TaskNode[] => {
    let currentTasks = [...tasks];
    let currentId = startTaskId;

    while (true) {
        const task = currentTasks.find(t => t.id === currentId);
        if (!task || !task.parentId) break;

        const parent = currentTasks.find(t => t.id === task.parentId);
        if (!parent) break;

        if (parent.type !== 'Goal' && parent.type !== 'Milestone') break;

        const siblings = currentTasks.filter(t => t.parentId === parent.id);
        if (siblings.length === 0) break;

        const dueDates = siblings
            .map(s => new Date(s.dueDate).getTime())
            .filter(t => !isNaN(t));
        
        const startDates = siblings
            .map(s => new Date(s.startDate).getTime())
            .filter(t => !isNaN(t));

        if (dueDates.length === 0) break;

        const maxDueDate = new Date(Math.max(...dueDates));
        const minStartDate = startDates.length > 0 ? new Date(Math.min(...startDates)) : new Date();

        const formatDate = (d: Date) => {
            const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
            const day = d.getDate().toString().padStart(2, '0');
            return `${m} ${day}`;
        };

        const newDueStr = formatDate(maxDueDate);
        const newStartStr = formatDate(minStartDate);

        if (parent.dueDate !== newDueStr || parent.startDate !== newStartStr) {
            currentTasks = currentTasks.map(t => 
                t.id === parent.id ? { ...t, dueDate: newDueStr, startDate: newStartStr } : t
            );
            currentId = parent.id;
        } else {
            break;
        }
    }
    return currentTasks;
};

// Helper to bubble up Status changes
const updateCascadingStatus = (tasks: TaskNode[], startTaskId: string): TaskNode[] => {
    let currentTasks = [...tasks];
    let currentId = startTaskId;

    while (true) {
        const task = currentTasks.find(t => t.id === currentId);
        if (!task || !task.parentId) break;

        const parent = currentTasks.find(t => t.id === task.parentId);
        if (!parent) break;

        const siblings = currentTasks.filter(t => t.parentId === parent.id);
        if (siblings.length === 0) break;

        let newStatus: Status = parent.status;
        const allDone = siblings.every(s => s.status === 'Done');
        const anyActive = siblings.some(s => s.status === 'In Progress' || s.status === 'Review' || s.status === 'Done');

        if (allDone) {
            newStatus = 'Done';
        } else if (anyActive) {
            if (parent.status === 'Backlog' || parent.status === 'Done') {
                newStatus = 'In Progress';
            }
        } else {
            if (siblings.every(s => s.status === 'Backlog')) {
                newStatus = 'Backlog';
            }
        }

        if (parent.status !== newStatus) {
            currentTasks = currentTasks.map(t => 
                t.id === parent.id ? { ...t, status: newStatus } : t
            );
            currentId = parent.id;
        } else {
            break;
        }
    }
    return currentTasks;
};

export const useStore = () => {
    const [state, setState] = useState<AppState>(DEFAULT_STATE);

    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setState(prev => ({
                    ...prev,
                    ...parsed,
                    currentUser: parsed.currentUser || DEFAULT_STATE.currentUser,
                    tasks: parsed.tasks?.length ? parsed.tasks : DEFAULT_STATE.tasks,
                    posts: parsed.posts?.length ? parsed.posts : DEFAULT_STATE.posts,
                    members: parsed.members?.length ? parsed.members : DEFAULT_STATE.members,
                    files: parsed.files?.length ? parsed.files : DEFAULT_STATE.files,
                }));
            } catch (e) {
                console.error('Failed to parse local storage', e);
                setState(DEFAULT_STATE);
            }
        }
    }, []);

  useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCurrentUser = useCallback((user: CurrentUser) => {
      setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const setTasks = useCallback((tasksOrUpdater: TaskNode[] | ((prev: TaskNode[]) => TaskNode[])) => {
    setState(prev => ({
        ...prev,
        tasks: typeof tasksOrUpdater === 'function' ? tasksOrUpdater(prev.tasks) : tasksOrUpdater
    }));
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<Assignee>) => {
    setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }))
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskNode>) => {
    setState((prev) => {
      const currentUser = prev.currentUser.name; 
      const task = prev.tasks.find(t => t.id === id);
      if (!task) return prev;

      if (updates.parentId !== undefined && updates.parentId !== task.parentId) {
          let checkId = updates.parentId;
          let isCycle = false;
          if (checkId === id) isCycle = true;
          while (checkId && !isCycle) {
              const parent = prev.tasks.find(t => t.id === checkId);
              checkId = parent ? (parent.parentId || null) : null;
              if (checkId === id) isCycle = true;
          }
          if (isCycle) return prev;
      }

      let historyEntry: HistoryEntry | null = null;
      if (updates.status && updates.status !== task.status) {
          historyEntry = { id: Date.now().toString(), date: new Date().toISOString(), user: currentUser, action: `Changed status to ${updates.status}`, type: 'status' };
      } else if (updates.priority && updates.priority !== task.priority) {
          historyEntry = { id: Date.now().toString(), date: new Date().toISOString(), user: currentUser, action: `Changed priority to ${updates.priority}`, type: 'priority' };
      } else if (updates.assignee && updates.assignee.name !== task.assignee.name) {
          historyEntry = { id: Date.now().toString(), date: new Date().toISOString(), user: currentUser, action: `Assigned to ${updates.assignee.name}`, type: 'assignment' };
      }

      let tempTasks = [...prev.tasks];

      if (updates.parentId !== undefined && updates.parentId !== task.parentId) {
          const oldParentId = task.parentId;
          const newParentId = updates.parentId;
          
          tempTasks = tempTasks.map(t => {
              if (oldParentId && t.id === oldParentId) {
                  return { ...t, childrenIds: t.childrenIds?.filter(cid => cid !== id) };
              }
              if (newParentId && t.id === newParentId) {
                  return { ...t, childrenIds: [...(t.childrenIds || []), id] };
              }
              return t;
          });
      }

      // Handle Next/Prev updates
      if (updates.next) {
          const oldNext = task.next || [];
          const newNext = updates.next || [];
          
          const added = newNext.filter(n => !oldNext.includes(n));
          const removed = oldNext.filter(n => !newNext.includes(n));

          tempTasks = tempTasks.map(t => {
              // If B was added to A's next, B's prev gets A
              if (added.includes(t.id)) {
                  if (!t.prev.includes(id)) return { ...t, prev: [...(t.prev || []), id] };
              }
              // If B was removed from A's next, B's prev removes A
              if (removed.includes(t.id)) {
                  return { ...t, prev: (t.prev || []).filter(p => p !== id) };
              }
              return t;
          });
      }

      if (updates.prev) {
          const oldPrev = task.prev || [];
          const newPrev = updates.prev || [];
          
          const added = newPrev.filter(n => !oldPrev.includes(n));
          const removed = oldPrev.filter(n => !newPrev.includes(n));

          tempTasks = tempTasks.map(t => {
              // If B added to A's prev, B's next gets A
              if (added.includes(t.id)) {
                  if (!t.next.includes(id)) return { ...t, next: [...(t.next || []), id] };
              }
              // If B removed from A's prev, B's next removes A
              if (removed.includes(t.id)) {
                  return { ...t, next: (t.next || []).filter(n => n !== id) };
              }
              return t;
          });
      }

      tempTasks = tempTasks.map(t => {
          if (t.id === id) {
              const newHistory = historyEntry ? [historyEntry, ...(t.history || [])] : (t.history || []);
              return { ...t, ...updates, history: newHistory };
          }
          return t;
      });

      if (updates.startDate || updates.dueDate || updates.parentId !== undefined || updates.status) {
          if (updates.parentId !== undefined && task.parentId) {
              const oldParent = tempTasks.find(t => t.id === task.parentId);
              if (oldParent && (oldParent.type === 'Goal' || oldParent.type === 'Milestone')) {
                  const anyChild = tempTasks.find(t => t.parentId === oldParent.id);
                  if (anyChild) tempTasks = updateCascadingDates(tempTasks, anyChild.id);
              }
          }
          tempTasks = updateCascadingDates(tempTasks, id);

          if (updates.status || updates.parentId !== undefined) {
              if (updates.parentId !== undefined && task.parentId) {
                  const oldParent = tempTasks.find(t => t.id === task.parentId);
                  if (oldParent) {
                      const anyChild = tempTasks.find(t => t.parentId === oldParent.id);
                      if (anyChild) tempTasks = updateCascadingStatus(tempTasks, anyChild.id);
                  }
              }
              tempTasks = updateCascadingStatus(tempTasks, id);
          }
      }

      return { ...prev, tasks: tempTasks };
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
      setState((prev) => {
        const deletedTask = prev.tasks.find(t => t.id === id);
        let tasks: TaskNode[] = prev.tasks.filter(t => t.id !== id).map(t => ({
            ...t,
            next: t.next?.filter(n => n !== id) || [],
            prev: t.prev?.filter(p => p !== id) || [],
            childrenIds: t.childrenIds?.filter(c => c !== id)
        }));
        
        if (deletedTask && deletedTask.parentId) {
             const parent = tasks.find(t => t.id === deletedTask.parentId);
             if (parent) {
                 const sibling = tasks.find(t => t.parentId === parent.id);
                 if (sibling) {
                     if (parent.type === 'Goal' || parent.type === 'Milestone') {
                         tasks = updateCascadingDates(tasks, sibling.id);
                     }
                     tasks = updateCascadingStatus(tasks, sibling.id);
                 }
             }
        }

        return {
            ...prev,
            tasks,
            selectedTaskId: prev.selectedTaskId === id ? null : prev.selectedTaskId,
            selectedTaskIds: prev.selectedTaskIds.filter(tid => tid !== id),
            isModalOpen: prev.selectedTaskId === id ? false : prev.isModalOpen
        };
      });
  }, []);

  const duplicateTask = useCallback((id: string) => {
      setState((prev) => {
          const taskToCopy = prev.tasks.find(t => t.id === id);
          if (!taskToCopy) return prev;

          const generateId = () => `TASK-${Math.floor(Math.random() * 90000) + 10000}`;
          const newTasks: TaskNode[] = [];

          const cloneRecursive = (originalTaskId: string, newParentId: string | undefined, isRoot: boolean = false): string | null => {
              const original = prev.tasks.find(t => t.id === originalTaskId);
              if (!original) return null;

              const newId = generateId();
              const newTask: TaskNode = {
                  ...original,
                  id: newId,
                  parentId: newParentId,
                  title: isRoot ? `${original.title} (Copy)` : original.title,
                  position: { x: original.position.x + 20, y: original.position.y + 20 }, 
                  childrenIds: [], 
                  next: [], 
                  prev: [],
                  history: [{ id: Date.now().toString(), date: new Date().toISOString(), user: prev.currentUser.name, action: 'Duplicated task', type: 'creation' }],
                  cycleId: original.cycleId,
                  checklist: original.checklist?.map(c => ({ ...c, id: `cl-${Math.random()}` })) || []
              };

              const newChildrenIds: string[] = [];
              if (original.childrenIds) {
                  original.childrenIds.forEach(childId => {
                      const newChildId = cloneRecursive(childId, newId, false);
                      if (newChildId) newChildrenIds.push(newChildId);
                  });
              }
              newTask.childrenIds = newChildrenIds;
              newTasks.push(newTask);
              return newId;
          };

          const newRootId = cloneRecursive(id, taskToCopy.parentId, true);

          if (!newRootId) return prev;

          let updatedTasks = [...prev.tasks, ...newTasks];
          if (taskToCopy.parentId) {
              updatedTasks = updatedTasks.map(t => {
                  if (t.id === taskToCopy.parentId) {
                      return { ...t, childrenIds: [...(t.childrenIds || []), newRootId] };
                  }
                  return t;
              });
              
              updatedTasks = updateCascadingDates(updatedTasks, newRootId);
              updatedTasks = updateCascadingStatus(updatedTasks, newRootId);
          }

          return { ...prev, tasks: updatedTasks };
      });
  }, []);

  const moveTask = useCallback((taskId: string, newParentId: string | null) => {
      setState((prev) => {
          if (taskId === newParentId) return prev; 

          const task = prev.tasks.find(t => t.id === taskId);
          if (!task) return prev;

          let checkId = newParentId;
          while (checkId) {
              if (checkId === taskId) return prev; 
              const parent = prev.tasks.find(t => t.id === checkId);
              checkId = parent ? (parent.parentId || null) : null;
          }

          const oldParentId = task.parentId;
          const newParent = newParentId ? prev.tasks.find(t => t.id === newParentId) : null;
          
          let newPosition = task.position;
          if (newParent) {
              const siblings = prev.tasks.filter(t => t.parentId === newParentId && t.id !== taskId);
              const spacing = task.type === 'Goal' ? 400 : 200;
              let startY = newParent.position.y + (newParent.type === 'Milestone' ? 250 : spacing);
              
              if (siblings.length > 0) {
                  const maxSiblingY = Math.max(...siblings.map(s => s.position.y));
                  startY = maxSiblingY + spacing;
              }
              
              newPosition = {
                  x: newParent.position.x + (newParent.type === 'Milestone' ? 0 : 40),
                  y: startY
              };
          } else {
              const rootTasks = prev.tasks.filter(t => !t.parentId && t.id !== taskId);
              const maxY = rootTasks.length > 0 ? Math.max(...rootTasks.map(t => t.position.y)) : 0;
              newPosition = {
                  x: (1536 - 280) / 2, 
                  y: Math.max(600, maxY + 500)
              };
          }

          let updatedTasks = prev.tasks.map(t => {
              if (oldParentId && t.id === oldParentId) {
                  return { ...t, childrenIds: t.childrenIds?.filter(id => id !== taskId) };
              }
              if (newParentId && t.id === newParentId) {
                  return { ...t, childrenIds: [...(t.childrenIds || []), taskId] };
              }
              if (t.id === taskId) {
                  return { ...t, parentId: newParentId || undefined, position: newPosition };
              }
              return t;
          });

          if (oldParentId) {
              const oldChild = prev.tasks.find(t => t.parentId === oldParentId && t.id !== taskId);
              if (oldChild) {
                  updatedTasks = updateCascadingDates(updatedTasks, oldChild.id);
                  updatedTasks = updateCascadingStatus(updatedTasks, oldChild.id);
              }
          }
          
          updatedTasks = updateCascadingDates(updatedTasks, taskId);
          updatedTasks = updateCascadingStatus(updatedTasks, taskId);

          return { ...prev, tasks: updatedTasks };
      });
  }, []);

  const selectTask = useCallback((id: string | null, openModal: boolean = true) => {
    setState((prev) => ({ 
        ...prev, 
        selectedTaskId: id, 
        selectedTaskIds: id ? [id] : [],
        isModalOpen: id ? openModal : false 
    }));
  }, []);

  const selectTasks = useCallback((ids: string[]) => {
      setState(prev => ({
          ...prev,
          selectedTaskIds: ids,
          selectedTaskId: ids.length === 1 ? ids[0] : null, 
          isModalOpen: false 
      }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setScale = useCallback((scaleOrUpdater: number | ((p: number) => number)) => {
      setState(prev => ({
          ...prev, 
          scale: typeof scaleOrUpdater === 'function' ? scaleOrUpdater(prev.scale) : scaleOrUpdater
      }));
  }, []);
  
  const setFocusedParentId = useCallback((id: string | null) => {
      setState(prev => ({ ...prev, focusedParentId: id, selectedTaskId: null, selectedTaskIds: [], isModalOpen: false }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
      setState(prev => ({ ...prev, theme }));
  }, []);

  const setBackground = useCallback((background: BackgroundType) => {
      setState(prev => ({ ...prev, background }));
  }, []);

  const setFilter = useCallback((filter: FilterOption) => {
      setState(prev => ({ ...prev, filter }));
  }, []);
  
  const addTask = useCallback((task: Partial<TaskNode>) => {
      const id = `TASK-${Math.floor(Math.random() * 9000) + 1000}`;
      setState(prev => {
        let inferredType = task.type;
        
        if (!inferredType && task.parentId) {
            const parent = prev.tasks.find(t => t.id === task.parentId);
            if (parent) {
                switch(parent.type) {
                    case 'Milestone': inferredType = 'Goal'; break;
                    case 'Goal': inferredType = 'Epic'; break;
                    case 'Epic': inferredType = 'Story'; break;
                    case 'Story': inferredType = 'Issue'; break;
                    case 'Issue': inferredType = 'Sub-issue'; break;
                    default: inferredType = 'Issue';
                }
            }
        } else if (!inferredType) {
            inferredType = 'Milestone'; 
        }

        let calculatedPos = task.position;
        if (!calculatedPos) {
            if (task.parentId) {
                const parent = prev.tasks.find(t => t.id === task.parentId);
                if (parent) {
                    const siblings = prev.tasks.filter(t => t.parentId === parent.id);
                    let maxSiblingY = parent.position.y;
                    if (siblings.length > 0) {
                        maxSiblingY = Math.max(...siblings.map(s => s.position.y));
                    }
                    const spacing = inferredType === 'Goal' ? 400 : 200;
                    
                    calculatedPos = { 
                        x: parent.position.x + (parent.type === 'Milestone' ? 0 : 40), 
                        y: maxSiblingY + spacing
                    };
                } else {
                    calculatedPos = { x: 100, y: 100 }; 
                }
            } else {
                const rootTasks = prev.tasks.filter(t => !t.parentId);
                const maxY = rootTasks.length > 0 ? Math.max(...rootTasks.map(t => t.position.y)) : 0;
                calculatedPos = { 
                    x: (1536 - 280) / 2, 
                    y: Math.max(600, maxY + 500) 
                };
            }
        }

        const newTask: TaskNode = {
            id,
            title: 'New Item',
            description: 'Click to edit description...',
            status: 'Backlog',
            priority: 'Medium',
            type: inferredType as any,
            assignee: MOCK_ASSIGNEES[0], 
            startDate: new Date().toDateString(),
            dueDate: new Date().toDateString(),
            color: '#eab308', 
            position: calculatedPos,
            next: [],
            prev: [],
            childrenIds: [],
            history: [
                { id: Date.now().toString(), date: new Date().toISOString(), user: prev.currentUser.name, action: 'Created task', type: 'creation' }
            ],
            attachments: [],
            checklist: [], 
            cycleId: INITIAL_CYCLES[0].id, 
            ...task
        };

        if (!task.color) {
            if (newTask.type === 'Issue') newTask.color = '#eab308'; 
            if (newTask.type === 'Sub-issue') newTask.color = '#64748b'; 
            if (newTask.type === 'Milestone') newTask.color = '#ef4444'; 
            if (newTask.type === 'Goal') newTask.color = '#8b5cf6'; 
            if (newTask.type === 'Epic') newTask.color = '#10b981'; 
            if (newTask.type === 'Story') newTask.color = '#3b82f6'; 
        }

          let updatedTasks = [...prev.tasks, newTask];
          if (task.parentId) {
              updatedTasks = updatedTasks.map(t => {
                  if (t.id === task.parentId) {
                      return { ...t, childrenIds: [...(t.childrenIds || []), id] };
                  }
                  return t;
              });

              updatedTasks = updateCascadingDates(updatedTasks, id);
              updatedTasks = updateCascadingStatus(updatedTasks, id);
          }
          return {
            ...prev,
            tasks: updatedTasks,
            selectedTaskId: id,
            selectedTaskIds: [id],
            isModalOpen: true
          };
      });
      return id;
  }, []);

  const addPost = useCallback((post: Partial<UserPost>) => {
      setState(prev => {
        const newPost: UserPost = {
            id: `p-${Date.now()}`,
            author: prev.currentUser.name,
            role: prev.currentUser.role,
            time: 'Just now',
            content: '',
            likes: 0,
            comments: 0,
            shares: 0,
            tags: ['Update'],
            type: 'Update',
            ...post
        };
        return { ...prev, posts: [newPost, ...prev.posts] };
      });
  }, []);

  const addMember = useCallback((member: Partial<Assignee>) => {
      const newMember: Assignee = {
          id: `u-${Date.now()}`,
          name: 'New Member',
          initials: 'NM',
          color: 'bg-slate-500',
          type: 'user',
          ...member
      };
      setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
  }, []);

  const addFile = useCallback((file: Partial<FileItem>) => {
      const newFile: FileItem = {
          id: `f-${Date.now()}`,
          name: 'New File',
          type: 'File',
          size: '0 KB',
          date: new Date().toLocaleDateString(),
          icon: FileText, 
          color: 'text-slate-500',
          bg: 'bg-slate-500/10',
          ...file
      };
      setState(prev => ({ ...prev, files: [newFile, ...prev.files] }));
  }, []);

  return {
    ...state,
    setCurrentUser,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    duplicateTask,
    moveTask,
    selectTask,
    selectTasks,
    setViewMode,
    setScale,
    setFocusedParentId,
    setTheme,
    setBackground,
    setFilter,
    addPost,
    addMember,
    addFile,
    updateMember
  };
};
