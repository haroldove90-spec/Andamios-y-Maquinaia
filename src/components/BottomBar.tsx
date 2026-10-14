import React from 'react';
import {
  LayoutDashboard,
  Layers,
  ClipboardList,
  RotateCcw,
  MoreHorizontal,
  Users,
  CreditCard,
  AlertTriangle,
  Database,
  X,
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface BottomBarProps {
  activeView: string;
  onSelectView: (view: string) => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({ activeView, onSelectView }) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const { orders } = useData();

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = orders.filter(
    (o) => (o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida') && o.expectedReturnDate < todayStr
  ).length;

  const mainButtons = [
    { id: 'overview', label: 'Tablero', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Layers },
    { id: 'rentals', label: 'Rentas', icon: ClipboardList },
    { id: 'returns', label: 'Check-in', icon: RotateCcw },
  ];

  const moreItems = [
    { id: 'clients', label: 'Clientes y Obras', icon: Users, desc: 'Directorio y ubicaciones físicas' },
    { id: 'billing', label: 'Cobranza y Depósitos', icon: CreditCard, desc: 'Cálculo de tiempos y garantías' },
    {
      id: 'alerts',
      label: 'Semáforo de Devoluciones',
      icon: AlertTriangle,
      desc: 'Rentas vencidas y por entregar',
      badge: overdueCount > 0 ? `${overdueCount} vencida(s)` : undefined,
    },
    { id: 'supabase', label: 'Configuración Supabase', icon: Database, desc: 'Esquema SQL y gestión de datos' },
  ];

  const handleSelect = (id: string) => {
    onSelectView(id);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* More Menu Modal / Sheet for tablet & mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMoreMenu(false)}
          />
          <div className="relative z-50 bg-white rounded-t-2xl p-5 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-900">Más Módulos y Opciones</span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-3 pb-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 text-slate-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.desc}</div>
                      </div>
                    </div>

                    {item.badge && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar on Mobile & Tablet */}
      <nav className="bottom-bar fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 lg:hidden shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainButtons.map((btn) => {
            const Icon = btn.icon;
            const isActive = activeView === btn.id;

            return (
              <button
                key={btn.id}
                onClick={() => handleSelect(btn.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer ${
                  isActive ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-amber-50 text-amber-600 scale-105' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] mt-0.5">{btn.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer ${
              ['clients', 'billing', 'alerts', 'supabase'].includes(activeView)
                ? 'text-amber-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                ['clients', 'billing', 'alerts', 'supabase'].includes(activeView)
                  ? 'bg-amber-50 text-amber-600 scale-105'
                  : ''
              }`}
            >
              <MoreHorizontal className="w-5 h-5" strokeWidth={2} />
            </div>
            <span className="text-[10px] mt-0.5">Más</span>
          </button>
        </div>
      </nav>
    </>
  );
};
