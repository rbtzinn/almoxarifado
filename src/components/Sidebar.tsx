// src/components/Sidebar.tsx
import React, { useState } from 'react'
import { parseItemsFromFile } from '../utils/excel'
import type { AlmoxItem } from '../types'
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileSpreadsheet, 
  RefreshCw, 
  Download, 
  Trash2, 
  X,
  CheckCircle2,
  Package
} from 'lucide-react'

interface SidebarProps {
  onCloseMobile: () => void
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
  onClear: () => void
  onExport: () => void
  onSync: () => void
  isSyncing: boolean
  hasData: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  onItemsLoaded,
  currentItemCount,
  onClear,
  onExport,
  onSync,
  isSyncing,
  hasData
}) => {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setFileName(file.name)
    try {
      const items = await parseItemsFromFile(file)
      onItemsLoaded(items)
    } catch (err) {
      alert('Erro ao ler Excel.')
    } finally {
      setLoading(false)
    }
  }

  // Estilos de Botão
  const btnClass = "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent group"
  const btnPrimary = `${btnClass} text-slate-600 hover:bg-indigo-50 hover:text-indigo-700`
  const btnDanger = `${btnClass} text-rose-600 hover:bg-rose-50 hover:text-rose-700 mt-auto`

  return (
    <div className="flex flex-col h-full bg-white text-slate-600">
      
      {/* Header Sidebar */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight leading-none">Almoxarifado</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Gestão v2.0</p>
          </div>
        </div>
        <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-6">
        <hr className="border-slate-100" />
      </div>

      {/* Área de Importação */}
      <div className="px-6 mb-6">
        <label className={`
          group relative flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${hasData 
            ? 'border-emerald-200 bg-emerald-50/50' 
            : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30'
          }
        `}>
          <div className="text-center z-10 p-4 flex flex-col items-center">
            {loading ? (
               <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full mb-2"/>
            ) : hasData ? (
               <>
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
                   <FileSpreadsheet size={20} />
                 </div>
                 <p className="text-xs font-bold text-emerald-700">Planilha Ativa</p>
                 <p className="text-[10px] text-emerald-600/70 truncate max-w-[140px] mt-0.5">{fileName || 'dados.xlsx'}</p>
               </>
            ) : (
               <>
                 <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-300">
                   <UploadCloud size={20} />
                 </div>
                 <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">Importar Excel</p>
                 <p className="text-[10px] text-slate-400 mt-1">Arraste ou clique aqui</p>
               </>
            )}
          </div>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>
        
        {hasData && (
          <div className="mt-3 flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
             <div className="flex items-center gap-2">
                <Package size={14} className="text-slate-400"/>
                <span className="text-xs font-medium text-slate-500">Itens carregados</span>
             </div>
             <span className="text-xs font-bold text-slate-800">{currentItemCount}</span>
          </div>
        )}
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar flex flex-col pb-4">
        {hasData ? (
          <>
            <button onClick={onSync} disabled={isSyncing} className={btnPrimary}>
              {isSyncing ? (
                 <RefreshCw size={18} className="animate-spin text-indigo-600" />
              ) : (
                 <RefreshCw size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              )}
              Sync Planilha
            </button>

            <button onClick={onExport} className={btnPrimary}>
              <Download size={18} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
              Baixar Histórico
            </button>

            <div className="my-4 border-t border-slate-100 mx-2" />

            <button onClick={onClear} className={btnDanger}>
              <Trash2 size={18} className="opacity-70 group-hover:opacity-100" />
              Limpar Tudo
            </button>
          </>
        ) : (
          <div className="px-4 py-8 text-center opacity-50">
             <p className="text-xs text-slate-400">Importe uma planilha para habilitar as ações.</p>
          </div>
        )}
      </nav>

      {/* Footer Status */}
      <div className="p-6 pt-2">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute top-0 left-0 opacity-75"></span>
          </div>
          <div>
             <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status</p>
             <p className="text-xs font-semibold text-slate-700">Sistema Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Sidebar