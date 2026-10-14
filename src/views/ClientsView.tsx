import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Client, RentalOrder } from '../types';
import {
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  FileText,
  Clock,
  ChevronDown,
  ChevronRight,
  HardHat,
  Trash2,
} from 'lucide-react';

interface ClientsViewProps {
  onOpenNewClientModal: () => void;
  onOpenRemision: (order: RentalOrder) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewClientModal,
  onOpenRemision,
}) => {
  const { clients, orders, addWorksiteToClient, deleteClient } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);

  // New Worksite sub-form state
  const [showAddWorksite, setShowAddWorksite] = useState(false);
  const [newWorksiteName, setNewWorksiteName] = useState('');
  const [newWorksiteAddress, setNewWorksiteAddress] = useState('');
  const [newSiteContact, setNewSiteContact] = useState('');
  const [newSitePhone, setNewSitePhone] = useState('');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.taxId && c.taxId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId) || filteredClients[0];

  // Client Rental History
  const clientOrders = selectedClient
    ? orders.filter((o) => o.clientId === selectedClient.id)
    : [];

  const handleAddWorksite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newWorksiteName || !newWorksiteAddress) return;

    addWorksiteToClient(selectedClient.id, {
      name: newWorksiteName.trim(),
      address: newWorksiteAddress.trim(),
      siteContact: newSiteContact.trim() || selectedClient.contactPerson,
      sitePhone: newSitePhone.trim() || selectedClient.phone,
    });

    setNewWorksiteName('');
    setNewWorksiteAddress('');
    setNewSiteContact('');
    setNewSitePhone('');
    setShowAddWorksite(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Directorio de Clientes y Obras
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro fiscal, catálogo de ubicaciones físicas de entrega e historial de rentas
          </p>
        </div>

        <button
          onClick={onOpenNewClientModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Cliente</span>
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, RFC, contacto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No se encontraron clientes registrados.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?.id === client.id;
                const activeRentals = orders.filter(
                  (o) =>
                    o.clientId === client.id &&
                    (o.status === 'activa' || o.status === 'parcial' || o.status === 'vencida')
                ).length;

                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 shadow-xs ring-1 ring-amber-500/30'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-xs text-slate-900 leading-tight">
                        {client.name}
                      </div>
                      {activeRentals > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800">
                          {activeRentals} activa{activeRentals > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {client.phone}
                      </span>
                      {client.taxId && (
                        <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">
                          {client.taxId}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{client.worksites.length} obra(s) registrada(s)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Client Details & Worksites (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedClient ? (
            <>
              {/* Client Info Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                      Ficha de Cliente
                    </span>
                    <h2 className="text-lg font-black text-slate-900">{selectedClient.name}</h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-semibold">{selectedClient.contactPerson}</span>
                      {selectedClient.taxId && <span>• RFC: {selectedClient.taxId}</span>}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar al cliente ${selectedClient.name}?`)) {
                        deleteClient(selectedClient.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Eliminar cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Teléfono</span>
                    <span className="font-bold text-slate-900">{selectedClient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Correo</span>
                    <span className="font-bold text-slate-900">{selectedClient.email || 'No registrado'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Dirección Fiscal</span>
                    <span className="text-slate-800">{selectedClient.fiscalAddress || 'Sin dirección fiscal'}</span>
                  </div>
                  {selectedClient.notes && (
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-slate-500 uppercase block font-semibold">Notas</span>
                      <span className="text-slate-600 italic">{selectedClient.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Worksites List & Add Worksite Button */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Direcciones de Obras para Entrega de Equipo ({selectedClient.worksites.length})
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddWorksite(!showAddWorksite)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Obra</span>
                  </button>
                </div>

                {/* Sub-form for adding worksite */}
                {showAddWorksite && (
                  <form
                    onSubmit={handleAddWorksite}
                    className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 space-y-3 animate-in fade-in"
                  >
                    <span className="text-xs font-bold text-amber-900 uppercase">Nueva Obra de Entrega</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Nombre de la Obra *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Torre Corporativa II"
                          value={newWorksiteName}
                          onChange={(e) => setNewWorksiteName(e.target.value)}
                          required
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Encargado en Obra
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Ing. Residente"
                          value={newSiteContact}
                          onChange={(e) => setNewSiteContact(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Dirección Física Completa de Descarga *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, número, colonia, referencias de acceso"
                        value={newWorksiteAddress}
                        onChange={(e) => setNewWorksiteAddress(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddWorksite(false)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 text-xs rounded-lg bg-amber-500 hover:bg-amber-600 font-bold text-slate-950"
                      >
                        Guardar Obra
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5">
                  {selectedClient.worksites.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No hay obras registradas para este cliente.</p>
                  ) : (
                    selectedClient.worksites.map((ws) => (
                      <div
                        key={ws.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{ws.name}</span>
                          {ws.siteContact && (
                            <span className="text-[11px] text-slate-500">Residente: {ws.siteContact}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{ws.address}</span>
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Client History: Past & Active Rentals */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Historial de Rentas & Equipos del Cliente ({clientOrders.length})
                    </h3>
                  </div>
                </div>

                {clientOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Este cliente no tiene historial de órdenes aún.</p>
                ) : (
                  <div className="space-y-3">
                    {clientOrders.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/60 transition space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-700">{order.id}</span>
                            <span className="text-slate-500">• Obra: {order.worksiteName}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              order.status === 'vencida'
                                ? 'bg-rose-100 text-rose-800'
                                : order.status === 'activa'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'parcial'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Breakdown of items rented */}
                        <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg">
                          {order.scaffoldingItems.map((si) => (
                            <div key={si.itemId} className="flex justify-between">
                              <span>• {si.name}</span>
                              <span className="font-semibold">
                                {si.deliveredQty} entregados ({si.returnedQty} devueltos)
                              </span>
                            </div>
                          ))}
                          {order.machineryItems.map((mi) => (
                            <div key={mi.itemId} className="flex justify-between text-indigo-900 font-medium">
                              <span>• {mi.name} ({mi.serialNumber})</span>
                              <span>{mi.returned ? 'Devuelto' : 'En Obra'}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-bold text-slate-900">
                            Total: ${order.totalDue.toLocaleString('es-MX')} MXN
                          </span>
                          <button
                            onClick={() => onOpenRemision(order)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ver Remisión</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Selecciona un cliente de la lista para ver su información y obras de entrega.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
