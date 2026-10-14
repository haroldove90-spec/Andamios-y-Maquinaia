import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { RateType, RentalScaffoldItem, RentalMachineryItem } from '../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Building,
  HardHat,
  ShieldCheck,
  Check,
  AlertCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

interface NewRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated?: (orderId: string) => void;
}

export const NewRentalModal: React.FC<NewRentalModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { clients, scaffolding, machinery, createOrder } = useData();

  // Form State
  const [clientId, setClientId] = useState<string>('');
  const [worksiteId, setWorksiteId] = useState<string>('');
  const [rateType, setRateType] = useState<RateType>('semana');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Selected items
  const [selectedScaffolds, setSelectedScaffolds] = useState<Array<{ itemId: string; quantity: number }>>([]);
  const [selectedMachineryIds, setSelectedMachineryIds] = useState<string[]>([]);
  const [depositAmount, setDepositAmount] = useState<number>(5000);
  const [notes, setNotes] = useState<string>('');
  const [clientReceivedBy, setClientReceivedBy] = useState<string>('');

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === clientId);
  const availableWorksites = currentClient ? currentClient.worksites : [];
  const currentWorksite = availableWorksites.find((w) => w.id === worksiteId);

  // Available machinery only
  const availableMachinery = machinery.filter((m) => m.status === 'disponible');

  // Handle scaffold selection
  const handleAddScaffold = (itemId: string) => {
    if (selectedScaffolds.some((s) => s.itemId === itemId)) return;
    setSelectedScaffolds((prev) => [...prev, { itemId, quantity: 10 }]);
  };

  const handleUpdateScaffoldQty = (itemId: string, quantity: number) => {
    const item = scaffolding.find((s) => s.id === itemId);
    const max = item ? item.availableQty : 1000;
    const cleanQty = Math.max(1, Math.min(quantity, max));
    setSelectedScaffolds((prev) =>
      prev.map((s) => (s.itemId === itemId ? { ...s, quantity: cleanQty } : s))
    );
  };

  const handleRemoveScaffold = (itemId: string) => {
    setSelectedScaffolds((prev) => prev.filter((s) => s.itemId !== itemId));
  };

  // Machinery toggle
  const handleToggleMachinery = (machId: string) => {
    if (selectedMachineryIds.includes(machId)) {
      setSelectedMachineryIds((prev) => prev.filter((id) => id !== machId));
    } else {
      setSelectedMachineryIds((prev) => [...prev, machId]);
    }
  };

  // Calculate pricing
  const calculateTotal = () => {
    let total = 0;

    selectedScaffolds.forEach((sel) => {
      const item = scaffolding.find((s) => s.id === sel.itemId);
      if (!item) return;
      const rate =
        rateType === 'dia'
          ? item.dailyRate
          : rateType === 'semana'
          ? item.weeklyRate
          : item.monthlyRate;
      total += rate * sel.quantity;
    });

    selectedMachineryIds.forEach((mId) => {
      const mach = machinery.find((m) => m.id === mId);
      if (!mach) return;
      const rate =
        rateType === 'dia'
          ? mach.dailyRate
          : rateType === 'semana'
          ? mach.weeklyRate
          : mach.monthlyRate;
      total += rate;
    });

    return total;
  };

  const rentalSubtotal = calculateTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !currentWorksite) {
      alert('Por favor selecciona un cliente y una obra de entrega.');
      return;
    }

    if (selectedScaffolds.length === 0 && selectedMachineryIds.length === 0) {
      alert('Debes agregar al menos una pieza de andamio o equipo de maquinaria.');
      return;
    }

    const orderScaffoldItems: RentalScaffoldItem[] = selectedScaffolds.map((sel) => {
      const item = scaffolding.find((s) => s.id === sel.itemId)!;
      return {
        itemId: item.id,
        code: item.code,
        name: item.name,
        deliveredQty: sel.quantity,
        returnedQty: 0,
        damagedQty: 0,
        lostQty: 0,
        dailyRate: item.dailyRate,
        weeklyRate: item.weeklyRate,
        monthlyRate: item.monthlyRate,
        replacementCost: item.replacementCost,
      };
    });

    const orderMachineryItems: RentalMachineryItem[] = selectedMachineryIds.map((mId) => {
      const mach = machinery.find((m) => m.id === mId)!;
      return {
        itemId: mach.id,
        serialNumber: mach.serialNumber,
        name: mach.name,
        brand: mach.brand,
        returned: false,
        dailyRate: mach.dailyRate,
        weeklyRate: mach.weeklyRate,
        monthlyRate: mach.monthlyRate,
        replacementCost: mach.replacementCost,
      };
    });

    const orderId = createOrder({
      clientId: currentClient.id,
      clientName: currentClient.name,
      clientPhone: currentClient.phone,
      worksiteId: currentWorksite.id,
      worksiteName: currentWorksite.name,
      worksiteAddress: currentWorksite.address,
      siteContact: currentWorksite.siteContact,
      sitePhone: currentWorksite.sitePhone,
      startDate,
      expectedReturnDate,
      status: 'activa',
      rateType,
      scaffoldingItems: orderScaffoldItems,
      machineryItems: orderMachineryItems,
      depositAmount: Number(depositAmount) || 0,
      depositStatus: 'retenido',
      depositReturnedAmount: 0,
      depositNotes: `Depósito en garantía pactado al inicio del contrato.`,
      rentalSubtotal,
      damageFees: 0,
      totalDue: rentalSubtotal,
      amountPaid: 0,
      paymentStatus: 'pendiente',
      payments: [],
      notes,
      deliveryAuthorizedBy: 'Almacén Central',
      clientReceivedBy: clientReceivedBy || currentWorksite.siteContact,
    });

    onClose();
    if (onOrderCreated) {
      onOrderCreated(orderId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Crear Nueva Orden de Renta / Pedido</h2>
              <p className="text-xs text-slate-400">Asignación de equipo, cliente, obra y cálculo de tarifas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Step 1: Cliente y Obra */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Building className="w-4 h-4 text-amber-600" />
              <span>1. Cliente y Dirección de la Obra</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente / Razón Social *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const selCli = clients.find((c) => c.id === e.target.value);
                    if (selCli && selCli.worksites.length > 0) {
                      setWorksiteId(selCli.worksites[0].id);
                    } else {
                      setWorksiteId('');
                    }
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Obra de Entrega *
                </label>
                <select
                  value={worksiteId}
                  onChange={(e) => setWorksiteId(e.target.value)}
                  required
                  disabled={!clientId || availableWorksites.length === 0}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:bg-slate-100"
                >
                  <option value="">-- Seleccionar Obra --</option>
                  {availableWorksites.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.siteContact})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentWorksite && (
              <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0">Dirección:</span>
                <span>{currentWorksite.address}</span>
              </div>
            )}
          </div>

          {/* Step 2: Fechas y Periodicidad */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>2. Periodo de Renta y Tarifa Aplicada</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Salida *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Pactada de Devolución *
                </label>
                <input
                  type="date"
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  required
                  min={startDate}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base de Cobro de Tarifa
                </label>
                <select
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value as RateType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold"
                >
                  <option value="dia">Tarifa por Día</option>
                  <option value="semana">Tarifa por Semana (Estándar)</option>
                  <option value="mes">Tarifa por Mes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Andamios por Volumen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>3. Piezas de Andamio (Control por Cantidad)</span>
              </div>

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddScaffold(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50 font-semibold cursor-pointer"
              >
                <option value="">+ Agregar pieza de andamio...</option>
                {scaffolding
                  .filter((s) => s.availableQty > 0 && !selectedScaffolds.some((sel) => sel.itemId === s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Disponibles: {s.availableQty})
                    </option>
                  ))}
              </select>
            </div>

            {selectedScaffolds.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Ninguna pieza de andamio agregada aún. Selecciona del desplegable superior.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 font-bold text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Pieza</th>
                      <th className="p-2.5 text-center">Disponible</th>
                      <th className="p-2.5 text-center">Cantidad a Rentar</th>
                      <th className="p-2.5 text-right">Tarifa ({rateType})</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                      <th className="p-2.5 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedScaffolds.map((sel) => {
                      const item = scaffolding.find((s) => s.id === sel.itemId);
                      if (!item) return null;
                      const rate =
                        rateType === 'dia'
                          ? item.dailyRate
                          : rateType === 'semana'
                          ? item.weeklyRate
                          : item.monthlyRate;
                      const sub = rate * sel.quantity;

                      return (
                        <tr key={sel.itemId} className="hover:bg-slate-50">
                          <td className="p-2.5 font-medium text-slate-900">
                            <div>{item.name}</div>
                            <span className="text-[10px] text-slate-500 font-mono">{item.code}</span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">
                            {item.availableQty}
                          </td>
                          <td className="p-2.5 text-center">
                            <input
                              type="number"
                              min={1}
                              max={item.availableQty}
                              value={sel.quantity}
                              onChange={(e) =>
                                handleUpdateScaffoldQty(sel.itemId, parseInt(e.target.value) || 1)
                              }
                              className="w-16 px-2 py-1 text-center font-bold border border-slate-300 rounded-lg text-xs"
                            />
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            ${rate.toLocaleString('es-MX')}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            ${sub.toLocaleString('es-MX')}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveScaffold(sel.itemId)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Step 4: Maquinaria Serializada */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>4. Maquinaria y Equipos (Control por Número de Serie)</span>
            </div>

            {availableMachinery.length === 0 ? (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
                No hay equipos de maquinaria disponibles en bodega en este momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableMachinery.map((mach) => {
                  const isChecked = selectedMachineryIds.includes(mach.id);
                  const rate =
                    rateType === 'dia'
                      ? mach.dailyRate
                      : rateType === 'semana'
                      ? mach.weeklyRate
                      : mach.monthlyRate;

                  return (
                    <div
                      key={mach.id}
                      onClick={() => handleToggleMachinery(mach.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">{mach.name}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {mach.serialNumber}
                          </span>
                          <span>{mach.brand}</span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-700">
                          Tarifa ({rateType}): ${rate.toLocaleString('es-MX')} MXN
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 5: Garantía y Observaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Depósito en Garantía Retenido ($ MXN)
              </label>
              <input
                type="number"
                min={0}
                step={500}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Monto devuelto al recibir el equipo completo y sin daños.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recibirá en Obra (Nombre y Cargo)
              </label>
              <input
                type="text"
                placeholder={currentWorksite?.siteContact || 'Ej. Ing. Residente en Obra'}
                value={clientReceivedBy}
                onChange={(e) => setClientReceivedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instrucciones / Observaciones de Entrega
              </label>
              <textarea
                rows={2}
                placeholder="Horario especial de descarga, maniobras requeridas, equipo de seguridad requerido..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing bar */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Cotización Estimada de Renta ({rateType}):</div>
              <div className="text-2xl font-black text-amber-400">
                ${rentalSubtotal.toLocaleString('es-MX')} MXN
              </div>
              <div className="text-[11px] text-slate-400">
                + ${depositAmount.toLocaleString('es-MX')} de depósito en garantía
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
              >
                Generar Orden & Remisión
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
