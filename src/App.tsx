import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { QueueScreen } from './components/queue/QueueScreen';
import { ActiveJobScreen } from './components/work/ActiveJobScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { ClientsScreen } from './components/clients/ClientsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

const MainLayout: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="flex flex-col h-screen w-screen bg-broadcast-darkest text-broadcast-textPrimary font-sans overflow-hidden">
      {/* Top Header */}
      <Header />

      {/* Main Workspace Layout: Sidebar + Dynamic Screen */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col overflow-hidden bg-broadcast-darkest">
          {currentView === 'cola' && <QueueScreen />}
          {currentView === 'trabajo' && <ActiveJobScreen />}
          {currentView === 'historial' && <HistoryScreen />}
          {currentView === 'clientes' && <ClientsScreen />}
          {currentView === 'configuracion' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
