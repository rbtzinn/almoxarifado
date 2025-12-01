import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getMovementsForItemUpToDate, getStockOnDate } from '../utils/stock'
import { Calendar, Search, ChevronDown, History, Filter } from 'lucide-react'

interface Props { items: AlmoxItem[]; movements: Movement[] }

const HistoryPanel: React.FC<Props> = ({ items, movements }) => {
  const todayIso = new Date().toISOString().slice(0, 10)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)
  const [itemSearch, setItemSearch] = useState<string>('')
  const [isItemOpen, setIsItemOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) { setIsItemOpen(false) }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredItems = useMemo(() => {
    const term = itemSearch.trim().toLowerCase()
    if (!term) return items
    return items.filter(i => i.description.toLowerCase().includes(term))
  }, [items, itemSearch])

  useEffect(() => {
    if (!selectedItemId && filteredItems.length) {
      setSelectedItemId(filteredItems[0].id)
      setItemSearch(filteredItems[0].description)
    }
  }, [filteredItems, selectedItemId])

  const selectedItem = filteredItems.find((i) => i.id === selectedItemId) || null

  const { stock, entradas, saidas, relevantMovs } = useMemo(() => {
    if (!selectedItem) return { stock: 0, entradas: 0, saidas: 0, relevantMovs: [] }
    const relevant = getMovementsForItemUpToDate(selectedItem.id, movements, selectedDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1)) 
    const stockValue = getStockOnDate(selectedItem.id, items, movements, selectedDate)
    const entradasTotal = relevant.filter((m) => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0)
    const saidasTotal = relevant.filter((m) => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0)
    return { stock: stockValue, entradas: entradasTotal, saidas: saidasTotal, relevantMovs: relevant }
  }, [selectedItem, movements, selectedDate, items])

  // --- Estilos Atualizados (Azul Marinho Base) ---
  const inputContainer = "group flex items-center w-full rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-[#0F3B82] dark:focus-within:border-[#00C3E3] focus-within:ring-4 focus-within:ring-[#0F3B82]/10 transition-all h-11 cursor-text overflow-hidden"
  const inputField = "w-full h-full bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 px-3 outline-none"
  const labelClass = "text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block"

  return (
    <section className="bg-white dark:bg-[#0a0f1d] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-full max-h-[520px] overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <header className="p-5 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-[#0a0f1d] shrink-0 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0F3B82]/20 flex items-center justify-center shrink-0 text-[#0F3B82] dark:text-[#00C3E3]">
            <History size={20} strokeWidth={2} />
        </div>
        <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Máquina do Tempo</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">Auditoria e recálculo retroativo.</p>
        </div>
      </header>

      {!items.length ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
             <Filter className="w-5 h-5 text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[150px]">Nenhum item cadastrado para auditar.</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 p-5 gap-5">
          
          {/* Inputs Row */}
          <div className="grid grid-cols-12 gap-4 shrink-0">
            <div className="col-span-4">
              <label className={labelClass}>Data Corte</label>
              <div className={inputContainer}>
                <Calendar className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within:text-[#0F3B82] transition-colors" />
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)} 
                    className={`${inputField} dark:[color-scheme:dark]`} 
                />
              </div>
            </div>

            <div className="col-span-8 relative" ref={dropdownRef}>
              <label className={labelClass}>Item Selecionado</label>
              <div 
                className={`${inputContainer} cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50`} 
                onClick={() => {
                    setIsItemOpen(!isItemOpen)
                    const input = document.getElementById('item-search-input')
                    input?.focus()
                }}
              >
                <Search className="w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within:text-[#0F3B82] transition-colors" />
                <input 
                  id="item-search-input"
                  type="text" 
                  value={itemSearch} 
                  onChange={(e) => { setItemSearch(e.target.value); setIsItemOpen(true) }} 
                  className={inputField} 
                  placeholder="Buscar item..."
                  autoComplete="off"
                />
                <ChevronDown className={`w-4 h-4 text-slate-400 mr-3 transition-transform duration-200 ${isItemOpen ? 'rotate-180' : ''}`} />
              </div>

              {isItemOpen && (
                <div className="absolute z-50 top-full mt-2 left-0 right-0 rounded-xl bg-white dark:bg-[#1f2937] border border-slate-100 dark:border-slate-700 shadow-xl max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                  {filteredItems.map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setSelectedItemId(item.id); setItemSearch(item.description); setIsItemOpen(false) }} 
                      className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#0F3B82]/20 hover:text-[#0F3B82] dark:hover:text-white border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors flex items-center justify-between group"
                    >
                      <span className="truncate">{item.description}</span>
                      {item.id === selectedItemId && <div className="w-1.5 h-1.5 rounded-full bg-[#0F3B82] dark:bg-[#00C3E3]" />}
                    </button>
                  ))}
                  {filteredItems.length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center italic">Nenhum item encontrado.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card de Saldo */}
          {selectedItem && (
            <div className="shrink-0 rounded-2xl bg-[#0F3B82] dark:bg-[#0F3B82]/40 text-white p-5 shadow-xl shadow-[#0F3B82]/20 dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4800BC]/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#4800BC]/60 transition-colors duration-500"></div>
              
              <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#89D700] shadow-[0_0_8px_rgba(137,215,0,0.6)] animate-pulse"></span>
                        <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">
                            Saldo Calculado
                        </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold tracking-tight">{stock}</h3>
                        <span className="text-sm text-blue-200 font-medium">unidades</span>
                    </div>
                    <p className="text-[10px] text-blue-200 mt-1 font-medium">
                        Posição exata em {new Date(selectedDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right space-y-1.5 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-end gap-3 text-[11px]">
                        <span className="text-blue-200 font-medium">Entradas</span>
                        <span className="text-[#89D700] font-bold font-mono">+{entradas}</span>
                    </div>
                    <div className="w-full h-px bg-white/10"></div>
                    <div className="flex items-center justify-end gap-3 text-[11px]">
                        <span className="text-blue-200 font-medium">Saídas</span>
                        <span className="text-[#E30613] font-bold font-mono">-{saidas}</span>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* Timeline Wrapper */}
          <div className="flex-1 min-h-0 flex flex-col relative border-t border-slate-50 dark:border-slate-800 pt-1">
             <div className="absolute top-0 left-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-b-lg z-10 transition-colors">
                 <h3 className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Extrato</h3>
             </div>
            <div className="overflow-y-auto pr-2 flex-1 space-y-0 pt-6 custom-scrollbar">
               {/* Linha vertical */}
               <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
               
               {relevantMovs.map((m) => (
                <div key={m.id} className="group flex gap-3 relative pl-1 mb-4 last:mb-0">
                  {/* Bolinha */}
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-[#0a0f1d] shrink-0 z-10 transition-transform group-hover:scale-110 
                      ${m.type === 'entrada' ? 'bg-[#89D700]' : 'bg-[#E30613]'}`} 
                  />
                  
                  {/* Card Evento */}
                  <div className="flex-1 bg-slate-50 dark:bg-[#111827] hover:bg-white dark:hover:bg-[#1f2937] rounded-xl p-3 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 hover:shadow-sm transition-all duration-200">
                      <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-bold ${m.type === 'entrada' ? 'text-[#6da800] dark:text-[#89D700]' : 'text-[#c40510] dark:text-[#E30613]'}`}>
                             {m.type === 'entrada' ? 'Entrada' : 'Saída'} <span className="text-slate-800 dark:text-slate-200 ml-1">{m.quantity}</span>
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0a0f1d] px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                              {new Date(m.date).toLocaleDateString('pt-BR')}
                          </span>
                      </div>
                      
                      {(m.notes || m.document) ? (
                          <div className="flex flex-col gap-1 mt-2">
                             {m.document && (
                                 <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 self-start px-1.5 py-0.5 rounded font-medium">
                                     DOC: {m.document}
                                 </span>
                             )}
                             {m.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.notes}</p>}
                          </div>
                      ) : (
                          <p className="text-[10px] text-slate-300 dark:text-slate-600 italic">Sem observações.</p>
                      )}
                  </div>
                </div>
              ))}
              
              {!relevantMovs.length && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                      <p className="text-xs">Nenhum registro até esta data.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
export default HistoryPanel