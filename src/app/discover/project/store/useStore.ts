
'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AppState, TaskNode, ViewMode, Status, Priority, Theme, BackgroundType, FilterOption, HistoryEntry, UserPost, Assignee, FileItem, CurrentUser, UserRole } from '../types';
import { MOCK_ASSIGNEES, INITIAL_CYCLES, MOCK_POSTS } from '../constants';
import { User } from 'firebase/auth';
import { useCollection, useFirestore, useMemoFirebase, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, serverTimestamp, addDoc, writeBatch, deleteDoc, updateDoc } from 'firebase/firestore';

export interface ExtendedAppState extends AppState {
  focusedParentId: string | null;
  setTheme: (theme: Theme) => void;
  setBackground: (bg: BackgroundType) => void;
  setFilter: (filter: FilterOption) => void;
  setCurrentUser: (user: CurrentUser) => void;
  updateMember: (id: string, updates: Partial<Assignee>) => void;
  setResourcePath: (path: (string | null)[]) => void;
  addFile: (file: Partial<FileItem>) => void;
  addTask: (task: Partial<TaskNode>) => string;
  updateTask: (id: string, updates: Partial<TaskNode>) => void;
  deleteTask: (id: string) => void;
}

const createDefaultUser = (authUser: User | null): CurrentUser => {
    if (!authUser) {
        return {
            id: 'guest',
            name: 'Guest',
            initials: 'G',
            role: 'Visitor',
            avatarColor: 'bg-slate-500',
        };
    }
    return {
        id: authUser.uid,
        name: authUser.displayName || 'Anonymous User',
        initials: (authUser.displayName || 'AU').slice(0, 2).toUpperCase(),
        role: 'Visitor', // Start as visitor, role will be determined after project data loads
        avatarColor: 'bg-blue-500', // This could also be generated
        teamName: 'Frontend Team', // Placeholder
    };
};

const createInitialState = (authUser: User | null): AppState => ({
    currentUser: createDefaultUser(authUser),
    tasks: [],
    cycles: INITIAL_CYCLES,
    posts: MOCK_POSTS,
    members: [], // Initialize as empty
    files: [],
    selectedTaskId: null,
    selectedTaskIds: [],
    isModalOpen: false,
    viewMode: 'canvas',
    scale: 1,
    focusedParentId: null,
    theme: 'Dark',
    background: 'Dots',
    filter: 'Project',
    resourcePath: [null], // Start at the root
});

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

