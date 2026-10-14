import React from 'react';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  Layers,
  Users,
  ClipboardList,
  RotateCcw,
  CreditCard,
  AlertTriangle,
  Database,
  ChevronRight,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
  allowedRoles?: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { role, orders } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = orders.filter(
    (o) => (o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida') && o.expectedReturnDate < todayStr
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Tablero Operativo',
      icon: LayoutDashboard,
    },
    {
      id: 'inventory',
      label: 'Catálogo e Inventario',
      icon: Layers,
    },
    {
      id: 'clients',
      label: 'Clientes y Obras',
      icon: Users,
    },
    {
      id: 'rentals',
      label: 'Rentas y Pedidos',
      icon: ClipboardList,
    },
    {
      id: 'returns',
      label: 'Devoluciones y Mermas',
      icon: RotateCcw,
    },
    {
      id: 'billing',
      label: 'Cobranza y Depósitos',
      icon: CreditCard,
    },
    {
      id: 'alerts',
      label: 'Semáforo de Devolución',
      icon: AlertTriangle,
      badge: overdueCount > 0 ? overdueCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'supabase',
      label: 'Base de Datos Supabase',
      icon: Database,
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 w-64 border-r border-slate-800">
      {/* Sidebar Top: Role Info Pill */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-white tracking-wide">
              {role === 'admin'
                ? 'Administrador'
                : role === 'warehouse'
                ? 'Almacén'
                : role === 'sales'
                ? 'Ventas'
                : 'Cobranzas'}
            </span>
            <span className="text-[10px] text-slate-400">Acceso Habilitado</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Módulos del Sistema
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-slate-950' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* System Quick Stats Card at bottom */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>Andamios & Maquinaria</span>
          <span className="text-amber-400 font-bold">PWA v1.0</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Gestión de almacén, entregas, parciales y cobranza.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
        {content}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex flex-col w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
