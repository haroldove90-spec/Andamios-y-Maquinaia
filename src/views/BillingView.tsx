import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  CreditCard,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  Receipt,
  Search,
  Filter,
} from 'lucide-react';

interface BillingViewProps {
  onOpenPaymentModal: (order: RentalOrder) => void;
  onOpenRemision: (order: RentalOrder) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  onOpenPaymentModal,
  onOpenRemision,
}) => {
  const { orders } = useData();

  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pendiente' | 'abono_parcial' | 'pagado'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesPayment;
  });

  // Financial aggregates
  const totalInvoiced = orders.reduce((acc, o) => acc + o.totalDue, 0);
  const totalCollected = orders.reduce((acc, o) => acc + o.amountPaid, 0);
  const totalReceivable = orders.reduce((acc, o) => acc + Math.max(0, o.totalDue - o.amountPaid), 0);
  const totalDepositsHeld = orders
    .filter((o) => o.depositStatus === 'retenido' || o.depositStatus === 'parcialmente_retenido')
    .reduce((acc, o) => acc + (o.depositAmount - o.depositReturnedAmount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Control de Cobranza, Pagos y Garantías
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cálculo automático por tiempo transcurrido, control de abonos y custodia de depósitos en garantía
          </p>
        </div>
      </div>

      {/* 4 Financial Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-medium">Facturado Total</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ${totalInvoiced.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-slate-400">Renta + cargos de merma</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-800 block font-medium">Cobrado / Ingresado</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
            ${totalCollected.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Pagos registrados</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-800 block font-medium">Saldo por Cobrar</span>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
            ${totalReceivable.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-rose-700 font-semibold">Pendientes o parciales</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
          <span className="text-xs text-blue-800 block font-medium">Depósitos en Custodia</span>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">
            ${totalDepositsHeld.toLocaleString('es-MX')}
          </div>
          <span className="text-[10px] text-blue-700 font-semibold">Garantías por devolver</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente o folio de orden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              paymentFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setPaymentFilter('pendiente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              paymentFilter === 'pendiente'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setPaymentFilter('abono_parcial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              paymentFilter === 'abono_parcial'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Abonos Parciales
          </button>
          <button
            onClick={() => setPaymentFilter('pagado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              paymentFilter === 'pagado'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Pagados
          </button>
        </div>
      </div>

      {/* Financial Table with Auto-Calculations */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th className="p-3">Folio & Fecha</th>
                <th className="p-3">Cliente / Obra</th>
                <th className="p-3 text-center">Tiempos Transcurridos</th>
                <th className="p-3 text-right">Tarifa / Total</th>
                <th className="p-3 text-right">Abonado</th>
                <th className="p-3 text-right">Saldo Restante</th>
                <th className="p-3 text-center">Estatus Pago</th>
                <th className="p-3 text-center">Garantía</th>
                <th className="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No se encontraron registros de cobranza.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const start = new Date(order.startDate);
                  const expected = new Date(order.expectedReturnDate);
                  const today = new Date();
                  const diffPactados = Math.max(1, Math.ceil((expected.getTime() - start.getTime()) / (1000 * 3600 * 24)));
                  const diffTranscurridos = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 3600 * 24)));
                  const pending = Math.max(0, order.totalDue - order.amountPaid);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                        <span className="text-[10px] text-slate-500">{order.startDate}</span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{order.clientName}</div>
                        <span className="text-[10px] text-slate-500">{order.worksiteName}</span>
                      </td>

                      {/* Time Auto Calculation */}
                      <td className="p-3 text-center">
                        <div className="font-semibold text-slate-800">
                          {diffTranscurridos} de {diffPactados} días
                        </div>
                        {diffTranscurridos > diffPactados ? (
                          <span className="text-[10px] font-bold text-rose-600 block">
                            +{diffTranscurridos - diffPactados} días extra
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block uppercase">
                            Por {order.rateType}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        ${order.totalDue.toLocaleString('es-MX')}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-emerald-700">
                        ${order.amountPaid.toLocaleString('es-MX')}
                      </td>

                      <td className="p-3 text-right font-mono font-bold">
                        {pending > 0 ? (
                          <span className="text-rose-700">${pending.toLocaleString('es-MX')}</span>
                        ) : (
                          <span className="text-slate-400">$0</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.paymentStatus === 'pagado'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'abono_parcial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {order.paymentStatus === 'abono_parcial' ? 'Abono Parcial' : order.paymentStatus}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="font-mono text-slate-800 font-medium">
                          ${order.depositAmount.toLocaleString('es-MX')}
                        </div>
                        <span
                          className={`text-[9px] font-bold block ${
                            order.depositStatus === 'devuelto'
                              ? 'text-emerald-700'
                              : 'text-blue-700'
                          }`}
                        >
                          {order.depositStatus === 'devuelto' ? 'Devuelto' : 'Retenido'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => onOpenPaymentModal(order)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Cobrar / Recibo
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
