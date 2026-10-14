import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  X,
  Trash2,
  RotateCcw,
  Database,
  Download,
  Upload,
  Copy,
  Check,
  AlertOctagon,
  CheckCircle2,
  Server,
  FileCode,
} from 'lucide-react';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    isDemoSuppressed,
    wipeAllSampleData,
    restoreSampleData,
    exportDatabaseJSON,
    importDatabaseJSON,
    getSupabaseSchemaSQL,
    scaffolding,
    machinery,
    clients,
    orders,
    damages,
  } = useData();

  const [activeTab, setActiveTab] = useState<'status' | 'supabase' | 'backup'>('status');
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleWipeData = () => {
    wipeAllSampleData();
    setConfirmDelete(false);
    setSuccessMessage('Se han eliminado todos los datos de muestra. El sistema mantendrá las tablas limpias y listas.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRestoreData = () => {
    restoreSampleData();
    setSuccessMessage('Datos de demostración restaurados correctamente.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportDatabaseJSON());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `andamios_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importDatabaseJSON(text);
      if (success) {
        setSuccessMessage('Datos importados correctamente desde archivo JSON.');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        alert('El archivo no tiene el formato JSON válido del sistema.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Gestión de Datos y Conexión Supabase</h2>
              <p className="text-xs text-slate-400">
                Control de datos de muestra, persistencia en navegador y esquema SQL
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'status'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Datos de Muestra
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'supabase'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Esquema Supabase (SQL)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
              activeTab === 'backup'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Copia de Seguridad (JSON)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl font-extrabold text-slate-900">{scaffolding.length}</span>
                  <p className="text-[11px] text-slate-500 font-medium">Tipos Andamios</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl font-extrabold text-slate-900">{machinery.length}</span>
                  <p className="text-[11px] text-slate-500 font-medium">Maquinarias</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl font-extrabold text-slate-900">{clients.length}</span>
                  <p className="text-[11px] text-slate-500 font-medium">Clientes</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xl font-extrabold text-slate-900">{orders.length}</span>
                  <p className="text-[11px] text-slate-500 font-medium">Órdenes Renta</p>
                </div>
              </div>

              {/* Status Info */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Estado de Datos de Muestra:</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isDemoSuppressed
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {isDemoSuppressed ? 'Datos Demo Desactivados (Limpio)' : 'Datos Demo Activos'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isDemoSuppressed
                    ? 'El navegador tiene activada la protección para no recargar los datos demo en futuras sesiones ni recargas de página. El sistema está limpio para tu operación real o conexión con Supabase.'
                    : 'Actualmente el sistema tiene cargados datos de ejemplo para pruebas de andamios, maquinaria, clientes y rentas.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Borrar todos los datos de muestra del sistema
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">¿Confirmas el borrado de datos de muestra?</h4>
                        <p className="text-xs text-rose-700 mt-1">
                          Esta acción eliminará todos los registros y activará la directiva para que el navegador NO vuelva a cargar datos de muestra automáticamente.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleWipeData}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
                      >
                        Sí, Borrar Todo
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleRestoreData}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  Restaurar datos demo de prueba
                </button>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs mb-1">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Compatibilidad Total con Supabase</span>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  Copia el siguiente script SQL y ejecútalo en el <strong>SQL Editor</strong> de tu proyecto Supabase para crear las 10 tablas, tipos, claves foráneas y políticas de seguridad (RLS).
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Script SQL Supabase DDL:</span>
                <button
                  onClick={handleCopySQL}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                >
                  {copiedSQL ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-60 border border-slate-800">
                {getSupabaseSchemaSQL()}
              </pre>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Exporta o restaura toda la base de datos de tu negocio en formato JSON para respaldos locales independientes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadJSON}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs gap-2 transition"
                >
                  <Download className="w-6 h-6 text-amber-600" />
                  <span>Descargar Respaldo JSON</span>
                  <span className="text-[10px] text-slate-500 font-normal">Exporta todos los datos actuales</span>
                </button>

                <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs gap-2 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-blue-600" />
                  <span>Cargar Archivo JSON</span>
                  <span className="text-[10px] text-slate-500 font-normal">Restaura datos desde un archivo</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
