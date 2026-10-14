import React from 'react';
import { RentalOrder } from '../types';
import { Printer, X, HardHat, FileText, Calendar, MapPin, User, ShieldCheck } from 'lucide-react';

interface RemisionModalProps {
  order: RentalOrder | null;
  onClose: () => void;
}

export const RemisionModal: React.FC<RemisionModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Controls (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold">Remisión de Entrega Oficial • Folio {order.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Remisión Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto print-page bg-white text-slate-900 space-y-6">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-md">
                <HardHat className="w-7 h-7" strokeWidth={2.4} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none uppercase">
                  Andamios & Maquinaria
                </h1>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Renta de Andamios Tubulares, Equipos Ligeros e Instalación
                </p>
                <p className="text-[11px] text-slate-500">
                  Tel: (55) 5820-9900 • contacto@andamiosymaquinaria.com • RFC: AYM-201015-88A
                </p>
              </div>
            </div>

            <div className="text-right sm:self-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">REMISIÓN DE SALIDA</div>
              <div className="text-lg font-black text-amber-600 font-mono">{order.id}</div>
              <div className="text-xs text-slate-600">Fecha: {order.startDate}</div>
            </div>
          </div>

          {/* Client & Worksite Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Cliente */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Datos del Cliente / Arrendatario</span>
              </div>
              <div><strong className="text-slate-800">Razón Social:</strong> {order.clientName}</div>
              <div><strong className="text-slate-800">Teléfono:</strong> {order.clientPhone || 'No registrado'}</div>
              <div><strong className="text-slate-800">Recibió en Obra:</strong> {order.clientReceivedBy || order.siteContact || 'Representante autorizado'}</div>
            </div>

            {/* Obra */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Ubicación de la Obra de Entrega</span>
              </div>
              <div><strong className="text-slate-800">Obra / Proyecto:</strong> {order.worksiteName}</div>
              <div><strong className="text-slate-800">Dirección:</strong> {order.worksiteAddress}</div>
              <div><strong className="text-slate-800">Encargado en Obra:</strong> {order.siteContact} {order.sitePhone ? `(${order.sitePhone})` : ''}</div>
            </div>
          </div>

          {/* Rental Terms Details */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-medium">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Fecha de Salida:</span>
              <span className="font-bold text-slate-900">{order.startDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Devolución Pactada:</span>
              <span className="font-bold text-amber-700">{order.expectedReturnDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Modalidad Tarifa:</span>
              <span className="font-bold uppercase text-slate-900">Por {order.rateType}</span>
            </div>
          </div>

          {/* Scaffolding Table */}
          {order.scaffoldingItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <HardHat className="w-3.5 h-3.5 text-amber-600" />
                <span>Andamios y Piezas Sueltas Entregadas</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Descripción de la Pieza</th>
                      <th className="p-2.5 text-center">Cant. Entregada</th>
                      <th className="p-2.5 text-center">Cant. Devuelta</th>
                      <th className="p-2.5 text-center">Pendiente en Obra</th>
                      <th className="p-2.5 text-right">Reposición c/u</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.scaffoldingItems.map((item) => {
                      const pending = item.deliveredQty - item.returnedQty - item.lostQty;
                      return (
                        <tr key={item.itemId} className="hover:bg-slate-50/50">
                          <td className="p-2.5 font-mono font-medium text-slate-600">{item.code}</td>
                          <td className="p-2.5 font-medium text-slate-900">{item.name}</td>
                          <td className="p-2.5 text-center font-bold text-slate-900">{item.deliveredQty} pza</td>
                          <td className="p-2.5 text-center font-semibold text-emerald-700">{item.returnedQty} pza</td>
                          <td className="p-2.5 text-center font-bold text-amber-700">
                            {pending > 0 ? `${pending} pza` : 'Completado'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-600">
                            ${item.replacementCost.toLocaleString('es-MX')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Machinery Table */}
          {order.machineryItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Maquinaria y Equipos Serializados Asignados</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Equipo</th>
                      <th className="p-2.5">Marca</th>
                      <th className="p-2.5">Número de Serie Único</th>
                      <th className="p-2.5 text-center">Estado de Retorno</th>
                      <th className="p-2.5 text-right">Reposición Equipo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.machineryItems.map((mach) => (
                      <tr key={mach.itemId} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-medium text-slate-900">{mach.name}</td>
                        <td className="p-2.5 text-slate-600">{mach.brand}</td>
                        <td className="p-2.5 font-mono font-bold text-indigo-700">{mach.serialNumber}</td>
                        <td className="p-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              mach.returned
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {mach.returned ? 'Devuelto a Bodega' : 'En Posesión del Cliente'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-600">
                          ${mach.replacementCost.toLocaleString('es-MX')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financial summary snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Subtotal Renta:</span>
              <span className="font-bold text-slate-900">${order.rentalSubtotal.toLocaleString('es-MX')} MXN</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Depósito en Garantía:</span>
              <span className="font-bold text-slate-900">${order.depositAmount.toLocaleString('es-MX')} MXN</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Monto Pagado:</span>
              <span className="font-bold text-emerald-700">${order.amountPaid.toLocaleString('es-MX')} MXN</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Saldo Pendiente:</span>
              <span className="font-bold text-rose-700">${(order.totalDue - order.amountPaid).toLocaleString('es-MX')} MXN</span>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-[10px] text-slate-600 leading-relaxed space-y-1">
            <div className="font-bold text-slate-800 uppercase">Cláusulas de Arrendamiento:</div>
            <p>1. El arrendatario asume la total custodia y conservación de los equipos y piezas de andamio desde el momento de su entrega en obra.</p>
            <p>2. Toda pieza no entregada o dañada (abollada, perforada, quemada, con mezcla petrificada o doblada) causará cargo de reposición o reparación que podrá ser descontado del depósito en garantía o facturado de inmediato.</p>
            <p>3. En caso de devoluciones parciales, el tiempo de renta continuará corriendo proporcionalmente para las piezas y maquinarias que permanezcan en obra.</p>
          </div>

          {/* Signatures Area */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
            <div className="space-y-14">
              <div className="border-b border-slate-400 pb-1 min-h-[40px] flex items-end justify-center font-serif text-slate-700">
                {order.deliveryAuthorizedBy || 'Almacén Central'}
              </div>
              <div>
                <p className="font-bold text-slate-900">Entregó por Andamios & Maquinaria</p>
                <p className="text-[11px] text-slate-500">Nombre, Firma y Chofer / Almacenista</p>
              </div>
            </div>

            <div className="space-y-14">
              <div className="border-b border-slate-400 pb-1 min-h-[40px] flex items-end justify-center font-serif text-slate-700">
                {order.clientReceivedBy || order.siteContact}
              </div>
              <div>
                <p className="font-bold text-slate-900">Recibió Conforme en Obra</p>
                <p className="text-[11px] text-slate-500">Firma, Nombre y Sello de la Constructora</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Hidden when printing) */}
        <div className="no-print px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Formato oficial de entrega y remisión de equipo
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
            >
              Imprimir Remisión
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
