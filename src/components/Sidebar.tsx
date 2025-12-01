import React, { useState, useMemo, useEffect } from 'react'
import { parseItemsFromFile } from '../utils/excel'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import { useTheme } from '../contexts/ThemeContext'
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Package,
  Moon,
  Sun
} from 'lucide-react'
import { AppAlert } from '../components/ui/AppAlert'

interface SidebarProps {
  onCloseMobile: () => void
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
  hasData: boolean
  items: AlmoxItem[]
  movements: Movement[]
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
      console.error('Erro ao ler Excel', err)
      setErrorMessage(
        'Não foi possível ler a planilha. Verifique se o arquivo está no formato .xlsx.'
      )
    } finally {
      setLoading(false)
      e.target.value = ''
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1d] text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-[#1e293b] transition-colors duration-300 relative overflow-hidden">

      {/* Header Sidebar APENAS TEXTO */}
      <div className="p-6 pb-4 flex flex-col shrink-0">
        <div className="flex items-center justify-between">
            <div className="text-left">
                <h1 className="font-extrabold text-[#0F3B82] dark:text-white text-xl tracking-tight leading-none uppercase">
                  Almoxarifado
                </h1>
                <p className="text-[10px] text-[#4800BC] dark:text-[#00C3E3] font-bold uppercase tracking-widest mt-1">
                  Gestão de Estoque
                </p>
            </div>
            
            <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
            <X size={20} />
            </button>
        </div>
      </div>

      <div className="px-6 mb-4 shrink-0">
        <hr className="border-slate-100 dark:border-slate-800" />
      </div>

      {/* Botão de Troca de Tema */}
      <div className="px-6 mb-6 shrink-0">
        <button
          onClick={toggleTheme}
          className="relative w-full h-11 bg-slate-50 dark:bg-[#111827] rounded-xl flex items-center p-1 transition-all border border-slate-200 dark:border-slate-700 shadow-inner"
        >
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-[#1f2937] rounded-lg shadow-sm border border-slate-200/50 dark:border-white/5 transition-all duration-300 ease-out ${theme === 'light' ? 'left-1' : 'left-[calc(50%)]'
              }`}
          />

          <div className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${theme === 'light' ? 'text-[#0F3B82]' : 'text-slate-400'}`}>
            <Sun size={16} className={`transition-all ${theme === 'light' ? 'scale-110 text-[#FFCD00]' : 'scale-90'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Dia</span>
          </div>

          <div className={`flex-1 flex items-center justify-center gap-2 z-10 transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`}>
            <Moon size={16} className={`transition-all ${theme === 'dark' ? 'scale-110 text-[#00C3E3]' : 'scale-90'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Noite</span>
          </div>
        </button>
      </div>

      {/* Área de Importação */}
      <div className="px-6 mb-6 shrink-0">
        <label
          className={`
          group relative flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${hasData
              ? 'border-[#89D700] bg-[#89D700]/10' // Verde Limão Brand
              : 'border-slate-200 dark:border-slate-700 hover:border-[#0F3B82] dark:hover:border-[#00C3E3] hover:bg-blue-50/50 dark:hover:bg-[#0F3B82]/10'
            }
        `}
        >
          <div className="text-center z-10 p-4 flex flex-col items-center">
            {loading ? (
              <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-[#0F3B82] rounded-full mb-2" />
            ) : hasData ? (
              <>
                <div className="w-10 h-10 bg-[#89D700]/20 text-[#6da800] dark:text-[#89D700] rounded-full flex items-center justify-center mb-2 shadow-sm">
                  <FileSpreadsheet size={20} />
                </div>
                <p className="text-xs font-bold text-[#4a7500] dark:text-[#89D700]">Planilha Ativa</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">
                  {fileName || 'dados.xlsx'}
                </p>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#0F3B82]/10 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-all duration-300">
                  <UploadCloud size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-colors">
                  Importar Excel
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Arraste ou clique aqui</p>
              </>
            )}
          </div>
          <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
        </label>

        {/* ALERTA DE ERRO DE IMPORTAÇÃO */}
        {errorMessage && (
          <div className="mt-3">
            <AppAlert
              variant="error"
              title="Erro ao importar"
              message={errorMessage}
              onClose={() => setErrorMessage(null)}
            />
          </div>
        )}

        {hasData && (
          <>
            <div className="mt-3 flex items-center justify-between px-2 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-[#0F3B82] dark:text-[#00C3E3]" />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Itens carregados</span>
              </div>
              <span className="text-xs font-bold text-[#0F3B82] dark:text-white">{currentItemCount}</span>
            </div>

            {/* Card de resumo financeiro */}
            <div className="mt-4 space-y-3">
              {/* Fundo gradiente EMPETUR */}
              <div className="bg-gradient-to-br from-[#0F3B82] to-[#4800BC] rounded-2xl p-4 text-white shadow-lg shadow-[#0F3B82]/20 dark:shadow-none border border-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-blue-200 font-bold">
                      Valor total
                    </p>
                    <p className="text-xl font-bold mt-1">
                      {totalGeral.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                    <CheckCircle2 size={18} className="text-[#89D700]" />
                  </div>
                </div>
                <p className="text-[11px] text-blue-200/80">
                  Somatório em tempo real.
                </p>
              </div>

                            {/* LISTA DE CLASSIFICAÇÕES */}
              {totalPorClassificacao.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  {/* Cabeçalho fixo do card */}
                  <div className="px-3 pt-3 pb-2 border-b border-slate-100/70 dark:border-slate-800/70 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.18em]">
                      Resumo por classificação
                    </p>
                  </div>

                  {/* Área rolável apenas na lista */}
                  <div className="max-h-40 overflow-y-auto custom-scrollbar px-3 py-2">
                    <div className="space-y-1.5 pb-1">
                      {totalPorClassificacao.map(([classification, value]) => (
                        <div
                          key={classification}
                          className="flex items-center justify-between text-[11px] px-1.5 py-1 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors"
                        >
                          <span
                            className="truncate max-w-[130px] text-slate-600 dark:text-slate-400"
                            title={classification}
                          >
                            {classification || 'Sem classificação'}
                          </span>
                          <span className="font-semibold text-[#0F3B82] dark:text-[#00C3E3]">
                            {value.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
export default Sidebar