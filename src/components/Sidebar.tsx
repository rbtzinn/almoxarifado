import React, { useState, useMemo, useEffect } from 'react'
import { parseItemsFromFile } from '../utils/excel'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import { useTheme } from '../contexts/ThemeContext'
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileSpreadsheet, 
  RefreshCw, 
  Download, 
  Trash2, 
  X,
  CheckCircle2,
  Package,
  Moon,
  Sun
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
  items: AlmoxItem[]
  movements: Movement[]
}

const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  onItemsLoaded,
  currentItemCount,
  onClear,
  onExport,
  onSync,
  isSyncing,
  hasData,
  items,
  movements,
}) => {
  const { theme, toggleTheme } = useTheme()
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

  // === SOMATÓRIO EM TEMPO REAL ===
  const totalPorClassificacao = useMemo(() => {
    const mapa = new Map<string, number>()
    items.forEach((item) => {
      const currentStock = getCurrentStock(item.id, items, movements)
      const valor = currentStock * item.unitPrice
      if (!Number.isFinite(valor) || Number.isNaN(valor)) return
      const chave = item.classification ? item.classification.trim() : 'SEM CLASSIFICAÇÃO'
      mapa.set(chave, (mapa.get(chave) ?? 0) + valor)
    })
    const arr = Array.from(mapa.entries())
    arr.sort((a, b) => b[1] - a[1])
    return arr
  }, [items, movements])

  const totalGeral = useMemo(
    () => totalPorClassificacao.reduce((sum, [, value]) => sum + value, 0),
    [totalPorClassificacao],
  )

  useEffect(() => {
    try {
      const payload = {
        updatedAt: new Date().toISOString(),
        totalGeral,
        porClassificacao: totalPorClassificacao.map(([classification, value]) => ({
          classification,
          value,
        })),
      }
      localStorage.setItem('almox_totals_v1', JSON.stringify(payload))
    } catch (e) {
      console.error('Erro ao salvar totais', e)
    }
  }, [totalGeral, totalPorClassificacao])

  // Estilos de Botão
  const btnClass = 'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent group'
  
  // Botão Primário
  const btnPrimary = `${btnClass} text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-700 dark:hover:text-indigo-400`
  
  // Botão Perigo
  const btnDanger = `${btnClass} text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-700 mt-auto`

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Sidebar */}
      <div className="p-6 pb-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200 dark:shadow-none transition-colors">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight leading-none">
              Almoxarifado
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
              Gestão v2.0
            </p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-4 shrink-0">
        <hr className="border-slate-100 dark:border-slate-800" />
      </div>

      {/* NOVO Botão de Troca de Tema (Estilo Segmentado) */}
      <div className="px-6 mb-6 shrink-0">
        <button 
          onClick={toggleTheme}
          className="relative w-full h-11 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center p-1 transition-all border border-slate-200 dark:border-slate-800 shadow-inner"
        >
          {/* Fundo Ativo Animado */}
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5 transition-all duration-300 ease-out ${
              theme === 'light' ? 'left-1' : 'left-[calc(50%)]'
            }`} 
          />

          {/* Opção Light */}
          <div className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${theme === 'light' ? 'text-slate-800' : 'text-slate-400'}`}>
            <Sun size={16} className={`transition-all ${theme === 'light' ? 'text-amber-500 fill-amber-500 scale-110' : 'scale-90'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
          </div>

          {/* Opção Dark */}
          <div className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>
            <Moon size={16} className={`transition-all ${theme === 'dark' ? 'text-indigo-400 fill-indigo-400 scale-110' : 'scale-90'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
          </div>
        </button>
      </div>

      {/* Área de Importação */}
      <div className="px-6 mb-6 shrink-0">
        <label
          className={`
          group relative flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${
            hasData
              ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10'
              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
          }
        `}
        >
          <div className="text-center z-10 p-4 flex flex-col items-center">
            {loading ? (
              <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-indigo-600 rounded-full mb-2" />
            ) : hasData ? (
              <>
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <FileSpreadsheet size={20} />
                </div>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Planilha Ativa</p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/50 truncate max-w-[140px] mt-0.5">
                  {fileName || 'dados.xlsx'}
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all duration-300">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Importar Excel
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Arraste ou clique aqui</p>
              </>
            )}
          </div>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>

        {hasData && (
          <>
            <div className="mt-3 flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Itens carregados</span>
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-white">{currentItemCount}</span>
            </div>

            {/* Card de resumo financeiro */}
            <div className="mt-4 space-y-3">
              <div className="bg-slate-900 dark:bg-indigo-950 rounded-2xl p-4 text-white shadow-lg shadow-slate-200 dark:shadow-none border border-transparent dark:border-indigo-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">
                      Valor total
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {totalGeral.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-400/60">
                    <CheckCircle2 size={18} className="text-emerald-300" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Somatório em tempo real.
                </p>
              </div>

              {/* LISTA DE CLASSIFICAÇÕES */}
              {totalPorClassificacao.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-3 max-h-64 overflow-y-auto custom-scrollbar">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-slate-50 dark:bg-slate-900 pb-1">
                    Resumo por Classificação
                  </p>
                  <div className="space-y-1.5">
                    {totalPorClassificacao.map(([classification, value]) => (
                      <div
                        key={classification}
                        className="flex items-center justify-between text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors"
                      >
                        <span className="truncate max-w-[120px] text-slate-600 dark:text-slate-400" title={classification}>
                          {classification || 'Sem classificação'}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Menu Navigation - SEM OVERFLOW INTERNO */}
      <nav className="flex-1 px-4 space-y-1 flex flex-col pb-4">
        {hasData ? (
          <>
            <button onClick={onSync} disabled={isSyncing} className={btnPrimary}>
              {isSyncing ? (
                <RefreshCw size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              ) : (
                <RefreshCw
                  size={18}
                  className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                />
              )}
              Sync Planilha
            </button>

            <button onClick={onExport} className={btnPrimary}>
              <Download
                size={18}
                className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
              />
              Baixar Histórico
            </button>

            <div className="my-4 border-t border-slate-100 dark:border-slate-800 mx-2" />

            <button onClick={onClear} className={btnDanger}>
              <Trash2 size={18} className="opacity-70 group-hover:opacity-100" />
              Limpar Tudo
            </button>
          </>
        ) : (
          <div className="px-4 py-8 text-center opacity-50">
            <p className="text-xs text-slate-400 dark:text-slate-600">Importe uma planilha para habilitar as ações.</p>
          </div>
        )}
      </nav>
    </div>
  )
}
export default Sidebar