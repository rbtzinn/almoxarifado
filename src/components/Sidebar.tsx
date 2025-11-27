import React, { useState } from 'react'
import { parseItemsFromFile } from '../utils/excel'
import type { AlmoxItem } from '../types'

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

  // Estilos de Botão Comuns (Minimalistas)
  const btnClass = "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent"
  const btnPrimary = `${btnClass} text-slate-600 hover:bg-slate-50 hover:text-slate-900`
  const btnAction = `${btnClass} border-gray-200 text-slate-700 hover:border-slate-300 bg-white shadow-sm`

  return (
    <div className="flex flex-col h-full bg-white text-slate-600">
      
      {/* Header Sidebar */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-slate-200">
            AX
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">Almoxarifado</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Gestão v2.0</p>
          </div>
        </div>
        {/* Fechar no Mobile */}
        <button onClick={onCloseMobile} className="lg:hidden p-2 text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-6 py-4">
        <hr className="border-gray-100" />
      </div>

      {/* Área de Importação (Destaque) */}
      <div className="px-6 mb-6">
        <label className={`
          group relative flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${hasData 
            ? 'border-emerald-100 bg-emerald-50/30' 
            : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'
          }
        `}>
          <div className="text-center z-10 p-4">
            {loading ? (
               <div className="animate-spin w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full mx-auto"/>
            ) : hasData ? (
               <>
                 <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                 </div>
                 <p className="text-xs font-semibold text-emerald-700">Planilha Ativa</p>
                 <p className="text-[10px] text-emerald-600/70 truncate max-w-[180px]">{fileName || 'dados_importados.xlsx'}</p>
                 <p className="text-[10px] mt-1 text-slate-400">Clique para trocar</p>
               </>
            ) : (
               <>
                 <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                 </div>
                 <p className="text-xs font-semibold text-slate-700">Importar Excel</p>
                 <p className="text-[10px] text-slate-400">Arraste ou clique</p>
               </>
            )}
          </div>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>
        
        {hasData && (
          <div className="mt-4 flex items-center justify-between px-1">
             <span className="text-xs font-medium text-slate-500">Itens carregados</span>
             <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">{currentItemCount}</span>
          </div>
        )}
      </div>

      {/* Menu Navigation / Ações */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        
        {hasData && (
          <>
            <button onClick={onSync} disabled={isSyncing} className={btnPrimary}>
              {isSyncing ? (
                 <span className="w-4 h-4 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin" />
              ) : (
                 <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              )}
              Sync Planilha
            </button>

            <button onClick={onExport} className={btnPrimary}>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Baixar Histórico
            </button>

            <div className="pt-4 pb-2">
              <div className="border-t border-gray-100" />
            </div>

            <button onClick={onClear} className={`${btnClass} text-rose-600 hover:bg-rose-50`}>
              <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Limpar Tudo
            </button>
          </>
        )}
      </nav>

      <div className="p-6">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">Status do Sistema</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-slate-600">Online e Operante</span>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Sidebar