export const useStore = (authUser: User | null, projectId: string | null): ExtendedAppState => {
    const [state, setState] = useState<AppState>(() => createInitialState(authUser));
    const firestore = useFirestore();

    const projectDocQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return doc(firestore, 'projects', projectId);
    }, [firestore, projectId]);
    
    const { data: projectData, isLoading: isProjectLoading } = useDoc(projectDocQuery);
    
    const resourcesQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return collection(firestore, 'projects', projectId, 'resources');
    }, [firestore, projectId]);
    
    const { data: filesData, error: filesError, isLoading: isFilesLoading } = useCollection<FileItem>(resourcesQuery);
    
    const tasksQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return collection(firestore, 'projects', projectId, 'tasks');
    }, [firestore, projectId]);

    const { data: tasksData, error: tasksError, isLoading: isTasksLoading } = useCollection<TaskNode>(tasksQuery);

    useEffect(() => {
        if (isTasksLoading) return;
        if (tasksData) {
            setState(prev => ({...prev, tasks: tasksData}));
        } else if (tasksError) {
             console.error("Error fetching tasks:", tasksError);
        } else {
            setState(prev => ({...prev, tasks: []}));
        }
    }, [tasksData, tasksError, isTasksLoading]);


    useEffect(() => {
        if (isFilesLoading) return;
        if (filesData) {
            setState(prev => ({...prev, files: filesData}));
        } else if (filesError) {
             console.error("Error fetching resources:", filesError);
        } else {
            setState(prev => ({...prev, files: []}));
        }
    }, [filesData, filesError, isFilesLoading]);


    const membersQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return collection(firestore, 'projects', projectId, 'members');
    }, [firestore, projectId]);
    
    const { data: membersData, isLoading: isMembersLoading } = useCollection<Assignee>(membersQuery);


    useEffect(() => {
      if (isProjectLoading || isMembersLoading || !projectData || !membersData) {
          return;
      }
      
      let userRole: UserRole = 'Visitor';
      let teamName: string | undefined = undefined;

      if (authUser) {
        
        const member = membersData.find(m => m.id === authUser.uid);

        if (projectData.owner.uid === authUser.uid) {
            userRole = 'Owner';
        } else if (member) {
            userRole = (member.role || 'Member') as UserRole;
        }

        const team = membersData.find(m => m.id === member?.teamId);
        if (team) {
            teamName = team.name;
        }

        setState(prev => ({
          ...prev,
          members: membersData.map(m => ({
              ...m,
              type: m.type || 'user',
              color: m.color || 'bg-blue-500',
              initials: (m.displayName || '?').charAt(0)
          })),
          currentUser: {
            ...prev.currentUser,
            id: authUser.uid,
            name: authUser.displayName || prev.currentUser.name,
            initials: (authUser.displayName || prev.currentUser.initials).slice(0, 2).toUpperCase(),
            role: userRole,
            teamName: teamName
          }
        }));
      } else if (!authUser) {
          setState(prev => ({...prev, currentUser: createDefaultUser(null)}));
      }
    }, [projectData, membersData, authUser, isProjectLoading, isMembersLoading]);


    useEffect(() => {
        const localTheme = localStorage.getItem('omnicanvas-theme');
        const localBg = localStorage.getItem('omnicanvas-bg');
        if (localTheme) setState(prev => ({...prev, theme: localTheme as Theme}));
        if (localBg) setState(prev => ({...prev, background: localBg as BackgroundType}));
    }, []);

    const setCurrentUser = useCallback((user: CurrentUser) => {
      setState(prev => ({ ...prev, currentUser: user }));
    }, []);

  const updateMember = useCallback((id: string, updates: Partial<Assignee>) => {
    setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === id ? { ...m, ...updates } : m)
    }))
  }, []);

  const setResourcePath = useCallback((path: (string | null)[]) => {
      setState(prev => ({ ...prev, resourcePath: path }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskNode>) => {
    if (!firestore || !projectId) return;
    const taskRef = doc(firestore, 'projects', projectId, 'tasks', id);
    // Non-blocking update
    updateDocumentNonBlocking(taskRef, updates);

    // Apply cascading updates locally for immediate UI feedback
     setState(prev => {
        let tempTasks = prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        if (updates.startDate || updates.dueDate || updates.status) {
            tempTasks = updateCascadingDates(tempTasks, id);
            tempTasks = updateCascadingStatus(tempTasks, id);
        }
        return { ...prev, tasks: tempTasks };
    });
  }, [firestore, projectId]);

  const deleteTask = useCallback((id: string) => {
    if (!firestore || !projectId) return;
    const taskRef = doc(firestore, 'projects', projectId, 'tasks', id);
    deleteDocumentNonBlocking(taskRef);
     setState(prev => {
        const tasks = prev.tasks.filter(t => t.id !== id);
        return { ...prev, tasks };
     });
  }, [firestore, projectId]);

  const selectTask = useCallback((id: string | null, openModal: boolean = true) => {
    setState((prev) => ({ 
        ...prev, 
        selectedTaskId: id, 
        selectedTaskIds: id ? [id] : [],
        isModalOpen: id ? openModal : false 
    }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
      localStorage.setItem('omnicanvas-theme', theme);
      setState(prev => ({ ...prev, theme }));
  }, []);

  const setBackground = useCallback((background: BackgroundType) => {
      localStorage.setItem('omnicanvas-bg', background);
      setState(prev => ({ ...prev, background }));
  }, []);

  const setFilter = useCallback((filter: FilterOption) => {
      setState(prev => ({ ...prev, filter }));
  }, []);
  
  const addTask = useCallback((task: Partial<TaskNode>): string => {
    if (!firestore || !projectId) return '';
    const id = doc(collection(firestore, 'projects', projectId, 'tasks')).id;
    
    let inferredType: TaskNode['type'] = task.type || 'Issue';
    if (!task.type && task.parentId) {
      const parent = state.tasks.find(t => t.id === task.parentId);
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
    } else if (!task.type) {
        inferredType = 'Milestone';
    }
    
    const newTask: Omit<TaskNode, 'id'> = {
        title: 'New Item',
        description: 'Click to edit description...',
        status: 'Backlog',
        priority: 'Medium',
        type: inferredType,
        assignee: MOCK_ASSIGNEES[0],
        startDate: new Date().toDateString(),
        dueDate: new Date().toDateString(),
        color: '#eab308',
        position: { x: 100, y: 100 },
        next: [], prev: [],
        ...task
    };

    const taskRef = doc(firestore, 'projects', projectId, 'tasks', id);
    setDocumentNonBlocking(taskRef, { id, ...newTask }, { merge: false });
    
    if (task.parentId) {
        const parentRef = doc(firestore, 'projects', projectId, 'tasks', task.parentId);
        updateDocumentNonBlocking(parentRef, {
            childrenIds: arrayUnion(id)
        });
    }

    setState(prev => ({ ...prev, selectedTaskId: id, isModalOpen: true }));
    return id;
}, [firestore, projectId, state.tasks]);


  const addFile = useCallback((file: Partial<FileItem>) => {
    if (!firestore || !projectId) return;
    const resourcesCollection = collection(firestore, 'projects', projectId, 'resources');
    
    const newFileDoc = {
      ...file,
      createdAt: serverTimestamp(),
      parentId: state.resourcePath[state.resourcePath.length - 1],
    };

    console.log("Creating folder with data:", newFileDoc);

    addDoc(resourcesCollection, newFileDoc)
      .then((docRef) => {
        console.log("Folder stored successfully in database! Document ID:", docRef.id);
      })
      .catch(error => {
        console.error("Error adding document, emitting permission error:", error);
      });
  }, [firestore, projectId, state.resourcePath]);

  // Dummy/Placeholder functions that need Firestore integration
  const addPost = useCallback((post: Partial<UserPost>) => {}, []);
  const addMember = useCallback((member: Partial<Assignee>) => {}, []);
  const setTasks = useCallback((tasksOrUpdater: TaskNode[] | ((prev: TaskNode[]) => TaskNode[])) => {}, []);
  const selectTasks = useCallback((ids: string[]) => {}, []);
  const setFocusedParentId = useCallback((id: string | null) => {}, []);
  const duplicateTask = useCallback((id: string) => {}, []);
  const moveTask = useCallback((taskId: string, newParentId: string | null) => {}, []);

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
    setViewMode: (mode: ViewMode) => setState(p => ({...p, viewMode: mode})),
    setScale: (scale: number | ((p: number) => number)) => setState(p => ({...p, scale: typeof scale === 'function' ? scale(p.scale) : scale})),
    setFocusedParentId,
    setTheme,
    setBackground,
    setFilter,
    addPost,
    addMember,
    addFile,
    updateMember,
    setResourcePath,
  };
};

    