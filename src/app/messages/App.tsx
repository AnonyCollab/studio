

import { useState } from 'react';
import { ServerList } from './components/ServerList';
import { ChannelSidebar } from './components/ChannelSidebar';
import { ChatArea } from './components/ChatArea';
import { FriendsPage } from './components/FriendsPage';
import { UserPanel } from './components/UserPanel';
import { DirectMessagesSidebar } from './components/DirectMessagesSidebar';
import { MembersPanel } from './components/MembersPanel';
import { UserInfoPanel } from './components/UserInfoPanel';
import { GroupList } from './components/GroupList';
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function App() {
  const [selectedServer, setSelectedServer] = useState('home');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'friends' | 'dm' | 'groups'>('friends');
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const isDark = theme === 'dark';
  const isInGroup = selectedServer !== 'home' && currentView === 'chat';

  const handleSelectHomeView = (view: 'friends' | 'groups') => {
    setSelectedDM(null);
    setCurrentView(view);
  };
  
  const handleSelectDM = (id: string) => {
    setSelectedDM(id);
    setCurrentView('dm');
  };
  
  const handleBack = () => {
    setSelectedDM(null);
    if(selectedServer === 'home') {
      setCurrentView('friends');
    }
  }

  const showSidebar = !isMobile || (selectedServer === 'home' && !selectedDM);
  const showChat = !isMobile || !!selectedDM || (currentView === 'chat' && selectedServer !== 'home');
  const showMainContent = !isMobile || (isMobile && !!selectedDM);

  return (
    <div
      style={{ height: 'calc(100vh - 3.5rem)' }}
      className="w-screen overflow-hidden relative"
    >
      {/* Animated background blobs - only in dark mode */}
      {isDark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      )}

      {/* Main app layout */}
      <div className="relative h-full flex">
        {/* Server list */}
        <ServerList 
          selectedServer={selectedServer}
          onSelectServer={(id) => {
            setSelectedServer(id);
            if (id === 'home') {
              setCurrentView('friends');
              setSelectedChannel(null);
              setSelectedDM(null);
            } else {
              setCurrentView('chat');
              setSelectedChannel('general'); // Select 'general' by default
              setSelectedDM(null);
            }
          }}
          theme={theme}
        />

        {/* Left Sidebars */}
        <div className={cn(
          "flex-shrink-0 transition-all duration-300",
          isMobile && selectedDM ? 'w-0 hidden' : 'w-80'
        )}>
          {selectedServer === 'home' && (
            <DirectMessagesSidebar
              activeView={currentView}
              selectedDM={selectedDM}
              onSelectDM={handleSelectDM}
              onSelectHomeView={handleSelectHomeView}
              theme={theme}
            />
          )}
          {currentView === 'chat' && selectedServer !== 'home' && (
            <ChannelSidebar 
              serverId={selectedServer}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
              theme={theme}
            />
          )}
        </div>

        {/* Main Content Area */}
        <div className={cn("flex-1 flex min-w-0 transition-all duration-300", isMobile && !selectedDM && selectedServer === 'home' ? 'hidden' : 'flex')}>
          <div className="flex-1 flex flex-col min-w-0">
            {currentView === 'friends' && selectedServer === 'home' ? (
              <FriendsPage theme={theme} onSelectDM={handleSelectDM} />
            ) : currentView === 'groups' && selectedServer === 'home' ? (
               <GroupList theme={theme} onSelectGroup={(id) => {
                setSelectedDM(id);
                setCurrentView('dm');
              }} />
            ) : currentView === 'dm' && selectedServer === 'home' ? (
              <ChatArea channelId={selectedDM} isDM={true} theme={theme} onBack={isMobile ? handleBack : undefined} />
            ) : (
              <ChatArea channelId={selectedChannel} isDM={false} theme={theme} onBack={isMobile ? handleBack : undefined} />
            )}
          </div>
          {isInGroup && <MembersPanel theme={theme} />}
        </div>

        {/* User info panel - at bottom left covering server list and sidebar */}
         <div className={cn(isMobile && selectedDM ? 'hidden' : 'block')}>
            <UserInfoPanel theme={theme} onToggleTheme={toggleTheme} />
        </div>
      </div>
    </div>
  );
}
