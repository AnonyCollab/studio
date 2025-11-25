
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plan } from './Plan';
import { Dashboard } from './Dashboard';
import { Header } from './Header';
import { CalendarPage } from './CalendarPage';
import { Members } from './Members';
import { Resources } from './Resources';
import { Community } from './Community';
import { About } from './About';
import { ProfilePage } from './ProfilePage';
import { MobileDock } from './MobileDock';
import { DocumentModal } from './DocumentModal/DocumentModal';
import { Sidebar } from './Sidebar';
import { MobileViewSheet } from './MobileViewSheet';
import { CreationSheet } from './CreationSheet';
import { useStore } from '../store/useStore';
import { Page, TaskNode, FilterOption, CalendarViewMode, MembersViewMode, ResourcesViewMode, CommunityViewMode, DashboardViewMode, UserRole, Assignee } from '../types';
import { SettingsPage } from './SettingsPage';
import { useUser } from '@/firebase';
import { useParams } from 'next/navigation';

const App: React.FC = () => {
  const { user: authUser, isUserLoading } = useUser();
  const params = useParams();
  const projectId = typeof params.projectId === 'string' ? params.projectId : null;

  const store = useStore(authUser, projectId);
  
  const { 
      theme, background, setTheme, setBackground, tasks, filter, setFilter, selectTask, focusedParentId, isModalOpen,
      selectedTaskId, updateTask, addTask, deleteTask, duplicateTask, moveTask, viewMode, setViewMode, setFocusedParentId,
      posts, members, files, addPost, addMember, addFile, currentUser, setCurrentUser, resourcePath, setResourcePath
  } = store;
  
  const [currentPage, setPage] = useState<Page>('roadmap');
  const [viewedProfile, setViewedProfile] = useState<Assignee | null>(null);

  // Lifted State for Mobile Overlays & Interactions
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileTasksOpen, setIsMobileTasksOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const [isCreationSheetOpen, setIsCreationSheetOpen] = useState(false);

  // Lifted Page States
  const [dashboardView, setDashboardView] = useState<DashboardViewMode>('Personal');
  const [calendarView, setCalendarView] = useState<CalendarViewMode>('Month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [membersView, setMembersView] = useState<MembersViewMode>('All');
  const [resourcesView, setResourcesView] = useState<ResourcesViewMode>('All');
  const [communityView, setCommunityView] = useState<CommunityViewMode>('All');

  // Role Based Access Control Check
  useEffect(() => {
      if (currentUser.role === 'Visitor' && ['dashboard', 'calendar', 'members', 'resources'].includes(currentPage)) {
          setPage('about');
      }
  }, [currentUser.role, currentPage]);

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
      const currentUserName = currentUser.name;
      const currentTeam = currentUser.teamName || 'Frontend Team';

      switch(filter) {
          case 'Mine':
              return tasks.filter((t: TaskNode) => t.assignee.name === currentUserName);
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
  }, [tasks, filter, focusedParentId, currentUser]);

  const showHeader = !(isModalOpen && currentPage === 'roadmap');
  
  const selectedTask = useMemo(() => tasks.find(t => t.id === selectedTaskId), [tasks, selectedTaskId]);

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

  if (isUserLoading) {
      return <div className="w-screen h-screen flex items-center justify-center bg-[#09090b]">Loading Project...</div>;
  }

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
            {currentPage === 'dashboard' && (
                <Dashboard 
                    tasks={store.tasks} 
                    theme={theme} 
                    viewMode={dashboardView} 
                    setViewMode={setDashboardView}
                />
            )}
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
            {currentPage === 'resources' && (
                <Resources 
                    theme={theme} 
                    viewMode={resourcesView} 
                    files={files} 
                />
            )}
            {currentPage === 'community' && (
                <Community 
                    theme={theme} 
                    viewMode={communityView} 
                    posts={posts} 
                />
            )}
            {currentPage === 'profile' && <ProfilePage theme={theme} tasks={store.tasks} member={viewedProfile} onBack={handleBackToMembers}/>}
            {currentPage === 'about' && <About theme={theme} />}
            {currentPage === 'settings' && <SettingsPage theme={theme} />}
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

        {/* Global Document Modal */}
        {selectedTask && isModalOpen && (
            <DocumentModal 
                task={selectedTask}
                tasks={tasks}
                currentUser={currentUser}
                onClose={() => selectTask(null, false)}
                onUpdate={(id, updates) => updateTask(id, updates)}
                onAddSubTask={(taskData) => addTask(taskData)}
                theme={theme}
            />
        )}
    </main>
  );
};

export default App;
