import React from 'react';
import { LayoutDashboard, Users, MessageSquare, BarChart3, Settings, Smartphone, LogOut, User, Megaphone, Package, FileJson } from 'lucide-react';
import { User as UserType } from '../services/auth.service';

type View = 'dashboard' | 'clients' | 'promotions' | 'products' | 'messages' | 'reports' | 'rules' | 'settings';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  user?: UserType | null;
  onLogout?: () => void;
}

export function Sidebar({ currentView, onViewChange, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as View, label: 'Clientes', icon: Users },
    { id: 'promotions' as View, label: 'Promociones', icon: Megaphone },
    { id: 'products' as View, label: 'Productos', icon: Package },
    { id: 'messages' as View, label: 'Mensajería', icon: MessageSquare },
    { id: 'reports' as View, label: 'Reportes', icon: BarChart3 },
    { id: 'rules' as View, label: 'Reglas de Negocio', icon: FileJson },
    { id: 'settings' as View, label: 'Configuración', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-xl flex flex-col">
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <Smartphone className="w-8 h-8" />
          <div>
            <h1 className="text-xl">TelePromo</h1>
            <p className="text-blue-200 text-sm">Sistema de Promociones</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-blue-100 hover:bg-blue-700'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="flex-shrink-0 p-6 border-t border-blue-500 bg-blue-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nombre}</p>
              <p className="text-xs text-blue-200 truncate">{user.correo}</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-blue-100 hover:bg-blue-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
