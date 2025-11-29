import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClientManagement } from './components/ClientManagement';
import { PromotionManagement } from './components/PromotionManagement';
import { MessageCenter } from './components/MessageCenter';
import { Reports } from './components/Reports';
import RuleManagement from './components/RuleManagement';
import { Settings } from './components/Settings';

type View = 'dashboard' | 'clients' | 'promotions' | 'messages' | 'reports' | 'rules' | 'settings';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const { logout, user } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'clients':
        return <ClientManagement />;
      case 'promotions':
        return <PromotionManagement />;
      case 'messages':
        return <MessageCenter />;
      case 'reports':
        return <Reports />;
      case 'rules':
        return <RuleManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        user={user}
        onLogout={logout}
      />
      <main className="flex-1 ml-64">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
