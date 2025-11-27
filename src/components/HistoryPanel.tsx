import React, { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (!selectedItemId && items.length) {
      setSelectedItemId(items[0].id)
    }
  }, [items, selectedItemId])

  const selectedItem = items.find((i) => i.id === selectedItemId) || null

  const { stock, entradas, saidas, relevantMovs } = useMemo(() => {
    if (!selectedItem) {
      return { stock: 0, entradas: 0, saidas: 0, relevantMovs: [] as Movement[] }
    }
    const relevant = getMovementsForItemUpToDate(selectedItem.id, movements, selectedDate).sort(
      (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0),
    )
    const stockValue = getStockOnDate(selectedItem.id, items, movements, selectedDate)
    const entradasTotal = relevant
      .filter((m) => m.type === 'entrada')
      .reduce((sum, m) => sum + m.quantity, 0)
    const saidasTotal = relevant
      .filter((m) => m.type === 'saida')
      .reduce((sum, m) => sum + m.quantity, 0)

    return { stock: stockValue, entradas: entradasTotal, saidas: saidasTotal, relevantMovs: relevant }
  }, [selectedItem, movements, selectedDate, items])

  // Estilos de input comuns
  const selectClass = "w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">4. Máquina do Tempo</h2>
        <p className="text-sm text-slate-500">
          Veja quanto havia no estoque em qualquer data passada.
        </p>
      </div>

      {!items.length ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
          Sem dados para analisar no momento.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-500 ml-1 mb-1.5 block">Data de referência</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={selectClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-500 ml-1 mb-1.5 block">Selecione o Item</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className={selectClass}
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedItem && (
            <div className="mb-8">
               {/* Cartão de Destaque (Saldo Final) */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs font-medium uppercase tracking-wide mb-1">
                    Saldo em {new Date(selectedDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-4xl font-bold">{stock}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold">{selectedItem.description}</p>
                    <p className="text-indigo-200 text-sm">{selectedItem.classification}</p>
                </div>
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 font-medium uppercase">Inicial</p>
                  <p className="text-xl font-bold text-slate-700 mt-1">{selectedItem.initialQty}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-600 font-medium uppercase">Entradas</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">+{entradas}</p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                  <p className="text-xs text-rose-600 font-medium uppercase">Saídas</p>
                  <p className="text-xl font-bold text-rose-700 mt-1">-{saidas}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 px-1">Histórico de Movimentações</h3>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3">
                {relevantMovs.map((m) => (
                  <li key={m.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${m.type === 'entrada' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {m.type === 'entrada' ? 'Entrada' : 'Saída'} de <span className="font-bold">{m.quantity}</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(m.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {m.document && <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mr-2">{m.document}</span>}
                        {m.notes || <span className="italic opacity-50">Sem observações</span>}
                      </p>
                    </div>
                  </li>
                ))}
                {!relevantMovs.length && (
                  <li className="text-center py-6 text-sm text-slate-400 italic">
                    Nenhuma movimentação registrada até esta data.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default HistoryPanel