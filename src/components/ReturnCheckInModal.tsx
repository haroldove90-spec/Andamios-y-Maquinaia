import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HardHat,
  ShieldCheck,
  Percent,
} from 'lucide-react';

interface ReturnCheckInModalProps {
  order: RentalOrder | null;
  onClose: () => void;
  onCompleted?: () => void;
}

export const ReturnCheckInModal: React.FC<ReturnCheckInModalProps> = ({
  order,
  onClose,
  onCompleted,
}) => {
  const { processReturnCheckIn } = useData();

  // Return quantities state for scaffolds
  const [scaffoldReturns, setScaffoldReturns] = useState<
    Array<{
      itemId: string;
      returnedQty: number;
      damagedQty: number;
      lostQty: number;
    }>
  >(() => {
    if (!order) return [];
    return order.scaffoldingItems.map((item) => {
      const remaining = Math.max(0, item.deliveredQty - item.returnedQty - item.lostQty);
      return {
        itemId: item.itemId,
        returnedQty: remaining, // default to returning remaining, but user can change for partial!
        damagedQty: 0,
        lostQty: 0,
      };
    });
  });

  // Return state for machinery
  const [machineryReturns, setMachineryReturns] = useState<
    Array<{
      itemId: string;
      returned: boolean;
      damaged: boolean;
      damageNotes: string;
    }>
  >(() => {
    if (!order) return [];
    return order.machineryItems.map((m) => ({
      itemId: m.itemId,
      returned: !m.returned, // default to returning if not yet returned
      damaged: false,
      damageNotes: '',
    }));
  });

  const [generalDamageNotes, setGeneralDamageNotes] = useState('');

  if (!order) return null;

  const handleUpdateScaffoldReturn = (
    itemId: string,
    field: 'returnedQty' | 'damagedQty' | 'lostQty',
    value: number
  ) => {
    setScaffoldReturns((prev) =>
      prev.map((r) => (r.itemId === itemId ? { ...r, [field]: Math.max(0, value) } : r))
    );
  };

  const handleReturnHalf = (itemId: string) => {
    const orig = order.scaffoldingItems.find((s) => s.itemId === itemId);
    if (!orig) return;
    const remaining = Math.max(0, orig.deliveredQty - orig.returnedQty - orig.lostQty);
    const half = Math.ceil(remaining / 2);
    handleUpdateScaffoldReturn(itemId, 'returnedQty', half);
  };

  const handleUpdateMachineryReturn = (
    itemId: string,
    field: 'returned' | 'damaged' | 'damageNotes',
    value: any
  ) => {
    setMachineryReturns((prev) =>
      prev.map((m) => (m.itemId === itemId ? { ...m, [field]: value } : m))
    );
  };

  // Estimate damages total
  let estimatedDamages = 0;
  scaffoldReturns.forEach((sr) => {
    const item = order.scaffoldingItems.find((s) => s.itemId === sr.itemId);
    if (item) {
      if (sr.damagedQty > 0) estimatedDamages += Math.round(sr.damagedQty * (item.replacementCost * 0.4));
      if (sr.lostQty > 0) estimatedDamages += sr.lostQty * item.replacementCost;
    }
  });
  machineryReturns.forEach((mr) => {
    const mach = order.machineryItems.find((m) => m.itemId === mr.itemId);
    if (mach && mr.damaged) {
      estimatedDamages += Math.round(mach.replacementCost * 0.15);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    processReturnCheckIn(
      order.id,
      scaffoldReturns,
      machineryReturns,
      generalDamageNotes
    );

    onClose();
    if (onCompleted) {
      onCompleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Check-in de Devolución & Mermas</h2>
              <p className="text-xs text-slate-400">
                Folio {order.id} • {order.clientName} ({order.worksiteName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Quick Notice about Partial Returns */}
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Soporte de Devolución Parcial:</strong> Puedes registrar el retorno de solo una parte del equipo si el cliente conserva piezas en obra.
              </span>
            </div>
          </div>

          {/* Scaffolding return table */}
          {order.scaffoldingItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>Piezas de Andamio a Ingresar a Bodega</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left">Pieza</th>
                      <th className="p-2.5 text-center">Pendiente en Obra</th>
                      <th className="p-2.5 text-center">Cant. que Entra</th>
                      <th className="p-2.5 text-center">Dañadas (Rotas/Dobladas)</th>
                      <th className="p-2.5 text-center">Faltantes/Perdidas</th>
                      <th className="p-2.5 text-center">Acción Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.scaffoldingItems.map((item) => {
                      const remaining = Math.max(0, item.deliveredQty - item.returnedQty - item.lostQty);
                      const ret = scaffoldReturns.find((r) => r.itemId === item.itemId) || {
                        returnedQty: 0,
                        damagedQty: 0,
                        lostQty: 0,
                      };

                      return (
                        <tr key={item.itemId} className="hover:bg-slate-50/60">
                          <td className="p-2.5">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Total entregado: {item.deliveredQty} | Ya devuelto: {item.returnedQty}
                            </div>
                          </td>
                          <td className="p-2.5 text-center font-bold text-amber-700">
                            {remaining} pza
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={remaining}
                              value={ret.returnedQty}
                              onChange={(e) =>
                                handleUpdateScaffoldReturn(
                                  item.itemId,
                                  'returnedQty',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 text-center font-bold border border-blue-400 bg-blue-50/40 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={ret.returnedQty}
                              value={ret.damagedQty}
                              onChange={(e) =>
                                handleUpdateScaffoldReturn(
                                  item.itemId,
                                  'damagedQty',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 text-center font-bold border border-rose-300 bg-rose-50/40 rounded-lg text-xs text-rose-700"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={0}
                              max={remaining - ret.returnedQty}
                              value={ret.lostQty}
                              onChange={(e) =>
                                handleUpdateScaffoldReturn(
                                  item.itemId,
                                  'lostQty',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 px-2 py-1 text-center font-bold border border-rose-300 bg-rose-50/40 rounded-lg text-xs text-rose-800"
                            />
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleReturnHalf(item.itemId)}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold"
                            >
                              50% Mitad
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Machinery Return Section */}
          {order.machineryItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Check-in de Maquinaria Serializada</span>
              </div>

              <div className="space-y-2">
                {order.machineryItems.map((mach) => {
                  const mRet = machineryReturns.find((m) => m.itemId === mach.itemId) || {
                    returned: false,
                    damaged: false,
                    damageNotes: '',
                  };

                  return (
                    <div
                      key={mach.itemId}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{mach.name}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                              {mach.serialNumber}
                            </span>
                            <span>{mach.brand}</span>
                          </div>
                        </div>

                        {mach.returned ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Devuelto anteriormente
                          </span>
                        ) : (
                          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                            <input
                              type="checkbox"
                              checked={mRet.returned}
                              onChange={(e) =>
                                handleUpdateMachineryReturn(mach.itemId, 'returned', e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span>Recibido en Bodega</span>
                          </label>
                        )}
                      </div>

                      {mRet.returned && !mach.returned && (
                        <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <label className="flex items-center gap-2 text-xs font-semibold text-rose-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mRet.damaged}
                              onChange={(e) =>
                                handleUpdateMachineryReturn(mach.itemId, 'damaged', e.target.checked)
                              }
                              className="w-4 h-4 text-rose-600 rounded"
                            />
                            <span>Reportar daño o falla mecánica</span>
                          </label>

                          {mRet.damaged && (
                            <input
                              type="text"
                              placeholder="Describe la avería (motor, banda, tanque, impacto)..."
                              value={mRet.damageNotes}
                              onChange={(e) =>
                                handleUpdateMachineryReturn(
                                  mach.itemId,
                                  'damageNotes',
                                  e.target.value
                                )
                              }
                              className="flex-1 w-full px-2.5 py-1 text-xs border border-rose-300 rounded-lg bg-white"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Damages and Fees Alert */}
          {estimatedDamages > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-rose-900">
                  Cargo estimado por Mermas y Daños: ${estimatedDamages.toLocaleString('es-MX')} MXN
                </h4>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Este importe se descontará del depósito en garantía retenido (${order.depositAmount.toLocaleString('es-MX')} MXN) o se añadirá al saldo pendiente a cobrar al cliente.
                </p>
              </div>
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones del Check-in (Estado de limpieza, responsable de entrega)
            </label>
            <textarea
              rows={2}
              placeholder="El material ingresó con mezcla superficial, fue recibido por Almacén..."
              value={generalDamageNotes}
              onChange={(e) => setGeneralDamageNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Bottom Bar */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400 block">Depósito en Garantía Disponible:</span>
              <span className="text-base font-bold text-amber-400">
                ${order.depositAmount.toLocaleString('es-MX')} MXN
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Registrar Check-in & Actualizar Stock
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
