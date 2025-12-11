import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ClientManagement } from './components/ClientManagement';
import { PromotionManagement } from './components/PromotionManagement';
import { ProductManagement } from './components/ProductManagement';
import { MessageCenter } from './components/MessageCenter';
import { Reports } from './components/Reports';
import RuleManagement from './components/RuleManagement';
import { Settings } from './components/Settings';

type View = 'dashboard' | 'clients' | 'promotions' | 'products' | 'messages' | 'reports' | 'rules' | 'settings';

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
      case 'products':
        return <ProductManagement />;
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

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return isAuthenticated ? (
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  ) : (
    <Login />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
