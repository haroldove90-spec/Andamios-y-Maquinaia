import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  FileText,
  RotateCcw,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
  HardHat,
  ShieldCheck,
  Printer,
} from 'lucide-react';

interface RentalsViewProps {
  onOpenNewRental: () => void;
  onOpenRemision: (order: RentalOrder) => void;
  onOpenReturnCheckIn: (order: RentalOrder) => void;
  onOpenPaymentModal: (order: RentalOrder) => void;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  onOpenNewRental,
  onOpenRemision,
  onOpenReturnCheckIn,
  onOpenPaymentModal,
}) => {
  const { orders } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.worksiteName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Registro de Rentas y Pedidos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de órdenes de salida, fechas pactadas, tarifas y emisión de remisiones membretadas
          </p>
        </div>

        <button
          onClick={onOpenNewRental}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nueva Orden de Renta</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio (ej. REN-2025), cliente u obra..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
        >
          <option value="all">Todos los Estados</option>
          <option value="vencida">Vencidas (Con retraso)</option>
          <option value="activa">Activas (En curso)</option>
          <option value="parcial">Devolución Parcial</option>
          <option value="completada">Completadas / Devueltas</option>
        </select>
      </div>

      {/* Orders Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            No se encontraron órdenes de renta con los criterios seleccionados.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOverdue =
              (order.status === 'activa' || order.status === 'parcial' || order.status === 'vencida') &&
              order.expectedReturnDate < todayStr;
            const isToday = order.expectedReturnDate === todayStr;

            const pendingBalance = Math.max(0, order.totalDue - order.amountPaid);

            // Piece counts
            const totalDeliveredScaff = order.scaffoldingItems.reduce((a, b) => a + b.deliveredQty, 0);
            const totalReturnedScaff = order.scaffoldingItems.reduce((a, b) => a + b.returnedQty, 0);
            const totalPendingScaff = Math.max(0, totalDeliveredScaff - totalReturnedScaff);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4 hover:border-slate-300 transition"
              >
                {/* Order Top: Folio, Status Badge & Rate */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {order.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'vencida' || isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : order.status === 'parcial'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : order.status === 'completada'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {isOverdue ? 'Vencida' : order.status}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-sm mt-1.5 leading-tight">
                      {order.clientName}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Modalidad</span>
                    <span className="text-xs font-bold text-slate-800 uppercase">
                      Por {order.rateType}
                    </span>
                  </div>
                </div>

                {/* Obra & Fechas */}
                <div className="text-xs space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-1.5 text-slate-700">
                    <Building className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{order.worksiteName}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{order.worksiteAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Salida:</span>
                      <span className="font-semibold text-slate-800">{order.startDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Devolución Pactada:</span>
                      <span className={`font-bold ${isOverdue ? 'text-rose-600' : isToday ? 'text-amber-700' : 'text-slate-900'}`}>
                        {order.expectedReturnDate} {isOverdue ? '(Vencida)' : isToday ? '(Hoy)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="flex items-center justify-between text-xs text-slate-600 px-1">
                  <div className="flex items-center gap-1.5">
                    <HardHat className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {totalDeliveredScaff} pzas andamio ({totalPendingScaff} en obra)
                    </span>
                  </div>

                  {order.machineryItems.length > 0 && (
                    <div className="flex items-center gap-1.5 font-medium text-indigo-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{order.machineryItems.length} equipo(s) maquinaria</span>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total / Saldo:</span>
                    <span className="font-bold text-slate-900">
                      ${order.totalDue.toLocaleString('es-MX')}
                    </span>
                    {pendingBalance > 0 ? (
                      <span className="text-rose-600 font-bold ml-1.5">
                        (Resta ${pendingBalance.toLocaleString('es-MX')})
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-bold ml-1.5">(Pagado)</span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Garantía:</span>
                    <span className="font-bold text-slate-800">
                      ${order.depositAmount.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Remisión, Check-in, Cobro */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => onOpenRemision(order)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer"
                    title="Imprimir o firmar remisión de entrega"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-600" />
                    <span>Remisión</span>
                  </button>

                  <button
                    onClick={() => onOpenReturnCheckIn(order)}
                    disabled={order.status === 'completada'}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition disabled:opacity-40 cursor-pointer"
                    title="Registrar devolución parcial o total"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Check-in</span>
                  </button>

                  <button
                    onClick={() => onOpenPaymentModal(order)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                    title="Registrar cobros, calcular tiempos y depósitos"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cobros</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
