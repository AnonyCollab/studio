
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

export default function App() {
  const [selectedServer, setSelectedServer] = useState('home');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'friends' | 'dm' | 'groups'>('friends');
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';
  const isInGroup = selectedServer !== 'home' && currentView === 'chat';
  const showLeftSidebar = selectedServer === 'home' || currentView === 'chat';

  const handleSelectHomeView = (view: 'friends' | 'groups') => {
    setSelectedDM(null);
    setCurrentView(view);
  };

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

        {/* Direct messages sidebar - show when on home */}
        {selectedServer === 'home' && (
          <DirectMessagesSidebar
            activeView={currentView}
            selectedDM={selectedDM}
            onSelectDM={(id) => {
              setSelectedDM(id);
              setCurrentView('dm');
            }}
            onSelectHomeView={handleSelectHomeView}
            theme={theme}
          />
        )}

        {/* Channel sidebar - only show when not on home */}
        {currentView === 'chat' && selectedServer !== 'home' && (
          <ChannelSidebar 
            serverId={selectedServer}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
            theme={theme}
          />
        )}

        {/* Main content area */}
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            {currentView === 'friends' && selectedServer === 'home' ? (
              <FriendsPage theme={theme} />
            ) : currentView === 'groups' && selectedServer === 'home' ? (
               <GroupList theme={theme} onSelectGroup={(id) => {
                setSelectedDM(id);
                setCurrentView('dm');
              }} />
            ) : currentView === 'dm' && selectedServer === 'home' ? (
              <ChatArea channelId={selectedDM} isDM={true} theme={theme} />
            ) : (
              <ChatArea channelId={selectedChannel} isDM={false} theme={theme} />
            )}
          </div>

          {/* Members panel - only show when in a group */}
          {isInGroup && <MembersPanel theme={theme} />}
        </div>

        {/* User info panel - at bottom left covering server list and sidebar */}
        <UserInfoPanel theme={theme} onToggleTheme={toggleTheme} />
      </div>
    </div>
  );
}
