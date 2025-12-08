
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plan } from './Plan';
import { Dashboard } from './Dashboard/page';
import { Header } from './Header';
import { CalendarPage } from './CalendarPage';
import { Members } from './Members';
import { Resources } from './Resources';
import { Community } from './Community';
import { About } from './About';
import { ProfilePage } from './ProfilePage';
import { MobileDock } from './MobileDock';
import { DocumentModal } from './DocumentModal/DocumentModal';
import { FilePreview } from './FilePreview';
import { Sidebar } from './Sidebar';
import { MobileViewSheet } from './MobileViewSheet';
import { CreationSheet } from './CreationSheet';
import { useStore } from '../store/useStore.tsx';
import type { Page, TaskNode, FilterOption, CalendarViewMode, MembersViewMode, ResourcesViewMode, CommunityViewMode, UserRole, Assignee, FileItem } from '../types';
import { SettingsPage } from './SettingsPage';
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AppContent: React.FC = () => {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const store = useStore();
  
  const { 
      theme, background, setTheme, setBackground, tasks, filter, setFilter, selectTask, focusedParentId, isModalOpen,
      selectedTaskId, sideSelectedTaskId, selectSideTask, closeSideTask, updateTask, onUpdateTaskConnections, addTask, deleteTask, duplicateTask, moveTask, viewMode, setViewMode, setFocusedParentId,
      posts, members, files, addPost, addMember, addFile, currentUser, setCurrentUser, resourcePath, setResourcePath, leaveProject,
      isStoreLoading, projectData, projectId, sideSelectedResource, selectSideResource, closeSideResource
  } = store;
  
  const [viewedProfile, setViewedProfile] = useState<Assignee | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isMainTaskFullScreen, setIsMainTaskFullScreen] = useState(false);


  // Lifted State for Mobile Overlays & Interactions
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isCreationSheetOpen, setIsCreationSheetOpen] = useState(false);
  


  // Lifted Page States
  const [currentPage, setPage] = useState<Page>('roadmap');
  const [dashboardView, setDashboardView] = useState<DashboardViewMode>('Personal');
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('Month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [membersView, setMembersView] = useState<MembersViewMode>('All');
  const [resourcesView, setResourcesView] = useState<ResourcesViewMode>('All');
  const [communityView, setCommunityView] = useState<CommunityViewMode>('All');

  // Role Based Access Control Check
  useEffect(() => {
      // Only run this check if data is loaded
      if (!isStoreLoading && currentUser.role === 'Visitor' && ['dashboard', 'calendar', 'members', 'resources'].includes(currentPage)) {
          setPage('about');
      }
  }, [currentUser.role, currentPage, isStoreLoading]);

  // Theme & Background Logic
  const isLightTheme = ['Light', 'Sephiroa', 'Green'].includes(theme);
  
  useEffect(() => {
      const root = document.documentElement;
      if (theme === 'Sephiroa') {
          root.style.setProperty('--brand-400', '242 180 90');
          root.style.setProperty('--brand-500', '234 157 52');
          root.style.setProperty('--brand-600', '205 133 38');
      } else if (theme === 'Green') {
          root.style.setProperty('--brand-400', '86 207 128');
          root.style.setProperty('--brand-500', '46 184 92');
          root.style.setProperty('--brand-600', '35 145 70');
      } else {
          root.style.setProperty('--brand-400', '56 189 248');
          root.style.setProperty('--brand-500', '14 165 233');
          root.style.setProperty('--brand-600', '2 132 199');
      }
  }, [theme]);

  const themeColor = useMemo(() => {
      switch(theme) {
          case 'Light': return 'bg-slate-50 text-slate-900'; 
          case 'Dark': return 'bg-[#09090b] text-slate-200';
          case 'Sephiroa': return 'bg-[#FDFCF0] text-[#3D3B29]';
          case 'Green': return 'bg-[#F0F5F0] text-[#264026]';
          case 'Blue': return 'bg-[#020817] text-slate-200';
          default: return 'bg-[#020617] text-slate-200';
      }
  }, [theme]);

  const bgClass = useMemo(() => {
      const dotColor = isLightTheme ? '#000000' : '#ffffff';
      const opacity = isLightTheme ? '0.1' : '0.15';
      
      switch(background) {
          case 'Dots': return `bg-[radial-gradient(${dotColor}_1px,transparent_1px)] [background-size:20px_20px] opacity-[${opacity}]`;
          case 'Grid': return `bg-[linear-gradient(to_right,${dotColor}_1px,transparent_1px),linear-gradient(to_bottom,${dotColor}_1px,transparent_1px)] [background-size:32px_32px] opacity-[${isLightTheme ? '0.05' : '0.1'}]`;
          case 'None': return 'opacity-0';
          default: return '';
      }
  }, [background, isLightTheme]);

  // Filter Logic for Header
  const filteredTasks = useMemo(() => {
      if (!currentUser || !tasks || !members) return [];
      
      switch(filter) {
          case 'Mine':
              return tasks.filter((t: TaskNode) => t.assignee?.uid === currentUser.id);
          
          case 'Team':
              const userTeam = members.find(m => m.uid === currentUser.id)?.teamName;
              if (!userTeam) return [];
              const teamMemberIds = members.filter(m => m.teamName === userTeam).map(m => m.uid);
              return tasks.filter((t: TaskNode) => t.assignee.type === 'team' ? t.assignee.displayName === userTeam : teamMemberIds.includes(t.assignee.uid));
  
          case 'Department':
              const userDepartment = members.find(m => m.uid === currentUser.id)?.department;
              if (!userDepartment) return [];
  
              // Get all teams and users within that department
              const departmentTeams = members.filter(m => m.parentId === userDepartment);
              const departmentTeamNames = departmentTeams.map(t => t.displayName);
              const departmentUserIds = members.filter(m => m.department === userDepartment).map(m => m.uid);
              
              return tasks.filter((t: TaskNode) => {
                  if (t.assignee.type === 'team') {
                      // Task is assigned to a team
                      return departmentTeamNames.includes(t.assignee.displayName) || t.assignee.displayName === userDepartment;
                  }
                  // Task is assigned to a user
                  return departmentUserIds.includes(t.assignee.uid);
              });
  
          case 'Project':
               return tasks.filter((t: TaskNode) => t.type === 'Milestone');
  
          default:
              return tasks;
      }
  }, [tasks, filter, currentUser, members]);
  

  const showHeader = !(isModalOpen && currentPage === 'roadmap');
  
  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);
  const sideSelectedTask = useMemo(() => tasks.find(t => t.id === sideSelectedTaskId), [tasks, sideSelectedTaskId]);

  const handleCloseSideResource = () => {
    closeSideResource();
    if(selectedTask) {
        setIsMainTaskFullScreen(true); 
    }
  };
  
  const handleCloseAllModals = () => {
    selectTask(null, false);
    closeSideTask();
    closeSideResource();
    setIsMainTaskFullScreen(false); // Reset fullscreen state
  };


  // --- Exclusive Toggle Logic ---
  const closeAllMenus = useCallback(() => {
      setIsSidebarOpen(false);
      setIsViewMenuOpen(false);
      setIsMobileTasksOpen(false);
      setIsMobileMenuOpen(false);
      setIsCreationSheetOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
      const target = !isSidebarOpen;
      closeAllMenus();
      setIsSidebarOpen(target);
  }, [isSidebarOpen, closeAllMenus]);

  const handleToggleViewMenu = useCallback(() => {
      const target = !isViewMenuOpen;
      closeAllMenus();
      setIsViewMenuOpen(target);
  }, [isViewMenuOpen, closeAllMenus]);

  const handleToggleTasks = useCallback(() => {
      const target = !isMobileTasksOpen;
      closeAllMenus();
      setIsMobileTasksOpen(target);
  }, [isMobileTasksOpen, closeAllMenus]);

  const handleToggleMenu = useCallback(() => {
      const target = !isMobileMenuOpen;
      closeAllMenus();
      setIsMobileMenuOpen(target);
  }, [isMobileMenuOpen, closeAllMenus]);

  const handleOpenCreation = useCallback(() => {
      const target = !isCreationSheetOpen;
      closeAllMenus();
      setIsCreationSheetOpen(target);
  }, [isCreationSheetOpen, closeAllMenus]);

  const handleViewProfile = (member: Assignee) => {
    setViewedProfile(member);
    setPage('profile');
  };

  const handleBackToMembers = () => {
      setViewedProfile(null);
      setPage('members');
  }

  const handleLeaveProject = async () => {
    if (!leaveProject) return;
    setIsLeaving(true);
    try {
        await leaveProject();
        toast({ title: "You have left the project." });
        router.push('/discover');
    } catch (error) {
        console.error("Failed to leave project:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not leave the project." });
    } finally {
        setIsLeaving(false);
    }
  };

  const isTrulyLoading = isAuthLoading || isStoreLoading;

  if (isTrulyLoading) {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#09090b] text-slate-400 gap-4">
            <Loader className="w-8 h-8 animate-spin text-brand-500" />
            <span>Loading Project...</span>
        </div>
    );
  }

  const isAnyModalOpen = isModalOpen || sideSelectedTask || sideSelectedResource;

  return (
    <main className={`w-screen h-screen flex flex-col overflow-hidden transition-colors duration-700 ${themeColor}`}>
        <div className={`fixed inset-0 pointer-events-none z-0 transition-all duration-700 ${bgClass}`} />

        {showHeader && (
            <Header 
                currentPage={currentPage} 
                setPage={setPage} 
                theme={theme}
                background={background}
                setTheme={setTheme}
                setBackground={setBackground}
                tasks={filteredTasks}
                filter={filter}
                setFilter={setFilter}
                selectTask={selectTask}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen} 
                isMobileTasksOpen={isMobileTasksOpen}
                setIsMobileTasksOpen={setIsMobileTasksOpen} 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
            />
        )}

        <div className={`flex-1 relative z-10 overflow-hidden ${!showHeader ? 'h-full' : ''}`}>
            {currentPage === 'roadmap' && (
                <Plan 
                    store={store} 
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isViewMenuOpen={isViewMenuOpen}
                    setIsViewMenuOpen={setIsViewMenuOpen}
                    onToggleViewMenu={handleToggleViewMenu}
                />
            )}
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'calendar' && (
                <CalendarPage 
                    tasks={store.tasks} 
                    theme={theme} 
                    onAddTask={(initialData) => addTask(initialData)}
                    view={calendarView}
                    date={calendarDate}
                    setDate={setCalendarDate}
                    setView={setCalendarView}
                    filter={filter}
                />
            )}
            {currentPage === 'members' && (
                <Members 
                    tasks={store.tasks} 
                    theme={theme} 
                    viewMode={membersView} 
                    members={members} 
                    onViewProfile={handleViewProfile}
                />
            )}
            {currentPage === 'resources' && <Resources />}
            {currentPage === 'community' && <Community />}
            {currentPage === 'profile' && <ProfilePage theme={theme} tasks={store.tasks} member={viewedProfile} onBack={handleBackToMembers}/>}
            {currentPage === 'about' && (
                <About 
                    theme={theme} 
                    currentUser={currentUser} 
                    onLeaveProject={handleLeaveProject} 
                    isLeaving={isLeaving}
                />
            )}
            {currentPage === 'settings' && <SettingsPage />}
        </div>

        {/* --- Root Level Mobile Sheets (High Z-Index) --- */}
        
        {/* 1. Mobile Sidebar Drawer */}
        <div className="lg:hidden">
            <Sidebar 
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                focusedParentId={focusedParentId}
                onSelect={selectTask}
                onAddChild={(parentId) => addTask({ parentId })}
                onFocus={setFocusedParentId}
                onAddRoot={() => addTask(focusedParentId ? { parentId: focusedParentId } : {})}
                onDelete={deleteTask}
                onDuplicate={duplicateTask}
                onMove={moveTask}
                theme={theme}
                background={background}
                setTheme={setTheme}
                setBackground={setBackground}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                
                currentPage={currentPage}
                calendarDate={calendarDate}
                setCalendarDate={setCalendarDate}
                
                membersView={membersView}
                setMembersView={setMembersView}
                resourcesView={resourcesView}
                setResourcesView={setResourcesView}
                communityView={communityView}
                setCommunityView={setCommunityView}
                resourcePath={resourcePath}
                setResourcePath={setResourcePath}
            />
        </div>

        {/* 2. Mobile View Switcher */}
        <MobileViewSheet 
            viewMode={viewMode}
            setViewMode={setViewMode}
            isOpen={isViewMenuOpen}
            onClose={() => setIsViewMenuOpen(false)}
            theme={theme}
            currentPage={currentPage}
            dashboardView={dashboardView}
            setDashboardView={setDashboardView}
            calendarView={calendarView}
            setCalendarView={setCalendarView}
            membersView={membersView}
            setMembersView={setMembersView}
            resourcesView={resourcesView}
            setResourcesView={setResourcesView}
            communityView={communityView}
            setCommunityView={setCommunityView}
            setFilter={setFilter}
        />

        {/* 3. Global Creation Sheet (Only show if allowed) */}
        {currentUser.role !== 'Visitor' && (
            <CreationSheet 
                isOpen={isCreationSheetOpen}
                onClose={() => setIsCreationSheetOpen(false)}
                currentPage={currentPage}
                theme={theme}
                onCreateTask={() => addTask(focusedParentId ? { parentId: focusedParentId } : {})}
                onAddPost={addPost}
                onAddMember={addMember}
                onAddFile={addFile}
            />
        )}

        {/* 4. Global Mobile Bottom Dock */}
        <MobileDock 
            currentPage={currentPage}
            viewMode={viewMode}
            setPage={setPage}
            setViewMode={setViewMode}
            onToggleSidebar={handleToggleSidebar}
            onToggleViewMenu={handleToggleViewMenu}
            onToggleMobileTasks={handleToggleTasks}
            onToggleMobileMenu={handleToggleMenu}
            onAddTask={handleOpenCreation} 
            isSidebarOpen={isSidebarOpen}
            isViewMenuOpen={isViewMenuOpen}
            theme={theme}
        />

        {/* Global Document Modal Container */}
        {isAnyModalOpen && (
          <div
            className={cn("fixed inset-0 z-[100] p-0 lg:p-4 flex items-center justify-center", !isMainTaskFullScreen && "bg-black/60 backdrop-blur-sm")}
            onClick={handleCloseAllModals}
          >
             <div className={cn(
                  "relative w-full flex items-center justify-center h-full lg:h-[90vh]",
                  !isMainTaskFullScreen && "lg:max-w-7xl",
              )}>
                
                {selectedTask && (
                   <div
                     className={cn(
                       'h-full w-full transition-all duration-300',
                       (sideSelectedTask || sideSelectedResource) ? 'lg:w-1/2' : 'lg:w-full',
                     )}
                   >
                    <DocumentModal
                      task={selectedTask}
                      tasks={tasks}
                      currentUser={currentUser}
                      onClose={handleCloseAllModals}
                      onUpdate={(id, updates) => updateTask(id, updates)}
                      onAddSubTask={(taskData) => addTask(taskData)}
                      onUpdateTaskConnections={onUpdateTaskConnections}
                      theme={theme}
                      projectId={projectId}
                      isSideView={!!sideSelectedTask || !!sideSelectedResource}
                      isFullScreen={isMainTaskFullScreen}
                      setIsFullScreen={setIsMainTaskFullScreen}
                      selectSideResource={(file) => {
                         const fullFile = files.find(f => f.id === file.id);
                         if(fullFile) selectSideResource(fullFile);
                      }}
                      onUpdateAttachments={(newAttachment) => {
                        if (selectedTask) {
                            const currentAttachments = selectedTask.attachments || [];
                            // Prevent duplicates
                            if (!currentAttachments.some(att => att.id === newAttachment.id)) {
                                updateTask(selectedTask.id, {
                                    attachments: [...currentAttachments, newAttachment]
                                });
                            }
                        }
                      }}
                      onDetachResource={(resourceId) => {
                            if (selectedTask) {
                                const updatedAttachments = (selectedTask.attachments || []).filter(att => att.id !== resourceId);
                                updateTask(selectedTask.id, { attachments: updatedAttachments });
                            }
                            if (sideSelectedResource?.id === resourceId) {
                                closeSideResource();
                            }
                       }}
                    />
                  </div>
                )}
                
                {sideSelectedTask && (
                  <div className="hidden lg:block w-1/2 h-full" onClick={(e) => e.stopPropagation()}>
                    <DocumentModal
                      task={sideSelectedTask}
                      tasks={tasks}
                      currentUser={currentUser}
                      onClose={closeSideTask}
                      onUpdate={(id, updates) => updateTask(id, updates)}
                      onAddSubTask={(taskData) => addTask(taskData)}
                      onUpdateTaskConnections={onUpdateTaskConnections}
                      theme={theme}
                      projectId={projectId}
                      isSideView={true}
                    />
                  </div>
                )}

                {sideSelectedResource && (
                   <div className="hidden lg:block w-1/2 h-full" onClick={(e) => e.stopPropagation()}>
                       <FilePreview 
                           file={sideSelectedResource}
                           onClose={handleCloseSideResource}
                           theme={theme}
                           isSideView={true}
                           attachments={selectedTask?.attachments || []}
                           onSelectAttachment={(attachment) => {
                                const fullFile = files.find(f => f.id === attachment.id);
                                if (fullFile) selectSideResource(fullFile);
                           }}
                            onUpdateAttachments={(newAttachment) => {
                                if (selectedTask) {
                                    const currentAttachments = selectedTask.attachments || [];
                                    if (!currentAttachments.some(att => att.id === newAttachment.id)) {
                                        updateTask(selectedTask.id, {
                                            attachments: [...currentAttachments, newAttachment]
                                        });
                                    }
                                }
                            }}
                            onDetachResource={(resourceId) => {
                                if (selectedTask) {
                                    const updatedAttachments = (selectedTask.attachments || []).filter(att => att.id !== resourceId);
                                    updateTask(selectedTask.id, { attachments: updatedAttachments });
                                }
                                if (sideSelectedResource?.id === resourceId) {
                                    closeSideResource();
                                }
                           }}
                       />
                   </div>
                )}
            </div>
          </div>
        )}
    </main>
  );
};
