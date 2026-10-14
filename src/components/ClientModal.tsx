import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { X, Plus, Building, MapPin, User, Trash2 } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose }) => {
  const { addClient } = useData();

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('');
  const [fiscalAddress, setFiscalAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Initial worksite
  const [worksiteName, setWorksiteName] = useState('');
  const [worksiteAddress, setWorksiteAddress] = useState('');
  const [siteContact, setSiteContact] = useState('');
  const [sitePhone, setSitePhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Ingresa el nombre o razón social y el teléfono del cliente.');
      return;
    }

    const worksites = worksiteName && worksiteAddress
      ? [
          {
            id: `ws-${Date.now()}`,
            name: worksiteName.trim(),
            address: worksiteAddress.trim(),
            siteContact: siteContact.trim() || contactPerson,
            sitePhone: sitePhone.trim() || phone,
          },
        ]
      : [];

    addClient({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      taxId: taxId.toUpperCase().trim(),
      fiscalAddress: fiscalAddress.trim(),
      notes: notes.trim(),
      worksites,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Registrar Nuevo Cliente y Obra</h2>
              <p className="text-xs text-slate-400">Directorio de clientes y ubicación física de entregas</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Building className="w-4 h-4 text-amber-600" />
              <span>Datos Fiscales y de Contacto</span>
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre o Razón Social *
              </label>
              <input
                type="text"
                placeholder="Ej. Constructora Delta S.A. de C.V."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  placeholder="Ej. Arq. Rodrigo Peña"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RFC / Identificación Fiscal
                </label>
                <input
                  type="text"
                  placeholder="Ej. CDE-190822-KP1"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Principal *</label>
                <input
                  type="text"
                  placeholder="Ej. 55 4492 0012"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="compras@empresa.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección Fiscal / Oficina
              </label>
              <input
                type="text"
                placeholder="Calle, Número, Colonia, Ciudad, C.P."
                value={fiscalAddress}
                onChange={(e) => setFiscalAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Worksite */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Dirección de Obra Inicial (Lugar de Entrega del Equipo)</span>
            </span>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Obra o Proyecto
              </label>
              <input
                type="text"
                placeholder="Ej. Torre Esmeralda Lote 4"
                value={worksiteName}
                onChange={(e) => setWorksiteName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección Física Completa de la Obra
              </label>
              <input
                type="text"
                placeholder="Ubicación física donde el camión descargará los andamios"
                value={worksiteAddress}
                onChange={(e) => setWorksiteAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residente / Encargado en Obra
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ing. Marco Aurelio"
                  value={siteContact}
                  onChange={(e) => setSiteContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono en Obra
                </label>
                <input
                  type="text"
                  placeholder="Ej. 55 9812 3344"
                  value={sitePhone}
                  onChange={(e) => setSitePhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                />
              </div>
            </div>
          </div>

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
              Guardar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
