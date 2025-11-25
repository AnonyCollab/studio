
import React from 'react';
import { ProjectStoreProvider, useStore } from './store/useStore';
import { AppContent } from './components/AppContent';

const App: React.FC = () => {
  return (
    <ProjectStoreProvider>
      <AppContent />
    </ProjectStoreProvider>
  );
};

export default App;
