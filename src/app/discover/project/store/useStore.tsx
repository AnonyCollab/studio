
'use client';

import { useState, useCallback, useMemo, useEffect, createContext, useContext, ReactNode } from 'react';
import { AppState, TaskNode, ViewMode, Status, Priority, Theme, BackgroundType, FilterOption, HistoryEntry, UserPost, Assignee, FileItem, CurrentUser, UserRole, Project, DashboardViewMode } from '../types';
import { MOCK_ASSIGNEES, INITIAL_CYCLES, MOCK_POSTS } from '../constants';
import { User } from 'firebase/auth';
import { useCollection, useFirestore, useMemoFirebase, useDoc, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, serverTimestamp, addDoc, writeBatch, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { errorEmitter, FirestorePermissionError } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface ExtendedAppState extends AppState {
  focusedParentId: string | null;
  setTheme: (theme: Theme) => void;
  setBackground: (bg: BackgroundType) => void;
  setFilter: (filter: FilterOption) => void;
  setCurrentUser: (user: CurrentUser) => void;
  updateMember: (id: string, updates: Partial<Assignee>) => void;
  removeMember: (memberId: string) => Promise<void>;
  addMember: (member: Partial<Assignee>) => void;
  setResourcePath: (path: (string | null)[]) => void;
  addFile: (file: Partial<FileItem>) => void;
  addTask: (task: Partial<TaskNode>) => string;
  updateTask: (id: string, updates: Partial<TaskNode>) => void;
  onUpdateTaskConnections: (startId: string, targetId: string) => void;
  deleteTask: (id: string) => void;
  leaveProject?: () => Promise<void>;
  setTasks: (tasks: TaskNode[] | ((prev: TaskNode[]) => TaskNode[])) => void;
  selectTasks: (ids: string[]) => void;
  setFocusedParentId: (id: string | null) => void;
  setDashboardView: (view: DashboardViewMode) => void;
  duplicateTask: (id: string) => void;
  moveTask: (taskId: string, newParentId: string | null) => void;
  drillDownStack: string[];
  setDrillDownStack: (stack: string[] | ((prev: string[]) => string[])) => void;
  projectData: Project | null;
  projectId: string | null;
  updateProject: (updates: Partial<Project>) => void;
  isStoreLoading: boolean;
}

const createDefaultUser = (authUser: User | null): CurrentUser => {
    if (!authUser) {
        return {
            id: 'guest',
            displayName: 'Guest',
            initials: 'G',
            role: 'Visitor',
            avatarColor: 'bg-slate-500',
        };
    }
    return {
        id: authUser.uid,
        displayName: authUser.displayName || 'Anonymous User',
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
    dashboardView: 'Personal',
    scale: 1,
    focusedParentId: null,
    theme: 'Dark',
    background: 'Dots',
    filter: 'Project',
    resourcePath: [null], // Start at the root
    drillDownStack: [],
    projectData: null,
    projectId: null,
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

const ProjectStoreContext = createContext<ExtendedAppState | null>(null);

export const useStore = (): ExtendedAppState => {
    const context = useContext(ProjectStoreContext);
    if (!context) {
        throw new Error('useStore must be used within a ProjectStoreProvider');
    }
    return context;
};

export const ProjectStoreProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const { user: authUser, isUserLoading: isAuthUserLoading } = useUser();
    const params = useParams();
    const router = useRouter();
    const projectId = typeof params.projectId === 'string' ? params.projectId : null;

    const [state, setState] = useState<AppState>(() => createInitialState(authUser));
    const firestore = useFirestore();

    const projectDocQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return doc(firestore, 'projects', projectId);
    }, [firestore, projectId]);
    
    const { data: projectData, isLoading: isProjectLoading } = useDoc<Project>(projectDocQuery);
    
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

    const membersQuery = useMemoFirebase(() => {
        if (!firestore || !projectId) return null;
        return collection(firestore, 'projects', projectId, 'members');
    }, [firestore, projectId]);
    
    const { data: membersData, isLoading: isMembersLoading } = useCollection<Assignee>(membersQuery);

    const isStoreLoading = isProjectLoading || isMembersLoading || isTasksLoading || isFilesLoading || isAuthUserLoading;

    useEffect(() => {
        setState(prev => ({...prev, projectData: projectData || null, projectId }));
    }, [projectData, projectId]);

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

    useEffect(() => {
        if (isProjectLoading || isMembersLoading || isAuthUserLoading) {
            return;
        }
    
        if (!projectData || !authUser) {
            if(!isProjectLoading && !projectData) {
                // router.push('/discover'); 
            }
            return;
        }

        let userRole: UserRole = 'Visitor';
        if (projectData.owner?.uid === authUser.uid) {
            userRole = 'Owner';
        } else {
            const memberInfo = membersData?.find(m => m.uid === authUser.uid);
            userRole = (memberInfo?.role as UserRole) || 'Visitor';
        }

        setState(prev => ({
            ...prev,
            members: membersData ? membersData.map(m => ({
                ...m,
                id: m.uid,
                type: m.type || 'user',
                color: m.color || 'bg-blue-500',
                initials: (m.displayName || '?').charAt(0)
            })) : [],
            currentUser: {
                ...prev.currentUser,
                id: authUser.uid,
                displayName: authUser.displayName || prev.currentUser.displayName,
                initials: (authUser.displayName || prev.currentUser.initials || '??').slice(0, 2).toUpperCase(),
                role: userRole,
            }
        }));
    }, [projectData, membersData, authUser, isProjectLoading, isMembersLoading, isAuthUserLoading]);


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
    if (!firestore || !projectId) return;
    const memberRef = doc(firestore, 'projects', projectId, 'members', id);
    updateDocumentNonBlocking(memberRef, updates);
  }, [firestore, projectId]);
  
    const removeMember = useCallback(async (memberId: string) => {
        if (!firestore || !projectId || !memberId) throw new Error("Not initialized or memberId missing");

        const batch = writeBatch(firestore);
        const projectRef = doc(firestore, 'projects', projectId);
        const memberRef = doc(firestore, 'projects', projectId, 'members', memberId);

        batch.update(projectRef, {
            members: arrayRemove(memberId),
            totalMembers: increment(-1),
        });
        batch.delete(memberRef);

        await batch.commit();
    }, [firestore, projectId]);

  const setResourcePath = useCallback((path: (string | null)[]) => {
      setState(prev => ({ ...prev, resourcePath: path }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<TaskNode>) => {
    if (!firestore || !projectId) return;

    const originalTask = state.tasks.find(t => t.id === id);
    if (!originalTask) return;

    const taskRef = doc(firestore, 'projects', projectId, 'tasks', id);

    let historyMessage = '';
    const updatedKeys = Object.keys(updates);
    if (updatedKeys.length === 1) {
        const key = updatedKeys[0] as keyof TaskNode;
        const oldValue = originalTask[key];
        const newValue = updates[key];
        if (oldValue !== newValue) {
            if (key === 'assignee') {
                historyMessage = `changed assignee to **${(newValue as Assignee).displayName}**`;
            } else if (key === 'status') {
                historyMessage = `changed status from **${oldValue}** to **${newValue}**`;
            } else if (key === 'priority') {
                historyMessage = `changed priority from **${oldValue}** to **${newValue}**`;
            } else if (key === 'dueDate' || key === 'startDate') {
                historyMessage = `updated ${key} to **${newValue}**`;
            }
        }
    }

    const finalUpdates = { ...updates };
    if (historyMessage) {
        const newHistoryEntry: HistoryEntry = {
            id: uuidv4(),
            date: new Date().toISOString(),
            user: state.currentUser.displayName || 'System',
            action: historyMessage,
            type: 'update',
        };
        finalUpdates.history = arrayUnion(newHistoryEntry);
    }
    
    updateDocumentNonBlocking(taskRef, finalUpdates);

    // Apply cascading updates locally for immediate UI feedback
     setState(prev => {
        let tempTasks = prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t);
        if (updates.startDate || updates.dueDate || updates.status) {
            tempTasks = updateCascadingDates(tempTasks, id);
            tempTasks = updateCascadingStatus(tempTasks, id);
        }
        return { ...prev, tasks: tempTasks };
    });
  }, [firestore, projectId, state.tasks, state.currentUser.displayName]);

  const onUpdateTaskConnections = useCallback((startId: string, targetId: string) => {
    if (!firestore || !projectId) return;

    const batch = writeBatch(firestore);
    const startRef = doc(firestore, 'projects', projectId, 'tasks', startId);
    const targetRef = doc(firestore, 'projects', projectId, 'tasks', targetId);

    batch.update(startRef, { next: arrayUnion(targetId) });
    batch.update(targetRef, { prev: arrayUnion(startId) });
    
    batch.commit().catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: `batch write for connections`,
            operation: 'update',
        }));
    });
  }, [firestore, projectId]);

  const updateProject = useCallback((updates: Partial<Project>) => {
    if (!firestore || !projectId) return;
    const projectRef = doc(firestore, 'projects', projectId);
    updateDocumentNonBlocking(projectRef, updates);
  }, [firestore, projectId]);


  const deleteTask = useCallback((id: string) => {
    if (!firestore || !projectId) return;

    setState(prev => {
        const tasksToDelete = new Set<string>();
        const queue = [id];
        tasksToDelete.add(id);

        // Recursively find all children
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const task = prev.tasks.find(t => t.id === currentId);
            if (task && task.childrenIds) {
                task.childrenIds.forEach(childId => {
                    if (!tasksToDelete.has(childId)) {
                        tasksToDelete.add(childId);
                        queue.push(childId);
                    }
                });
            }
        }

        // Perform Firestore deletions in a batch
        const batch = writeBatch(firestore);
        tasksToDelete.forEach(taskId => {
            const taskRef = doc(firestore, 'projects', projectId, 'tasks', taskId);
            batch.delete(taskRef);
        });

        // Non-blocking commit
        batch.commit().catch(error => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `batch delete on tasks`,
                operation: 'delete'
            }));
        });

        // Update local state immediately
        const newTasks = prev.tasks.filter(t => !tasksToDelete.has(t.id));
        
        // Also remove the deleted task ID from its former parent
        const deletedTask = prev.tasks.find(t => t.id === id);
        if (deletedTask?.parentId) {
            return {
                ...prev,
                tasks: newTasks.map(t => 
                    t.id === deletedTask.parentId
                        ? { ...t, childrenIds: t.childrenIds?.filter(childId => childId !== id) }
                        : t
                ),
            };
        }

        return { ...prev, tasks: newTasks };
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
  
  const setDashboardView = useCallback((view: DashboardViewMode) => {
    setState(prev => ({ ...prev, dashboardView: view }));
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
    
    const unassignedUser = state.members.find(m => m.displayName === 'Unassigned') || MOCK_ASSIGNEES[0];

    const newTask: Omit<TaskNode, 'id'> = {
        title: 'New Item',
        description: 'Click to edit description...',
        status: 'Backlog',
        priority: 'Medium',
        type: inferredType,
        assignee: unassignedUser,
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
}, [firestore, projectId, state.tasks, state.members]);


  const addFile = useCallback((file: Partial<FileItem>) => {
    if (!firestore || !projectId) return;
    const resourcesCollection = collection(firestore, 'projects', projectId, 'resources');
    
    console.log("Creating folder with data:", file);
    const newFileDoc = {
      ...file,
      createdAt: serverTimestamp(),
      parentId: state.resourcePath[state.resourcePath.length - 1],
    };

    addDoc(resourcesCollection, newFileDoc)
      .then((docRef) => {
        console.log("Folder stored successfully in database! Document ID:", docRef.id);
      })
      .catch(error => {
        const permissionError = new FirestorePermissionError({
          path: resourcesCollection.path,
          operation: 'create',
          requestResourceData: newFileDoc,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error adding document, emitting permission error:", error);
      });
  }, [firestore, projectId, state.resourcePath]);

  const leaveProject = useCallback(async () => {
    if (!firestore || !projectId || !authUser) throw new Error("Not initialized");

    const batch = writeBatch(firestore);
    const projectRef = doc(firestore, 'projects', projectId);
    const memberRef = doc(firestore, 'projects', projectId, 'members', authUser.uid);

    batch.update(projectRef, {
      members: arrayRemove(authUser.uid),
      totalMembers: increment(-1),
    });
    batch.delete(memberRef);

    await batch.commit();
  }, [firestore, projectId, authUser]);

  const addMember = useCallback((member: Partial<Assignee>) => {
    if (!firestore || !projectId) return;

    if (member.type === 'team') {
        const newTeamId = uuidv4();
        const teamDoc: Assignee = {
            id: newTeamId,
            uid: newTeamId,
            name: member.name || 'New Team',
            displayName: member.name || 'New Team',
            initials: (member.name || 'NT').substring(0, 2).toUpperCase(),
            type: 'team',
            color: member.color || 'bg-gray-500',
            role: 'Member', // Teams are just members for now
            parentId: member.parentId || null
        };
        const memberRef = doc(firestore, 'projects', projectId, 'members', newTeamId);
        setDocumentNonBlocking(memberRef, teamDoc, {});
    } else {
    }
  }, [firestore, projectId]);
  
  const addPost = useCallback((post: Partial<UserPost>) => {}, []);
  const setTasks = useCallback((tasksOrUpdater: TaskNode[] | ((prev: TaskNode[]) => TaskNode[])) => {
    const newTasks = typeof tasksOrUpdater === 'function' ? tasksOrUpdater(state.tasks) : tasksOrUpdater;
    setState(prev => ({ ...prev, tasks: newTasks }));
  }, [state.tasks]);
  const selectTasks = useCallback((ids: string[]) => {
      setState(prev => ({...prev, selectedTaskIds: ids}));
  }, []);
  const setFocusedParentId = useCallback((id: string | null) => {
    setState(p => ({ ...p, focusedParentId: id, drillDownStack: [], filter: 'Project', searchQuery: '' }));
  }, []);
  const setDrillDownStack = useCallback((stack: string[] | ((prev: string[]) => string[])) => {
    setState(p => ({...p, drillDownStack: typeof stack === 'function' ? stack(p.drillDownStack) : stack}));
  }, []);
  const duplicateTask = useCallback((id: string) => {}, []);
  const moveTask = useCallback((taskId: string, newParentId: string | null) => {}, []);
   
  const storeValue = useMemo(() => ({
    ...state,
    setCurrentUser,
    setTasks,
    addTask,
    updateTask,
    onUpdateTaskConnections,
    deleteTask,
    duplicateTask,
    moveTask,
    selectTask,
    selectTasks,
    setViewMode: (mode: ViewMode) => setState(p => ({...p, viewMode: mode})),
    setDashboardView,
    setScale: (scale: number | ((p: number) => number)) => setState(p => ({...p, scale: typeof scale === 'function' ? scale(p.scale) : scale})),
    setFocusedParentId,
    setTheme,
    setBackground,
    setFilter,
    addPost,
    addMember,
    removeMember,
    addFile,
    updateMember,
    setResourcePath,
    setDrillDownStack,
    leaveProject,
    updateProject,
    isStoreLoading,
  }), [
      state, setCurrentUser, setTasks, addTask, updateTask, onUpdateTaskConnections, deleteTask, duplicateTask, moveTask, 
      selectTask, selectTasks, setFocusedParentId, setTheme, setBackground, setFilter, setDashboardView,
      addPost, addMember, removeMember, addFile, updateMember, setResourcePath, setDrillDownStack, 
      leaveProject, updateProject, isStoreLoading
  ]);

  return (
    <ProjectStoreContext.Provider value={storeValue}>
        {children}
    </ProjectStoreContext.Provider>
  )
};
