import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import { Search, Hexagon, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'

interface Props { items: AlmoxItem[]; movements: Movement[] }

const ItemsTable: React.FC<Props> = ({ items, movements }) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = [...items]

    // Sem termo: lista toda ordenada por descrição
    if (!term) {
      return base.sort((a, b) =>
        a.description.localeCompare(b.description, 'pt-BR'),
      )
    }

    // Com termo: filtra + prioriza quem começa com o termo
    return base
      .filter(i => i.description.toLowerCase().includes(term))
      .sort((a, b) => {
        const aDesc = a.description.toLowerCase()
        const bDesc = b.description.toLowerCase()

        const aStarts = aDesc.startsWith(term)
        const bStarts = bDesc.startsWith(term)

        if (aStarts && !bStarts) return -1
        if (!aStarts && bStarts) return 1

        return aDesc.localeCompare(bDesc, 'pt-BR')
      })
  }, [items, search])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0f1d] rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-white/5 mb-16">
      {/* Header */}
      <div className="p-6 md:p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-white dark:bg-[#0a0f1d] z-20">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Estoque Geral
          </h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Visão completa dos itens e valores.
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-3 text-slate-400 w-4 h-4 group-focus-within:text-[#0F3B82] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-[#0F3B82] outline-none w-full md:w-64 transition-all placeholder:text-slate-400"
            placeholder="Filtrar tabela..."
          />
        </div>
      </div>

      {/* Container com scroll definido */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 pb-8 min-h-0 relative max-h-[60vh]">
        <table className="w-full border-separate border-spacing-y-2">
          <thead className="sticky top-0 z-10">
            <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-left">
              <th className="pb-4 pl-4 bg-white dark:bg-[#0a0f1d]">Descrição</th>
              <th className="pb-4 bg-white dark:bg-[#0a0f1d]">Grupo</th>
              <th className="pb-4 text-center bg-white dark:bg-[#0a0f1d]">
                Status
              </th>
              <th className="pb-4 text-right bg-white dark:bg-[#0a0f1d]">
                Qtd
              </th>
              <th className="pb-4 text-right pr-4 bg-white dark:bg-[#0a0f1d]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, index) => {
              const stock = getCurrentStock(item.id, items, movements)
              const value = stock * item.unitPrice

              let rowClass =
                'group transition-all hover:bg-slate-50 dark:hover:bg-white/5'
              let badgeClass =
                'bg-slate-100 dark:bg-white/10 text-slate-500'
              let icon = <CheckCircle2 size={12} />
              let indicatorColor = 'bg-slate-200 dark:bg-slate-700'

              if (stock <= 0) {
                badgeClass =
                  'bg-[#E30613]/10 text-[#E30613] dark:bg-[#E30613]/20 dark:text-[#E30613]'
                icon = <XCircle size={12} />
                indicatorColor = 'bg-[#E30613]'
              } else if (stock < 10) {
                badgeClass =
                  'bg-[#FFCD00]/10 text-amber-700 dark:bg-[#FFCD00]/20 dark:text-[#FFCD00]'
                icon = <AlertTriangle size={12} />
                indicatorColor = 'bg-[#FFCD00]'
              } else {
                indicatorColor = 'bg-[#89D700]'
                badgeClass =
                  'bg-[#89D700]/10 text-[#5c8d00] dark:bg-[#89D700]/20 dark:text-[#89D700]'
              }

              return (
                <tr key={`${item.id}-${index}`} className={rowClass}>
                  <td className="relative bg-white dark:bg-[#111111] rounded-l-xl border-y border-l border-slate-100 dark:border-white/5 py-4 pl-5">
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${indicatorColor}`}
                    />
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 dark:bg-white/5 rounded-lg text-slate-300 dark:text-slate-600">
                        <Hexagon size={16} strokeWidth={1.5} />
                      </div>
                      <span
                        className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[180px] md:max-w-xs"
                        title={item.description}
                      >
                        {item.description}
                      </span>
                    </div>
                  </td>

                  <td className="bg-white dark:bg-[#111111] border-y border-slate-100 dark:border-white/5 py-4">
                    <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 truncate max-w-[100px] block">
                      {item.classification}
                    </span>
                  </td>

                  <td className="bg-white dark:bg-[#111111] border-y border-slate-100 dark:border-white/5 py-4 text-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}`}
                    >
                      {icon}
                      <span>
                        {stock <= 0
                          ? 'CRÍTICO'
                          : stock < 10
                          ? 'BAIXO'
                          : 'NORMAL'}
                      </span>
                    </div>
                  </td>

                  <td className="bg-white dark:bg-[#111111] border-y border-slate-100 dark:border-white/5 py-4 text-right font-mono text-sm font-bold text-slate-600 dark:text-slate-300">
                    {stock}
                  </td>

                  <td className="bg-white dark:bg-[#111111] rounded-r-xl border-y border-r border-slate-100 dark:border-white/5 py-4 pr-4 text-right font-mono text-sm text-slate-400 dark:text-slate-500">
                    {value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!filtered.length && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-300 dark:text-slate-600">
            <Search size={48} strokeWidth={1} className="mb-4 opacity-50" />
            <p className="text-sm font-medium">Nenhum item encontrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemsTable
