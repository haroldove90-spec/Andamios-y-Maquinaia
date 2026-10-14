import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ScaffoldItem, MachineryItem } from '../types';
import {
  HardHat,
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  PackageCheck,
  Trash2,
  Edit2,
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewItemModal: (defaultType: 'scaffold' | 'machinery') => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ onOpenNewItemModal }) => {
  const { scaffolding, machinery, deleteScaffoldItem, deleteMachineryItem, updateMachineryItem } = useData();

  const [activeTab, setActiveTab] = useState<'scaffolding' | 'machinery'>('scaffolding');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [machineryStatusFilter, setMachineryStatusFilter] = useState('all');

  // Filtered Scaffolding
  const filteredScaffolding = scaffolding.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filtered Machinery
  const filteredMachinery = machinery.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = machineryStatusFilter === 'all' || item.status === machineryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Summary counts
  const totalScaffPieces = scaffolding.reduce((a, b) => a + b.totalQty, 0);
  const availScaffPieces = scaffolding.reduce((a, b) => a + b.availableQty, 0);
  const rentedScaffPieces = scaffolding.reduce((a, b) => a + b.rentedQty, 0);
  const maintScaffPieces = scaffolding.reduce((a, b) => a + b.maintenanceQty, 0);

  const totalMach = machinery.length;
  const availMach = machinery.filter((m) => m.status === 'disponible').length;
  const rentedMach = machinery.filter((m) => m.status === 'rentado').length;
  const maintMach = machinery.filter((m) => m.status === 'mantenimiento').length;

  return (
    <div className="space-y-6">
      {/* Header with Type Toggle and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Catálogo e Inventario en Tiempo Real
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de andamios tubulares por volumen y maquinaria por número de serie
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenNewItemModal(activeTab === 'scaffolding' ? 'scaffold' : 'machinery')}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>
              {activeTab === 'scaffolding' ? 'Registrar Pieza de Andamio' : 'Registrar Maquinaria'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: Andamios vs Maquinaria */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('scaffolding')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'scaffolding'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HardHat className="w-4 h-4 text-amber-600" />
          <span>Andamios (Piezas Sueltas)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 font-mono">
            {scaffolding.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('machinery')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'machinery'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Maquinaria (Serializada)</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 font-mono">
            {machinery.length}
          </span>
        </button>
      </div>

      {/* 4 Real-time Stock Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cantidad Total</span>
            <PackageCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeTab === 'scaffolding' ? totalScaffPieces : totalMach}
          </div>
          <span className="text-[10px] text-slate-500">
            {activeTab === 'scaffolding' ? 'Piezas registradas' : 'Equipos inventariados'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Disponible en Bodega</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {activeTab === 'scaffolding' ? availScaffPieces : availMach}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Listo para rentar</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-xs font-medium">En Renta (En Obra)</span>
            <HardHat className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">
            {activeTab === 'scaffolding' ? rentedScaffPieces : rentedMach}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Fuera de almacén</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-medium">Reparación / Mantenim.</span>
            <Wrench className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">
            {activeTab === 'scaffolding' ? maintScaffPieces : maintMach}
          </div>
          <span className="text-[10px] text-rose-700 font-semibold">En taller / revisión</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'scaffolding'
                ? 'Buscar por nombre o código (ej. marco, cruceta, AND-MAR)...'
                : 'Buscar por equipo, marca o no. de serie (ej. REV-MP9, revolvedora)...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {activeTab === 'scaffolding' ? (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
          >
            <option value="all">Todas las Categorías</option>
            <option value="marcos">Marcos</option>
            <option value="crucetas">Crucetas</option>
            <option value="plataformas">Plataformas</option>
            <option value="llantas">Llantas</option>
            <option value="tornillos">Tornillos Niveladores</option>
            <option value="accesorios">Accesorios</option>
          </select>
        ) : (
          <select
            value={machineryStatusFilter}
            onChange={(e) => setMachineryStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="disponible">Disponible en Bodega</option>
            <option value="rentado">En Renta / Obra</option>
            <option value="mantenimiento">En Taller</option>
          </select>
        )}
      </div>

      {/* Table: Scaffolding Items */}
      {activeTab === 'scaffolding' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Pieza de Andamio</th>
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">En Bodega</th>
                  <th className="p-3 text-center">En Obra</th>
                  <th className="p-3 text-center">Taller</th>
                  <th className="p-3 text-right">Tarifa Día</th>
                  <th className="p-3 text-right">Tarifa Semana</th>
                  <th className="p-3 text-right">Costo Merma</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredScaffolding.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      No se encontraron piezas registradas con ese criterio.
                    </td>
                  </tr>
                ) : (
                  filteredScaffolding.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-slate-700">{item.code}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{item.category}</div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-900">{item.totalQty}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                          {item.availableQty}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-amber-700">
                        {item.rentedQty > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                            {item.rentedQty}
                          </span>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-rose-700">
                        {item.maintenanceQty > 0 ? item.maintenanceQty : '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        ${item.dailyRate.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">
                        ${item.weeklyRate.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        ${item.replacementCost.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar la pieza ${item.name}?`)) {
                              deleteScaffoldItem(item.id);
                            }
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Eliminar pieza"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Machinery Items */}
      {activeTab === 'machinery' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-3">No. Serie Único</th>
                  <th className="p-3">Equipo</th>
                  <th className="p-3">Marca / Modelo</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3">Cliente / Asignación Actual</th>
                  <th className="p-3 text-right">Tarifa Día</th>
                  <th className="p-3 text-right">Tarifa Semana</th>
                  <th className="p-3 text-right">Reposición</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMachinery.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      No se encontraron equipos registrados.
                    </td>
                  </tr>
                ) : (
                  filteredMachinery.map((mach) => (
                    <tr key={mach.id} className="hover:bg-slate-50/70">
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                          {mach.serialNumber}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{mach.name}</div>
                        <div className="text-[10px] text-slate-500">{mach.powerSource}</div>
                      </td>
                      <td className="p-3 text-slate-700">
                        {mach.brand} {mach.model ? `• ${mach.model}` : ''}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            mach.status === 'disponible'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mach.status === 'rentado'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {mach.status === 'disponible'
                            ? 'Disponible'
                            : mach.status === 'rentado'
                            ? 'En Renta'
                            : 'Mantenimiento'}
                        </span>
                      </td>
                      <td className="p-3">
                        {mach.currentClientName ? (
                          <div className="font-semibold text-slate-900 truncate max-w-[200px]">
                            {mach.currentClientName}
                          </div>
                        ) : (
                          <span className="text-slate-400">En Bodega Central</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-700">
                        ${mach.dailyRate.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-700">
                        ${mach.weeklyRate.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        ${mach.replacementCost.toLocaleString('es-MX')}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {mach.status === 'mantenimiento' && (
                            <button
                              onClick={() => updateMachineryItem(mach.id, { status: 'disponible' })}
                              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold"
                              title="Marcar como reparado y disponible"
                            >
                              Liberar
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar la maquinaria ${mach.name} (${mach.serialNumber})?`)) {
                                deleteMachineryItem(mach.id);
                              }
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar equipo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
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
