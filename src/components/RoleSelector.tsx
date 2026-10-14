import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Warehouse, Briefcase, Receipt, HardHat } from 'lucide-react';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
}

interface RoleItem {
  id: UserRole;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  iconBg: string;
  borderColor: string;
  ringHover: string;
}

const ROLES: RoleItem[] = [
  {
    id: 'admin',
    name: 'Administrador General',
    icon: ShieldCheck,
    accentColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    borderColor: 'border-slate-800/80 hover:border-amber-500',
    ringHover: 'hover:shadow-amber-500/10',
  },
  {
    id: 'warehouse',
    name: 'Almacén y Bodega',
    icon: Warehouse,
    accentColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    borderColor: 'border-slate-800/80 hover:border-blue-500',
    ringHover: 'hover:shadow-blue-500/10',
  },
  {
    id: 'sales',
    name: 'Ventas y Contratos',
    icon: Briefcase,
    accentColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
    borderColor: 'border-slate-800/80 hover:border-emerald-500',
    ringHover: 'hover:shadow-emerald-500/10',
  },
  {
    id: 'billing',
    name: 'Cobranzas y Facturación',
    icon: Receipt,
    accentColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    borderColor: 'border-slate-800/80 hover:border-indigo-500',
    ringHover: 'hover:shadow-indigo-500/10',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Brand Watermark / Title */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-4 transform hover:rotate-3 transition duration-300">
          <HardHat className="w-9 h-9 sm:w-11 sm:h-11" strokeWidth={2.2} />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Andamios y Maquinaria
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Selecciona tu perfil de acceso para ingresar
        </p>
      </div>

      {/* Role Grid: Exactly 2 Columns on Mobile / 4 Columns on Desktop as requested */}
      <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
        {ROLES.map((r) => {
          const IconComponent = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              className={`group flex flex-col items-center justify-center p-5 sm:p-7 md:p-8 rounded-2xl bg-slate-900/90 border transition-all duration-200 transform hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer text-center ${r.borderColor} ${r.ringHover}`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shadow-inner ${r.iconBg}`}
              >
                <IconComponent className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <span className="text-sm sm:text-base font-bold text-slate-100 group-hover:text-white leading-snug">
                {r.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* System Footer Note */}
      <div className="mt-12 text-center text-xs text-slate-500">
        Control de Inventario en Tiempo Real • Andamios & Equipos de Construcción
      </div>
    </div>
  );
};
