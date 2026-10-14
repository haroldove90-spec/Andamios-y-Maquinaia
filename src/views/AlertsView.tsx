import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Phone,
  HardHat,
  ShieldCheck,
  Building,
  RotateCcw,
  FileText,
  Search,
} from 'lucide-react';

interface AlertsViewProps {
  onOpenReturnCheckIn: (order: RentalOrder) => void;
  onOpenRemision: (order: RentalOrder) => void;
  onOpenPaymentModal: (order: RentalOrder) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onOpenReturnCheckIn,
  onOpenRemision,
  onOpenPaymentModal,
}) => {
  const { orders } = useData();

  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const activeOrders = orders.filter(
    (o) => o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida'
  );

  const overdueOrders = activeOrders.filter((o) => o.expectedReturnDate < todayStr);
  const dueTodayOrders = activeOrders.filter((o) => o.expectedReturnDate === todayStr);
  const upcomingOrders = activeOrders.filter((o) => o.expectedReturnDate > todayStr);

  const displayedOrders = activeOrders
    .filter((o) => {
      if (filterType === 'overdue') return o.expectedReturnDate < todayStr;
      if (filterType === 'today') return o.expectedReturnDate === todayStr;
      if (filterType === 'upcoming') return o.expectedReturnDate > todayStr;
      return true;
    })
    .filter(
      (o) =>
        o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.worksiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Semáforo de Entregas y Devoluciones
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervisión logística de contratos vencidos con retraso, retornos para hoy y recolecciones programadas
          </p>
        </div>
      </div>

      {/* 3 Status Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setFilterType('overdue')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            filterType === 'overdue'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${filterType === 'overdue' ? 'bg-white' : 'bg-rose-600 animate-pulse'}`} />
              Vencidas (Con Retraso)
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black">{overdueOrders.length}</div>
          <span className={`text-[10px] ${filterType === 'overdue' ? 'text-rose-100' : 'text-rose-700'}`}>
            Requieren llamada de prórroga o recolección
          </span>
        </button>

        <button
          onClick={() => setFilterType('today')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            filterType === 'today'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
              : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${filterType === 'today' ? 'bg-slate-950' : 'bg-amber-500'}`} />
              Vencen Hoy
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black">{dueTodayOrders.length}</div>
          <span className={`text-[10px] ${filterType === 'today' ? 'text-amber-950' : 'text-amber-700'}`}>
            Entregas o recolecciones de hoy
          </span>
        </button>

        <button
          onClick={() => setFilterType('upcoming')}
          className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
            filterType === 'upcoming'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${filterType === 'upcoming' ? 'bg-white' : 'bg-emerald-500'}`} />
              En Tiempo (Vigentes)
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black">{upcomingOrders.length}</div>
          <span className={`text-[10px] ${filterType === 'upcoming' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Dentro del plazo pactado
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          placeholder="Buscar por cliente, obra o folio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs bg-transparent focus:outline-none"
        />
        {filterType !== 'all' && (
          <button
            onClick={() => setFilterType('all')}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold shrink-0"
          >
            Ver todos ({activeOrders.length})
          </button>
        )}
      </div>

      {/* Orders List for Semaphore */}
      <div className="space-y-3">
        {displayedOrders.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            No hay órdenes activas que coincidan con los filtros del semáforo.
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isOverdue = order.expectedReturnDate < todayStr;
            const isToday = order.expectedReturnDate === todayStr;

            const daysDiff = Math.ceil(
              (new Date(order.expectedReturnDate).getTime() - new Date(todayStr).getTime()) /
                (1000 * 3600 * 24)
            );

            return (
              <div
                key={order.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white shadow-xs transition space-y-3 ${
                  isOverdue
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isToday
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        isOverdue
                          ? 'bg-rose-600 animate-pulse'
                          : isToday
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {order.id}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900">{order.clientName}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{order.worksiteName}</span>
                        <span>•</span>
                        <span>{order.worksiteAddress}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:self-center">
                    <div
                      className={`text-xs font-bold ${
                        isOverdue
                          ? 'text-rose-700'
                          : isToday
                          ? 'text-amber-800'
                          : 'text-emerald-700'
                      }`}
                    >
                      {isOverdue
                        ? `Vencida hace ${Math.abs(daysDiff)} día(s)`
                        : isToday
                        ? 'Vence hoy'
                        : `Faltan ${daysDiff} día(s)`}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Pactada para: <strong>{order.expectedReturnDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Items in field */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                    Equipos en Obra que deben ingresar a Bodega:
                  </span>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {order.scaffoldingItems.map((si) => {
                      const pending = si.deliveredQty - si.returnedQty - si.lostQty;
                      if (pending <= 0) return null;
                      return (
                        <span
                          key={si.itemId}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-800"
                        >
                          {pending} {si.name}
                        </span>
                      );
                    })}
                    {order.machineryItems.map((mi) => {
                      if (mi.returned) return null;
                      return (
                        <span
                          key={mi.itemId}
                          className="px-2 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-900 font-mono"
                        >
                          {mi.name} ({mi.serialNumber})
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    {order.clientPhone && (
                      <a
                        href={`tel:${order.clientPhone}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Llamar al cliente ({order.clientPhone})</span>
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onOpenRemision(order)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Remisión
                    </button>
                    <button
                      onClick={() => onOpenReturnCheckIn(order)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Check-in Entrada
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
