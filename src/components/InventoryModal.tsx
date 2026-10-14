import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ScaffoldCategory, MachineryStatus } from '../types';
import { X, Plus, HardHat, ShieldCheck } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'scaffold' | 'machinery';
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'scaffold',
}) => {
  const { addScaffoldItem, addMachineryItem } = useData();
  const [itemType, setItemType] = useState<'scaffold' | 'machinery'>(defaultType);

  // Scaffold form state
  const [scaffCode, setScaffCode] = useState('');
  const [scaffName, setScaffName] = useState('');
  const [scaffCategory, setScaffCategory] = useState<ScaffoldCategory>('marcos');
  const [scaffDescription, setScaffDescription] = useState('');
  const [scaffTotalQty, setScaffTotalQty] = useState(50);
  const [scaffDailyRate, setScaffDailyRate] = useState(18);
  const [scaffWeeklyRate, setScaffWeeklyRate] = useState(85);
  const [scaffMonthlyRate, setScaffMonthlyRate] = useState(260);
  const [scaffReplacementCost, setScaffReplacementCost] = useState(750);

  // Machinery form state
  const [machSerial, setMachSerial] = useState('');
  const [machName, setMachName] = useState('');
  const [machBrand, setMachBrand] = useState('M-Power');
  const [machModel, setMachModel] = useState('');
  const [machPower, setMachPower] = useState('Gasolina');
  const [machStatus, setMachStatus] = useState<MachineryStatus>('disponible');
  const [machDailyRate, setMachDailyRate] = useState(350);
  const [machWeeklyRate, setMachWeeklyRate] = useState(1750);
  const [machMonthlyRate, setMachMonthlyRate] = useState(5200);
  const [machReplacementCost, setMachReplacementCost] = useState(28000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (itemType === 'scaffold') {
      if (!scaffName || !scaffCode) {
        alert('Ingresa el código y el nombre de la pieza.');
        return;
      }
      addScaffoldItem({
        code: scaffCode.toUpperCase().trim(),
        name: scaffName.trim(),
        category: scaffCategory,
        description: scaffDescription,
        unit: 'pieza',
        totalQty: Number(scaffTotalQty),
        availableQty: Number(scaffTotalQty), // all initially available
        rentedQty: 0,
        maintenanceQty: 0,
        dailyRate: Number(scaffDailyRate),
        weeklyRate: Number(scaffWeeklyRate),
        monthlyRate: Number(scaffMonthlyRate),
        replacementCost: Number(scaffReplacementCost),
      });
    } else {
      if (!machName || !machSerial) {
        alert('Ingresa el nombre del equipo y el número de serie único.');
        return;
      }
      addMachineryItem({
        serialNumber: machSerial.toUpperCase().trim(),
        name: machName.trim(),
        brand: machBrand.trim(),
        model: machModel.trim(),
        powerSource: machPower,
        status: machStatus,
        dailyRate: Number(machDailyRate),
        weeklyRate: Number(machWeeklyRate),
        monthlyRate: Number(machMonthlyRate),
        replacementCost: Number(machReplacementCost),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar en Catálogo e Inventario</h2>
              <p className="text-xs text-slate-400">Alta de piezas de andamio o maquinaria serializada</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Andamio vs Maquinaria */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setItemType('scaffold')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              itemType === 'scaffold'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HardHat className="w-4 h-4" />
            <span>Andamio (Pieza por Volumen)</span>
          </button>
          <button
            type="button"
            onClick={() => setItemType('machinery')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
              itemType === 'machinery'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Maquinaria (Equipo Serializado)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {itemType === 'scaffold' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. AND-MAR-200"
                    value={scaffCode}
                    onChange={(e) => setScaffCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría de Pieza *
                  </label>
                  <select
                    value={scaffCategory}
                    onChange={(e) => setScaffCategory(e.target.value as ScaffoldCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                  >
                    <option value="marcos">Marcos</option>
                    <option value="crucetas">Crucetas / Tijeras</option>
                    <option value="plataformas">Plataformas Metálicas</option>
                    <option value="llantas">Llantas con Freno</option>
                    <option value="tornillos">Tornillos Niveladores</option>
                    <option value="accesorios">Coples y Accesorios</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de la Pieza *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Marco Banquetero 2.00 x 0.80 m"
                  value={scaffName}
                  onChange={(e) => setScaffName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cantidad Total en Bodega *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={scaffTotalQty}
                    onChange={(e) => setScaffTotalQty(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Costo de Reposición / Merma ($) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={scaffReplacementCost}
                    onChange={(e) => setScaffReplacementCost(Number(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-rose-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Rates */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Tarifas de Renta por Periodo ($ MXN)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Día</label>
                    <input
                      type="number"
                      value={scaffDailyRate}
                      onChange={(e) => setScaffDailyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Semana</label>
                    <input
                      type="number"
                      value={scaffWeeklyRate}
                      onChange={(e) => setScaffWeeklyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Mes</label>
                    <input
                      type="number"
                      value={scaffMonthlyRate}
                      onChange={(e) => setScaffMonthlyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Machinery Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Serie Único *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. REV-KOH-008"
                    value={machSerial}
                    onChange={(e) => setMachSerial(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Combustible / Motor
                  </label>
                  <select
                    value={machPower}
                    onChange={(e) => setMachPower(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Gasolina">Gasolina (4 Tiempos)</option>
                    <option value="Eléctrico">Eléctrico 110V/220V</option>
                    <option value="Diésel">Diésel Industrial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Revolvedora de 1 Saco Kohler 9.5HP"
                  value={machName}
                  onChange={(e) => setMachName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Kohler / Honda / Mikasa"
                    value={machBrand}
                    onChange={(e) => setMachBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. GX390 / MTX70"
                    value={machModel}
                    onChange={(e) => setMachModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Inicial
                  </label>
                  <select
                    value={machStatus}
                    onChange={(e) => setMachStatus(e.target.value as MachineryStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="disponible">Disponible en Bodega</option>
                    <option value="mantenimiento">En Taller / Mantenimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Costo Reposición Equipo ($)
                  </label>
                  <input
                    type="number"
                    value={machReplacementCost}
                    onChange={(e) => setMachReplacementCost(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-rose-700"
                  />
                </div>
              </div>

              {/* Machinery Rates */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                  Tarifas de Renta ($ MXN)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Día</label>
                    <input
                      type="number"
                      value={machDailyRate}
                      onChange={(e) => setMachDailyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Semana</label>
                    <input
                      type="number"
                      value={machWeeklyRate}
                      onChange={(e) => setMachWeeklyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Tarifa Mes</label>
                    <input
                      type="number"
                      value={machMonthlyRate}
                      onChange={(e) => setMachMonthlyRate(Number(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
            >
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
