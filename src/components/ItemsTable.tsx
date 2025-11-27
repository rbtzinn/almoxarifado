import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'

interface Props { items: AlmoxItem[]; movements: Movement[] }

const ItemsTable: React.FC<Props> = ({ items, movements }) => {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => items.filter(i => i.description.toLowerCase().includes(search.toLowerCase())), [items, search])

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* Header da Tabela */}
      <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Visão Geral</h2>
          <p className="text-sm text-slate-400">Estoque atualizado em tempo real.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar itens..."
            className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 text-sm transition-all"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Tabela Scrollável */}
      <div className="overflow-x-auto overflow-y-auto max-h-[600px] bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-10 text-xs font-semibold text-slate-500 uppercase tracking-wider shadow-sm">
            <tr>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Classificação</th>
              <th className="px-6 py-4 text-right">Inicial</th>
              <th className="px-6 py-4 text-right">Saldo Atual</th>
              <th className="px-6 py-4 text-right">R$ Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {filtered.length === 0 ? (
               <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum item encontrado.</td></tr>
            ) : filtered.map(item => {
              const currentStock = getCurrentStock(item.id, items, movements)
              const totalValue = currentStock * item.unitPrice
              
              // Lógica de Estilos (Row & Badge)
              let rowClass = "hover:bg-gray-50 border-l-4 border-transparent" // Padrão
              let badgeClass = "bg-gray-100 text-slate-600"
              
              if (currentStock <= 0) {
                // Crítico (Vermelho)
                rowClass = "bg-rose-50 border-l-4 border-rose-500 hover:bg-rose-100 transition-colors"
                badgeClass = "bg-rose-200 text-rose-800 font-bold"
              } else if (currentStock < 20) {
                // Alerta (Amarelo)
                rowClass = "bg-amber-50 border-l-4 border-amber-400 hover:bg-amber-100 transition-colors"
                badgeClass = "bg-amber-200 text-amber-800 font-bold"
              } else {
                // Normal (Verde Badge)
                badgeClass = "bg-emerald-100 text-emerald-600"
              }

              return (
                <tr key={item.id} className={`${rowClass} group transition-all`}>
                  <td className="px-6 py-4 font-medium text-slate-700">{item.description}</td>
                  <td className="px-6 py-4 text-slate-500">{item.classification}</td>
                  <td className="px-6 py-4 text-right text-slate-400 font-mono">{item.initialQty}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${badgeClass}`}>
                      {currentStock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-medium">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export default ItemsTable