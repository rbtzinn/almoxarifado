import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getMovementsForItemUpToDate, getStockOnDate } from '../utils/stock'
import { Clock, Calendar, Search } from 'lucide-react'

interface Props { items: AlmoxItem[]; movements: Movement[] }

const HistoryPanel: React.FC<Props> = ({ items, movements }) => {
  const [selectedId, setSelectedId] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [search, setSearch] = useState('')

  // 🔧 AJUSTE AQUI: filtro + ordenação
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []

    return items
      .filter(i => i.description.toLowerCase().includes(term))
      .sort((a, b) => {
        const aDesc = a.description.toLowerCase()
        const bDesc = b.description.toLowerCase()

        const aStarts = aDesc.startsWith(term)
        const bStarts = bDesc.startsWith(term)

        // Prioriza quem COMEÇA com o termo
        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        // Depois ordena alfabético
        return aDesc.localeCompare(bDesc, 'pt-BR')
      })
  }, [items, search])
  
  React.useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0].id)
  }, [filtered, selectedId])

  const currentItem = items.find(i => i.id === selectedId)

  const { stock, history } = useMemo(() => {
    if (!currentItem) return { stock: 0, history: [] }
    return {
      stock: getStockOnDate(currentItem.id, items, movements, date),
      history: getMovementsForItemUpToDate(currentItem.id, movements, date).sort(
        (a, b) => b.date.localeCompare(a.date),
      ),
    }
  }, [currentItem, movements, date, items])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1d] w-full">
      {/* Header Fixo */}
      <div className="p-6 pb-4 border-b border-slate-100 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-blue-50 dark:bg-[#0F3B82]/20 rounded-xl text-[#0F3B82] dark:text-[#00C3E3]">
            <Clock size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Linha do Tempo</h2>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
              Auditoria de Item
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 relative group z-20">
            <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#0F3B82] outline-none transition-all"
              placeholder="Buscar item..."
            />
            {search && (
              <div className="absolute top-full left-0 w-full bg-white dark:bg-[#1f1f1f] shadow-xl rounded-xl mt-1 max-h-40 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-white/10">
                {filtered.map(i => (
                  <button
                    key={i.id}
                    onClick={() => {
                      setSelectedId(i.id)
                      setSearch('')
                    }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 dark:hover:bg:white/5 truncate border-b border-slate-50 dark:border-white/5 last:border-0 text-slate-600 dark:text-slate-300"
                  >
                    {i.description}
                  </button>
                ))}
                {!filtered.length && (
                  <div className="p-2 text-xs text-center text-slate-400">
                    Nada encontrado.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="w-36 relative z-10">
            <Calendar className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg:white/5 border border-slate-100 dark:border-white/10 rounded-xl text-xs font-medium dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-[#0F3B82]"
            />
          </div>
        </div>
      </div>
      
       {currentItem ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
             {/* Resumo Fixo */}
             <div className="px-6 py-6 text-center bg-gradient-to-b from-transparent to-slate-50/50 dark:to-white/5 shrink-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 truncate px-4">{currentItem.description}</p>
                <div className="text-4xl font-black text-[#0F3B82] dark:text-white tracking-tighter">
                   {stock} <span className="text-sm font-bold text-slate-300">un</span>
                </div>
                <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Posição em {new Date(date).toLocaleDateString('pt-BR')}</p>
                </div>
             </div>

             {/* Área de Scroll Controlada - Max Height para evitar crescimento infinito */}
             <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 relative min-h-[200px] max-h-[350px]">
                <div className="absolute left-[29px] top-0 bottom-0 w-px bg-slate-100 dark:bg-white/10" />
                
                {history.map((mov) => (
                   <div key={mov.id} className="flex gap-4 mb-4 relative group last:mb-0">
                      <div className={`
                         w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 border-4 border-white dark:border-[#0a0f1d] shadow-sm transition-transform group-hover:scale-110
                         ${mov.type === 'entrada' ? 'bg-[#89D700] text-[#050912]' : 'bg-[#E30613] text-white'}
                      `}>
                         <span className="text-[10px] font-bold">{mov.type === 'entrada' ? '+' : '-'}</span>
                      </div>
                      
                      <div className="flex-1 bg-slate-50 dark:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 rounded-xl p-3 transition-all">
                         <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{mov.quantity} unidades</span>
                            <span className="text-[10px] text-slate-400">{new Date(mov.date).toLocaleDateString('pt-BR')}</span>
                         </div>
                         {mov.document && (
                            <div className="inline-block px-1.5 py-0.5 rounded bg-white dark:bg-black/20 text-[9px] font-mono text-slate-500 mb-1 border border-slate-100 dark:border-white/5">
                               DOC: {mov.document}
                            </div>
                         )}
                         {mov.notes && <p className="text-[10px] text-slate-500 italic leading-relaxed">"{mov.notes}"</p>}
                      </div>
                   </div>
                ))}
                
                {!history.length && (
                   <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600 gap-2">
                      <div className="w-1 h-8 bg-slate-100 dark:bg-white/5 rounded-full" />
                      <p className="text-[10px] font-medium uppercase tracking-wide">Sem histórico</p>
                   </div>
                )}
             </div>
          </div>
       ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 p-8 text-center min-h-[300px]">
             <Search size={32} strokeWidth={1.5} className="mb-3 opacity-50" />
             <p className="text-xs font-medium">Selecione um item acima para<br/>iniciar a auditoria.</p>
          </div>
       )}
    </div>
  )
}

export default HistoryPanel