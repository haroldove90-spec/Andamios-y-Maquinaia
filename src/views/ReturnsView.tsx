import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  RotateCcw,
  AlertTriangle,
  HardHat,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  Plus,
  DollarSign,
} from 'lucide-react';

interface ReturnsViewProps {
  onOpenReturnCheckIn: (order: RentalOrder) => void;
  onOpenRemision: (order: RentalOrder) => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  onOpenReturnCheckIn,
  onOpenRemision,
}) => {
  const { orders, damages } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'damages'>('pending');

  const pendingReturnOrders = orders.filter(
    (o) => o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida'
  );

  const completedOrders = orders.filter((o) => o.status === 'completada');

  const totalDamageCharges = damages.reduce((acc, d) => acc + d.costCharged, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Entradas, Devoluciones y Mermas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Recepción física en bodega, devoluciones parciales y registro de piezas dañadas o extraviadas
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveSubTab('pending')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Órdenes por Devolver ({pendingReturnOrders.length})
          </button>
          <button
            onClick={() => setActiveSubTab('damages')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'damages'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registro de Mermas ({damages.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Haz clic en <strong>"Realizar Check-in"</strong> para registrar el retorno de piezas. Podrás ingresar devoluciones parciales (ej. solo la mitad de los marcos) o registrar piezas rotas/faltantes.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingReturnOrders.length === 0 ? (
              <div className="col-span-2 p-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
                No hay órdenes pendientes de devolución en este momento.
              </div>
            ) : (
              pendingReturnOrders.map((order) => {
                const totalDelivered = order.scaffoldingItems.reduce((a, b) => a + b.deliveredQty, 0);
                const totalReturned = order.scaffoldingItems.reduce((a, b) => a + b.returnedQty, 0);
                const remaining = Math.max(0, totalDelivered - totalReturned);

                return (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              order.status === 'vencida'
                                ? 'bg-rose-100 text-rose-800'
                                : order.status === 'parcial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {order.status === 'parcial' ? 'Devolución Parcial' : order.status}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm mt-1">{order.clientName}</h3>
                        <p className="text-xs text-slate-500">{order.worksiteName}</p>
                      </div>

                      <div className="text-right text-xs">
                        <span className="text-[10px] text-slate-500 uppercase block">Fecha Pactada</span>
                        <span className="font-bold text-slate-900">{order.expectedReturnDate}</span>
                      </div>
                    </div>

                    {/* Progress of items in field vs returned */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Andamios entregados: <strong>{totalDelivered} pzas</strong></span>
                        <span className="text-emerald-700 font-bold">Devueltos: {totalReturned} pzas</span>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${totalDelivered > 0 ? (totalReturned / totalDelivered) * 100 : 0}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-800 font-bold">
                          Pendiente en Obra: {remaining} pzas
                        </span>
                        {order.machineryItems.length > 0 && (
                          <span className="text-indigo-800 font-semibold">
                            {order.machineryItems.filter((m) => !m.returned).length} maquinaria en obra
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => onOpenReturnCheckIn(order)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Realizar Check-in de Entrada</span>
                      </button>

                      <button
                        onClick={() => onOpenRemision(order)}
                        className="px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                      >
                        Remisión
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'damages' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Registro de piezas rotas, dobladas o faltantes al momento de la devolución, aplicadas para reposición o deducidas de la garantía.
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-rose-700 uppercase font-semibold block">Total Cobrado por Mermas</span>
              <span className="text-base font-black text-rose-900 font-mono">
                ${totalDamageCharges.toLocaleString('es-MX')} MXN
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Orden / Cliente</th>
                  <th className="p-3">Tipo & Pieza</th>
                  <th className="p-3 text-center">Tipo Daño / Merma</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-right">Costo Cobrado</th>
                  <th className="p-3">Detalle / Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {damages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No hay registros de mermas o daños en el historial.
                    </td>
                  </tr>
                ) : (
                  damages.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="p-3 text-slate-600 font-mono">{d.date}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{d.clientName}</div>
                        <span className="font-mono text-[10px] text-slate-500">{d.rentalId}</span>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{d.itemName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{d.identifier}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            d.issueType === 'faltante'
                              ? 'bg-rose-100 text-rose-800'
                              : d.issueType === 'rotura'
                              ? 'bg-red-100 text-red-800'
                              : d.issueType === 'doblez'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {d.issueType}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">{d.quantity}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-700">
                        ${d.costCharged.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">{d.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
