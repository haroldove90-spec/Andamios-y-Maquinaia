import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RentalOrder } from '../types';
import {
  X,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Receipt,
  FileText,
} from 'lucide-react';

interface PaymentModalProps {
  order: RentalOrder | null;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, onClose }) => {
  const { addPaymentToOrder, updateDepositStatus } = useData();

  const [paymentAmount, setPaymentAmount] = useState<number>(() => {
    if (!order) return 0;
    return Math.max(0, order.totalDue - order.amountPaid);
  });
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia' | 'tarjeta' | 'cheque'>('transferencia');
  const [receiptNumber, setReceiptNumber] = useState<string>(`REC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('Caja Central - Mariana Solís');

  // Deposit Return State
  const [showDepositSection, setShowDepositSection] = useState(false);
  const [depositReturnAmount, setDepositReturnAmount] = useState<number>(() => order ? order.depositAmount : 0);
  const [depositNotes, setDepositNotes] = useState<string>('');

  if (!order) return null;

  const pendingBalance = Math.max(0, order.totalDue - order.amountPaid);

  // Time elapsed calculation
  const start = new Date(order.startDate);
  const expected = new Date(order.expectedReturnDate);
  const today = new Date();
  const diffDaysTotal = Math.max(1, Math.ceil((expected.getTime() - start.getTime()) / (1000 * 3600 * 24)));
  const diffDaysElapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / (1000 * 3600 * 24)));

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      alert('Ingresa un monto de abono mayor a 0');
      return;
    }

    addPaymentToOrder(order.id, {
      date: new Date().toISOString().split('T')[0],
      amount: Number(paymentAmount),
      method: paymentMethod,
      receiptNumber,
      notes,
      receivedBy,
    });

    onClose();
  };

  const handleProcessDepositReturn = () => {
    const retAmount = Number(depositReturnAmount);
    const newStatus =
      retAmount >= order.depositAmount
        ? 'devuelto'
        : retAmount > 0
        ? 'parcialmente_retenido'
        : 'retenido';

    updateDepositStatus(
      order.id,
      newStatus,
      retAmount,
      depositNotes || `Devolución de depósito procesada por ${receivedBy}`
    );
    setShowDepositSection(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Control de Pagos, Tiempos y Garantías</h2>
              <p className="text-xs text-slate-400">
                Folio {order.id} • {order.clientName}
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

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Time Calculation Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Inicio Renta:</span>
              <span className="font-bold text-slate-900">{order.startDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Fecha Pactada:</span>
              <span className="font-bold text-slate-900">{order.expectedReturnDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Días Pactados:</span>
              <span className="font-bold text-blue-700">{diffDaysTotal} días</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Días Transcurridos:</span>
              <span className={`font-bold ${diffDaysElapsed > diffDaysTotal ? 'text-rose-600' : 'text-emerald-700'}`}>
                {diffDaysElapsed} días {diffDaysElapsed > diffDaysTotal ? '(Excedido)' : ''}
              </span>
            </div>
          </div>

          {/* Financial Balance Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total a Cobrar</span>
              <span className="text-base sm:text-lg font-black text-slate-900">
                ${order.totalDue.toLocaleString('es-MX')}
              </span>
              {order.damageFees > 0 && (
                <span className="text-[10px] text-rose-600 block">incluye ${order.damageFees} de daños</span>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Pagado</span>
              <span className="text-base sm:text-lg font-black text-emerald-600">
                ${order.amountPaid.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {order.paymentStatus === 'pagado' ? 'Liquidado' : 'Abonos parciales'}
              </span>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Saldo Pendiente</span>
              <span className={`text-base sm:text-lg font-black ${pendingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                ${pendingBalance.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] text-slate-500 block">MXN</span>
            </div>
          </div>

          {/* Form to Register Payment */}
          {pendingBalance > 0 ? (
            <form onSubmit={handleRegisterPayment} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Registrar Nuevo Cobro / Abono</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monto a Cobrar ($) *</label>
                  <input
                    type="number"
                    min={1}
                    max={pendingBalance}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(pendingBalance)}
                    className="text-[10px] text-blue-600 hover:underline mt-1 block"
                  >
                    Liquidar saldo completo (${pendingBalance.toLocaleString('es-MX')})
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  >
                    <option value="transferencia">Transferencia SPEI</option>
                    <option value="efectivo">Efectivo en Caja</option>
                    <option value="tarjeta">Tarjeta de Crédito / Débito</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. de Recibo / Folio</label>
                  <input
                    type="text"
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Recibido por (Personal)</label>
                  <input
                    type="text"
                    value={receivedBy}
                    onChange={(e) => setReceivedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notas del Cobro</label>
                  <input
                    type="text"
                    placeholder="Referencia bancaria o detalle de pago"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
              >
                Registrar Cobro de ${paymentAmount.toLocaleString('es-MX')} MXN
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold text-emerald-900 block">Orden Totalmente Liquidada</span>
                  <span className="text-[11px] text-emerald-700">No hay saldo pendiente de cobro para esta renta.</span>
                </div>
              </div>
            </div>
          )}

          {/* Deposit Management Section */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Depósito en Garantía</span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  order.depositStatus === 'devuelto'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.depositStatus === 'parcialmente_retenido'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {order.depositStatus === 'devuelto'
                  ? 'Devuelto al Cliente'
                  : order.depositStatus === 'parcialmente_retenido'
                  ? 'Parcialmente Retenido'
                  : 'Retenido en Custodia'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Monto Original en Garantía:</span>
              <span className="font-bold text-slate-900">${order.depositAmount.toLocaleString('es-MX')} MXN</span>
            </div>

            {order.depositReturnedAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Monto Devuelto al Cliente:</span>
                <span className="font-bold text-emerald-700">
                  ${order.depositReturnedAmount.toLocaleString('es-MX')} MXN
                </span>
              </div>
            )}

            {order.depositStatus !== 'devuelto' && (
              <>
                {!showDepositSection ? (
                  <button
                    onClick={() => setShowDepositSection(true)}
                    className="w-full py-2 rounded-lg border border-slate-300 hover:bg-white text-xs font-semibold text-slate-700 transition"
                  >
                    Procesar Devolución del Depósito al Cliente
                  </button>
                ) : (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Monto a Devolver ($)
                        </label>
                        <input
                          type="number"
                          max={order.depositAmount}
                          value={depositReturnAmount}
                          onChange={(e) => setDepositReturnAmount(Number(e.target.value) || 0)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Observaciones
                        </label>
                        <input
                          type="text"
                          placeholder="Devuelto íntegro / Deducido por mermas"
                          value={depositNotes}
                          onChange={(e) => setDepositNotes(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowDepositSection(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleProcessDepositReturn}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                      >
                        Confirmar Devolución
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Payment History Table */}
          {order.payments.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                Historial de Recibos y Abonos Registrados
              </span>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2 text-left">Fecha</th>
                      <th className="p-2 text-left">Recibo</th>
                      <th className="p-2 text-left">Método</th>
                      <th className="p-2 text-left">Atendió</th>
                      <th className="p-2 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 text-slate-600">{p.date}</td>
                        <td className="p-2 font-mono font-bold text-indigo-700">{p.receiptNumber || 'N/A'}</td>
                        <td className="p-2 capitalize text-slate-700">{p.method}</td>
                        <td className="p-2 text-slate-600">{p.receivedBy}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">
                          ${p.amount.toLocaleString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
