import React, { useState, useMemo, useEffect } from 'react'
import { parseItemsFromFile } from '../utils/excel'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import { useTheme } from '../contexts/ThemeContext'
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Moon,
  Sun,
  PieChart
} from 'lucide-react'
import { AppAlert } from '../components/ui/AppAlert'
import ClassificationModal from './ClassificationModal' // Importando o novo componente

interface SidebarProps {
  onCloseMobile: () => void
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
  hasData: boolean
  items: AlmoxItem[]
  movements: Movement[]
}

type ClassItemInfo = {
  item: AlmoxItem
  stock: number
  total: number
}

const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  onItemsLoaded,
  currentItemCount,
  hasData,
  items,
  movements,
}) => {
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // estado da classificação selecionada (para o modal)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setFileName(file.name)
    setErrorMessage(null)
    try {
      const items = await parseItemsFromFile(file)
      onItemsLoaded(items)
    } catch (err) {
      setErrorMessage('Erro ao ler arquivo. Use .xlsx.')
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  // Mapa: classificação -> lista de itens (com estoque atual e valor total)
  const classificationMap = useMemo(() => {
    const mapa = new Map<string, ClassItemInfo[]>()

    items.forEach((item) => {
      const currentStock = getCurrentStock(item.id, items, movements)
      const valor = currentStock * (item.unitPrice ?? 0)

      if (!Number.isFinite(valor) || Number.isNaN(valor)) return

      const chave = item.classification ? item.classification.trim() : 'OUTROS'
      const lista = mapa.get(chave) ?? []
      lista.push({ item, stock: currentStock, total: valor })
      mapa.set(chave, lista)
    })

    // ordena itens de cada classificação pelo valor total (desc)
    mapa.forEach((lista) => {
      lista.sort((a, b) => b.total - a.total)
    })

    return mapa
  }, [items, movements])

  // Totais por classificação, usando o mapa acima
  const totalPorClassificacao = useMemo(() => {
    return Array.from(classificationMap.entries())
      .map(([classification, lista]) => {
        const total = lista.reduce((sum, info) => sum + info.total, 0)
        return [classification, total] as [string, number]
      })
      .sort((a, b) => b[1] - a[1])
  }, [classificationMap])

  // Itens da classificação atualmente selecionada (para o modal)
  const selectedClassItems = useMemo(() => {
    if (!selectedClass) return []
    return classificationMap.get(selectedClass) ?? []
  }, [selectedClass, classificationMap])

  const totalClassValue = selectedClassItems.reduce(
    (sum, info) => sum + info.total,
    0,
  )

  return (
    <>
      <div className="flex flex-col h-full relative">
        {/* Brand Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center justify-between lg:justify-center mb-6">
            <div className="flex flex-col lg:items-center">
              <span className="text-[10px] font-bold text-[#4800BC] dark:text-[#00C3E3] uppercase tracking-[0.3em] mb-1">
                Sistema
              </span>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                ALMOX<span className="text-[#E30613]">.</span>EMPETUR
              </h2>
            </div>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400"
            >
              <X size={24} />
            </button>
          </div>

          {/* Theme Toggle - Pill Shape */}
          <button
            onClick={toggleTheme}
            className="w-full bg-slate-100 dark:bg-white/5 rounded-full p-1.5 flex relative border border-slate-200 dark:border-white/10"
          >
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-[#0F3B82] rounded-full shadow-sm transition-all duration-300 ${
                theme === 'light' ? 'left-1.5' : 'left-[calc(50%+3px)]'
              }`}
            />
            <div
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                theme === 'light'
                  ? 'text-[#0F3B82]'
                  : 'text-slate-400'
              }`}
            >
              <Sun size={14} /> Light
            </div>
            <div
              className={`flex-1 flex items-center justify-center gap-2 relative z-10 text-[10px] font-bold uppercase tracking-wide transition-colors ${
                theme === 'dark'
                  ? 'text-white'
                  : 'text-slate-400'
              }`}
            >
              <Moon size={14} /> Dark
            </div>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-6 pb-6">
          {/* Upload Area - Glass Style */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
              Fonte de Dados
            </p>
            <label
              className={`
                group relative flex flex-col items-center justify-center w-full aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                ${
                  hasData
                    ? 'border-[#89D700] bg-[#89D700]/5'
                    : 'border-slate-300 dark:border-white/10 hover:border-[#0F3B82] dark:hover:border-[#00C3E3] hover:bg-slate-50 dark:hover:bg-white/5'
                }
             `}
            >
              <div className="flex flex-col items-center gap-3 z-10 transition-transform group-hover:scale-105 duration-300">
                {loading ? (
                  <div className="w-8 h-8 rounded-full border-2 border-[#0F3B82] border-t-transparent animate-spin" />
                ) : hasData ? (
                  <div className="w-12 h-12 rounded-2xl bg-[#89D700] text-[#050912] flex items-center justify-center shadow-lg shadow-[#89D700]/30">
                    <FileSpreadsheet size={24} />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 text-slate-500 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-700 dark:text-white">
                    {hasData ? 'Arquivo Ativo' : 'Importar XLSX'}
                  </p>
                  {fileName && (
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[150px] truncate">
                      {fileName}
                    </p>
                  )}
                </div>
              </div>
              <input
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleFile}
              />
            </label>

            {errorMessage && (
              <AppAlert
                variant="error"
                message={errorMessage}
                onClose={() => setErrorMessage(null)}
              />
            )}
          </div>

          {/* Resumo Categorias */}
          {hasData && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between px-2">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Classificações
                </p>
                <PieChart size={14} className="text-slate-400" />
              </div>

              <div className="space-y-2">
                {totalPorClassificacao.map(([cat, val], idx) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedClass(cat)}
                    className="w-full group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-[#0F3B82]/30 dark:hover:border-[#00C3E3]/30 hover:bg-slate-50/70 dark:hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F3B82]/40 dark:focus:ring-[#00C3E3]/40"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-2 h-8 rounded-full shrink-0 ${
                          ['bg-[#0F3B82]', 'bg-[#FFCD00]', 'bg-[#89D700]', 'bg-[#E30613]'][idx % 4]
                        }`}
                      />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                        {cat}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        style: 'currency',
                        currency: 'BRL',
                      }).format(val)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
            <span>v2.5.0 Future</span>
            <span>EMPETUR</span>
          </div>
        </div>
      </div>

      {/* COMPONENTE DO MODAL (Renderizado via Portal) */}
      <ClassificationModal 
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        classification={selectedClass || ''}
        items={selectedClassItems}
        totalValue={totalClassValue}
      />
    </>
  )
}

export default Sidebar