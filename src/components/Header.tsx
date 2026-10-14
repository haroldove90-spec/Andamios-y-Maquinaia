import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  HardHat,
  Download,
  LogOut,
  Database,
  Menu,
  ShieldCheck,
  Warehouse,
  Briefcase,
  Receipt,
  Share2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenDataModal: () => void;
  activeView: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onOpenDataModal }) => {
  const { role, setRole, orders } = useData();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);

  // Semáforo quick count: overdue & today
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = orders.filter(
    (o) => (o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida') && o.expectedReturnDate < todayStr
  ).length;

  const getRoleDetails = () => {
    switch (role) {
      case 'admin':
        return { name: 'Administrador General', icon: ShieldCheck, color: 'bg-amber-500/10 text-amber-700 border-amber-300' };
      case 'warehouse':
        return { name: 'Almacén y Bodega', icon: Warehouse, color: 'bg-blue-500/10 text-blue-700 border-blue-300' };
      case 'sales':
        return { name: 'Ventas y Contratos', icon: Briefcase, color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' };
      case 'billing':
        return { name: 'Cobranzas y Pagos', icon: Receipt, color: 'bg-indigo-500/10 text-indigo-700 border-indigo-300' };
      default:
        return { name: 'Invitado', icon: HardHat, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  const roleInfo = getRoleDetails();
  const RoleIcon = roleInfo.icon;

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowInstallHelp(true);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-md">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand & Mobile Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
                title="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-md shadow-slate-900/15">
                <HardHat className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.4} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
                  Andamios <span className="text-amber-600 font-bold">&</span> Maquinaria
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-500 hidden xs:inline-block">
                  Control de Renta & Bodega
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions, Role Badge, Install Button, Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Overdue alert indicator */}
            {overdueCount > 0 && (
              <div
                title={`${overdueCount} renta(s) vencida(s) que requieren recolección`}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{overdueCount} Vencida{overdueCount > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Quick PWA Install Button */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs hover:shadow-sm transition cursor-pointer"
                title="Instalar aplicación en dispositivo"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            {isInstalled && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" /> PWA Activa
              </span>
            )}

            {/* Data & Supabase Management Button */}
            <button
              onClick={onOpenDataModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
              title="Gestión de Datos y Configuración Supabase"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Datos & Supabase</span>
            </button>

            {/* Active Role Badge */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${roleInfo.color}`}
              title="Rol activo actual"
            >
              <RoleIcon className="w-3.5 h-3.5" />
              <span className="truncate max-w-[140px]">{roleInfo.name}</span>
            </div>

            {/* Logout / Switch Role Button */}
            <button
              onClick={() => setRole(null)}
              className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition text-xs font-medium cursor-pointer"
              title="Cambiar de Rol / Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* iOS Installation Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Instalar en iPhone / iPad</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Para agregar <strong>Andamios y Maquinaria</strong> a tu pantalla de inicio como una App independiente:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5">
              <li>Toca el botón <strong>Compartir</strong> <span className="text-blue-600 font-bold">[↑]</span> en la barra de Safari.</li>
              <li>Desplaza hacia abajo y selecciona <strong>Agregar al Inicio</strong>.</li>
              <li>Confirma pulsando <strong>Agregar</strong> en la esquina superior.</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* General Installation Help Modal (for Desktop Chrome / Edge etc.) */}
      {showInstallHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Instalar Aplicación</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Esta aplicación cuenta con soporte PWA completo para instalarse en tu computadora (Windows / Mac) o dispositivo móvil Android.
            </p>
            <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-5 space-y-2">
              <p>• <strong>En Chrome / Edge:</strong> Haz clic en el ícono de instalación <Download className="inline w-3.5 h-3.5 text-amber-600" /> en el extremo derecho de la barra de direcciones.</p>
              <p>• <strong>En Android:</strong> Abre el menú de tres puntos (⋮) y elige <em>"Instalar aplicación"</em>.</p>
            </div>
            <button
              onClick={() => setShowInstallHelp(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
