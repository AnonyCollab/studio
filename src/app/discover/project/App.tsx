
import React from 'react';
import { ProjectStoreProvider } from './store/useStore.tsx';
import { AppContent } from './components/AppContent';

const App: React.FC = () => {
  return (
    <ProjectStoreProvider>
      <AppContent />
    </ProjectStoreProvider>
  );
};

export default App;
