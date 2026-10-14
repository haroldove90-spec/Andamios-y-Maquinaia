import React from 'react';
import { useData } from '../context/DataContext';
import {
  HardHat,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  RotateCcw,
  DollarSign,
  Users,
} from 'lucide-react';
import { RentalOrder } from '../types';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
  onOpenNewRental: () => void;
  onOpenReturnCheckIn: (order: RentalOrder) => void;
  onOpenRemision: (order: RentalOrder) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenNewRental,
  onOpenReturnCheckIn,
  onOpenRemision,
}) => {
  const { scaffolding, machinery, clients, orders } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  // Global Scaffolding Stats
  const scaffTotalPieces = scaffolding.reduce((acc, s) => acc + s.totalQty, 0);
  const scaffAvailablePieces = scaffolding.reduce((acc, s) => acc + s.availableQty, 0);
  const scaffRentedPieces = scaffolding.reduce((acc, s) => acc + s.rentedQty, 0);
  const scaffMaintPieces = scaffolding.reduce((acc, s) => acc + s.maintenanceQty, 0);

  // Machinery Stats
  const machTotal = machinery.length;
  const machAvailable = machinery.filter((m) => m.status === 'disponible').length;
  const machRented = machinery.filter((m) => m.status === 'rentado').length;
  const machMaint = machinery.filter((m) => m.status === 'mantenimiento').length;

  // Semáforo groups
  const activeOrders = orders.filter((o) => o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida');
  
  const overdueOrders = activeOrders.filter((o) => o.expectedReturnDate < todayStr);
  const dueTodayOrders = activeOrders.filter((o) => o.expectedReturnDate === todayStr);
  const onTimeOrders = activeOrders.filter((o) => o.expectedReturnDate > todayStr);

  // Financial metrics
  const totalReceivable = orders.reduce((acc, o) => acc + Math.max(0, o.totalDue - o.amountPaid), 0);
  const totalDepositsHeld = orders
    .filter((o) => o.depositStatus === 'retenido' || o.depositStatus === 'parcialmente_retenido')
    .reduce((acc, o) => acc + (o.depositAmount - o.depositReturnedAmount), 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-700/80">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Tablero de Control Operativo
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Operaciones de Renta & Logística
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitoreo en tiempo real de piezas en obra, disponibilidad en almacén, devoluciones parciales y semáforo de vencimiento.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenNewRental}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nueva Renta</span>
          </button>
          <button
            onClick={() => onNavigate('returns')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold border border-slate-600 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Check-in Entrada</span>
          </button>
        </div>
      </div>

      {/* Real-Time Stock Status: Scaffolding (Volumen) vs Machinery (Series) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Andamios Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Andamios (Control por Pieza/Volumen)</h3>
                <p className="text-[11px] text-slate-500">Marcos, crucetas, plataformas, ruedas y tornillos</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">{scaffTotalPieces}</span>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Total</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700">{scaffAvailablePieces}</span>
              <span className="text-[10px] text-emerald-800 block uppercase font-semibold">En Bodega</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-lg sm:text-xl font-extrabold text-amber-700">{scaffRentedPieces}</span>
              <span className="text-[10px] text-amber-800 block uppercase font-semibold">En Obra</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-lg sm:text-xl font-extrabold text-rose-700">{scaffMaintPieces}</span>
              <span className="text-[10px] text-rose-800 block uppercase font-semibold">Taller</span>
            </div>
          </div>
        </div>

        {/* Maquinaria Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Maquinaria (Control Serializado)</h3>
                <p className="text-[11px] text-slate-500">Revolvedoras, cortadoras de piso, plantas, compactadoras</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Ver Equipos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-lg sm:text-xl font-extrabold text-slate-900">{machTotal}</span>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Equipos</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700">{machAvailable}</span>
              <span className="text-[10px] text-emerald-800 block uppercase font-semibold">Disponibles</span>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-lg sm:text-xl font-extrabold text-amber-700">{machRented}</span>
              <span className="text-[10px] text-amber-800 block uppercase font-semibold">En Renta</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-lg sm:text-xl font-extrabold text-rose-700">{machMaint}</span>
              <span className="text-[10px] text-rose-800 block uppercase font-semibold">Mantenim.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEMÁFORO DE ENTREGAS Y DEVOLUCIONES */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Semáforo de Entregas & Devoluciones
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión de rentas vencidas con retraso, retornos para hoy y contratos activos
            </p>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-bold text-slate-700 hover:text-amber-600 transition"
          >
            Ver todos ({activeOrders.length} activos) →
          </button>
        </div>

        {/* 3 Semaphore Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* RED: Vencidas */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                <span>Rentas Vencidas ({overdueOrders.length})</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                Urgente
              </span>
            </div>

            {overdueOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No hay rentas vencidas al momento.</p>
            ) : (
              <div className="space-y-2">
                {overdueOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-lg bg-white border border-rose-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{o.clientName}</span>
                      <span className="font-mono font-bold text-rose-600">{o.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Obra: <strong>{o.worksiteName}</strong>
                    </div>
                    <div className="text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Venció el: {o.expectedReturnDate}</span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => onOpenReturnCheckIn(o)}
                        className="flex-1 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold"
                      >
                        Check-in Devolución
                      </button>
                      <button
                        onClick={() => onOpenRemision(o)}
                        className="px-2 py-1 rounded border border-slate-300 text-slate-700 text-[10px] hover:bg-slate-50"
                      >
                        Remisión
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* YELLOW: Vencen Hoy */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Vencen Hoy ({dueTodayOrders.length})</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                Atención
              </span>
            </div>

            {dueTodayOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No hay devoluciones programadas para hoy.</p>
            ) : (
              <div className="space-y-2">
                {dueTodayOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-lg bg-white border border-amber-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{o.clientName}</span>
                      <span className="font-mono font-bold text-amber-700">{o.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Obra: <strong>{o.worksiteName}</strong>
                    </div>
                    <div className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Programada para hoy</span>
                    </div>
                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                      <button
                        onClick={() => onOpenReturnCheckIn(o)}
                        className="flex-1 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-bold"
                      >
                        Iniciar Entrada
                      </button>
                      <button
                        onClick={() => onOpenRemision(o)}
                        className="px-2 py-1 rounded border border-slate-300 text-slate-700 text-[10px] hover:bg-slate-50"
                      >
                        Remisión
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GREEN: En Tiempo */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>En Tiempo / Activas ({onTimeOrders.length})</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                Al Día
              </span>
            </div>

            {onTimeOrders.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No hay otras rentas en curso.</p>
            ) : (
              <div className="space-y-2">
                {onTimeOrders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-lg bg-white border border-emerald-200 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{o.clientName}</span>
                      <span className="font-mono font-bold text-emerald-700">{o.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Obra: <strong>{o.worksiteName}</strong>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Retorno: {o.expectedReturnDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Health & Client Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Saldo Pendiente de Cobro
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 mt-1">
              ${totalReceivable.toLocaleString('es-MX')} MXN
            </div>
            <span className="text-[11px] text-slate-500">Rentas activas o abonos parciales</span>
          </div>
          <button
            onClick={() => onNavigate('billing')}
            className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
          >
            <DollarSign className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Depósitos en Garantía Retenidos
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
              ${totalDepositsHeld.toLocaleString('es-MX')} MXN
            </div>
            <span className="text-[11px] text-slate-500">Fondos en resguardo</span>
          </div>
          <button
            onClick={() => onNavigate('billing')}
            className="p-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Clientes Registrados
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {clients.length} Constructoras
            </div>
            <span className="text-[11px] text-slate-500">
              {clients.reduce((acc, c) => acc + c.worksites.length, 0)} obras de entrega
            </span>
          </div>
          <button
            onClick={() => onNavigate('clients')}
            className="p-2.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
