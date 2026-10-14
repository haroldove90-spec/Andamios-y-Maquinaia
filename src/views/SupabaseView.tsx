import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import {
  Database,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Download,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SupabaseView: React.FC = () => {
  const {
    isDemoSuppressed,
    wipeAllSampleData,
    restoreSampleData,
    getSupabaseSchemaSQL,
    exportDatabaseJSON,
    scaffolding,
    machinery,
    clients,
    orders,
    damages,
  } = useData();

  const [copied, setCopied] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(getSupabaseSchemaSQL());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSQL = () => {
    const element = document.createElement('a');
    const file = new Blob([getSupabaseSchemaSQL()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'supabase_schema_andamios.sql';
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  const handleWipe = () => {
    wipeAllSampleData();
    setConfirmWipe(false);
    setStatusMsg('Se han borrado todos los datos de muestra. El navegador conservará el sistema limpio y no volverá a cargar datos ficticios.');
    setTimeout(() => setStatusMsg(null), 5000);
  };

  const handleRestore = () => {
    restoreSampleData();
    setStatusMsg('Datos de demostración reactivados para pruebas.');
    setTimeout(() => setStatusMsg(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Configuración Supabase & Gestión de Datos
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Preparación para PostgreSQL en la nube, control de borrado de datos de muestra y persistencia
        </p>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Control de Datos de Muestra Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Control de Datos de Muestra</h2>
            <p className="text-xs text-slate-500">
              Desactiva datos demo para comenzar a operar o sincronizar con Supabase
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isDemoSuppressed
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {isDemoSuppressed ? 'Sistema Limpio (Demo Suprimido)' : 'Modo Demostración Activo'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Al presionar <strong>"Borrar datos de muestra"</strong>, se eliminarán todos los registros de prueba y se guardará la bandera en el navegador para que al recargar la página nunca se vuelvan a inyectar datos de demostración automáticamente.
        </p>

        {/* Counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 text-base">{scaffolding.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase">Andamios</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 text-base">{machinery.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase">Maquinaria</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 text-base">{clients.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase">Clientes</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-900 text-base">{orders.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase">Órdenes</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="font-bold text-slate-900 text-base">{damages.length}</span>
            <span className="text-[10px] text-slate-500 block uppercase">Mermas</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          {!confirmWipe ? (
            <button
              onClick={() => setConfirmWipe(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Borrar datos de muestra del todo el sistema</span>
            </button>
          ) : (
            <div className="flex-1 p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-rose-900">
                ¿Confirmas borrar todos los registros y activar supresión en navegador?
              </span>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setConfirmWipe(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleWipe}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  Confirmar Borrado
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleRestore}
            className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Restaurar datos demo</span>
          </button>
        </div>
      </div>

      {/* Supabase Schema Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Esquema PostgreSQL / Supabase Listo
              </h2>
              <p className="text-xs text-slate-500">
                Tablas normalizadas, llaves foráneas, índices y políticas de seguridad (RLS)
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySQL}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar SQL'}</span>
            </button>
            <button
              onClick={handleDownloadSQL}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .sql</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-800">Pasos para conectar con Supabase cuando lo configures:</div>
          <ol className="list-decimal list-inside space-y-1 text-slate-700">
            <li>Crea un proyecto en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">supabase.com</a>.</li>
            <li>Abre el <strong>SQL Editor</strong> en tu panel de Supabase y pega el script a continuación.</li>
            <li>Haz clic en <strong>Run</strong> para aprovisionar las 10 tablas relacionales.</li>
            <li>Añade tus variables en el entorno (<code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>) para habilitar persistencia en la nube directa.</li>
          </ol>
        </div>

        {/* Code View */}
        <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
          {getSupabaseSchemaSQL()}
        </pre>
      </div>
    </div>
  );
};
