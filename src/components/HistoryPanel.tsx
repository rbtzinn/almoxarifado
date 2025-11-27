import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getMovementsForItemUpToDate, getStockOnDate } from '../utils/stock'

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
}

const HistoryPanel: React.FC<Props> = ({ items, movements }) => {
  const todayIso = new Date().toISOString().slice(0, 10)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)
  
  // States de Busca Customizada
  const [itemSearch, setItemSearch] = useState<string>('')
  const [isItemOpen, setIsItemOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) { setIsItemOpen(false) }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtra itens
  const filteredItems = useMemo(() => {
    const term = itemSearch.trim().toLowerCase()
    if (!term) return items
    return items.filter(i => i.description.toLowerCase().includes(term))
  }, [items, itemSearch])

  // Seleciona o primeiro automaticamente se nada selecionado
  useEffect(() => {
    if (!selectedItemId && filteredItems.length) {
      setSelectedItemId(filteredItems[0].id)
      setItemSearch(filteredItems[0].description)
    }
  }, [filteredItems, selectedItemId])

  const selectedItem = filteredItems.find((i) => i.id === selectedItemId) || null

  // Cálculos de estoque na data
  const { stock, entradas, saidas, relevantMovs } = useMemo(() => {
    if (!selectedItem) return { stock: 0, entradas: 0, saidas: 0, relevantMovs: [] }
    
    const relevant = getMovementsForItemUpToDate(selectedItem.id, movements, selectedDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1)) // Mais recente no topo

    const stockValue = getStockOnDate(selectedItem.id, items, movements, selectedDate)
    const entradasTotal = relevant.filter((m) => m.type === 'entrada').reduce((sum, m) => sum + m.quantity, 0)
    const saidasTotal = relevant.filter((m) => m.type === 'saida').reduce((sum, m) => sum + m.quantity, 0)

    return { stock: stockValue, entradas: entradasTotal, saidas: saidasTotal, relevantMovs: relevant }
  }, [selectedItem, movements, selectedDate, items])

  // Estilos Clean Atualizados (Maior contraste e tamanho)
  const inputClass = "w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm text-slate-700 placeholder:text-gray-400 focus:bg-white focus:border-slate-200 focus:ring-0 transition-all outline-none"
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 ml-1"

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="mb-6 border-b border-gray-50 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Máquina do Tempo</h2>
        <p className="text-sm text-slate-400">Analise o saldo em datas passadas.</p>
      </div>

      {!items.length ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic border-2 border-dashed border-gray-50 rounded-xl m-4">
          Aguardando itens...
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden"> {/* Container Flexível */}
          
          {/* Controles de Filtro */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 shrink-0">
            <div>
              <label className={labelClass}>Data Limite</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClass} />
            </div>
            <div className="sm:col-span-2 relative" ref={dropdownRef}>
              <label className={labelClass}>Item</label>
              <input 
                type="text" 
                value={itemSearch} 
                onChange={(e) => { setItemSearch(e.target.value); setIsItemOpen(true) }} 
                onClick={() => setIsItemOpen(!isItemOpen)}
                className={inputClass}
                placeholder="Buscar item..."
              />
              {isItemOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-xl bg-white border border-gray-100 shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => { setSelectedItemId(item.id); setItemSearch(item.description); setIsItemOpen(false) }} 
                      className="px-4 py-3 text-sm text-slate-600 hover:bg-gray-50 hover:text-slate-900 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                    >
                      {item.description}
                    </div>
                  ))}
                  {filteredItems.length === 0 && <div className="px-4 py-3 text-xs text-slate-400">Nenhum item encontrado.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Card de Resumo (Estilo Minimalista Dark) */}
          {selectedItem && (
            <div className="shrink-0 rounded-2xl bg-slate-900 text-white p-6 shadow-lg shadow-slate-200 mb-6 flex justify-between items-end relative overflow-hidden group">
              {/* Efeito sutil de brilho no hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-all duration-700"></div>

              <div className="relative z-10">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                  Saldo em {new Date(selectedDate).toLocaleDateString('pt-BR')}
                </p>
                <h3 className="text-4xl font-bold tracking-tight">{stock}</h3>
              </div>
              <div className="relative z-10 text-right">
                <div className="flex gap-4 text-xs font-medium">
                  <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+{entradas} Entradas</span>
                  <span className="text-rose-400 bg-rose-400/10 px-2 py-1 rounded">-{saidas} Saídas</span>
                </div>
              </div>
            </div>
          )}

          {/* Timeline de Eventos */}
          <div className="flex-1 min-h-0 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1 shrink-0">Histórico</h3>
            
            <div className="overflow-y-auto pr-2 flex-1 space-y-4 custom-scrollbar">
              {relevantMovs.map((m) => (
                <div key={m.id} className="relative pl-6 border-l border-gray-100 group">
                  {/* Ponto da linha do tempo */}
                  <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  
                  <div className="py-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`text-sm font-bold ${m.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.type === 'entrada' ? 'Entrada' : 'Saída'} <span className="text-slate-700">de {m.quantity}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium bg-gray-50 px-2 py-0.5 rounded-full">
                        {new Date(m.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {(m.notes || m.document) ? (
                       <p className="text-xs text-slate-500 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed mt-1">
                         {m.document && <span className="font-semibold text-slate-700 mr-2">Doc: {m.document}</span>}
                         {m.notes}
                       </p>
                    ) : (
                      <p className="text-[10px] text-slate-300 italic">Sem observações.</p>
                    )}
                  </div>
                </div>
              ))}
              {!relevantMovs.length && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">Nenhuma movimentação até esta data.</p>
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