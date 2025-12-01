import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from 'lucide-react'

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
}

const ItemsTable: React.FC<Props> = ({ items, movements }) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const termNorm = normalizeText(search)
    const withNorm = items.map((item) => ({
      item,
      descNorm: normalizeText(item.description),
    }))

    if (!termNorm) {
      return withNorm
        .sort((a, b) =>
          a.descNorm.localeCompare(b.descNorm, 'pt-BR', { sensitivity: 'base' }),
        )
        .map(({ item }) => item)
    }

    const withMeta = withNorm
      .map(({ item, descNorm }) => {
        const index = descNorm.indexOf(termNorm)
        if (index === -1) return null 
        return { item, descNorm, index, isPrefix: index === 0 }
      })
      .filter((x): x is { item: AlmoxItem; descNorm: string; index: number; isPrefix: boolean } => x !== null)

    withMeta.sort((a, b) => {
      if (a.isPrefix !== b.isPrefix) return a.isPrefix ? -1 : 1
      if (a.index !== b.index) return a.index - b.index
      return a.descNorm.localeCompare(b.descNorm, 'pt-BR', { sensitivity: 'base' })
    })

    return withMeta.map(({ item }) => item)
  }, [items, search])

  return (
    <section className="bg-white dark:bg-[#0a0f1d] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col overflow-hidden mb-10 transition-colors duration-300">
      {/* Header Fixo */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-white dark:bg-[#0a0f1d] shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">Visão Geral do Estoque</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Saldo atualizado em tempo real.
          </p>
        </div>

        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-[#0F3B82] transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 focus:bg-white dark:focus:bg-[#0a0f1d] focus:border-[#0F3B82] dark:focus:border-[#00C3E3] focus:ring-4 focus:ring-[#0F3B82]/10 text-xs font-medium transition-all outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Tabela Scrollável */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#0a0f1d] custom-scrollbar max-h-[420px] lg:max-h-[520px] 2xl:max-h-[620px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-[#111827] sticky top-0 z-20 shadow-sm border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th
                className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider group cursor-help"
                title="Ordenado alfabeticamente"
              >
                <div className="flex items-center gap-1">
                  Descrição
                  <ArrowUpDown size={10} className="text-slate-300 dark:text-slate-600" />
                </div>
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Classificação
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                Inicial
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                Saldo Atual
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-600">
                    <Search size={24} />
                    <span className="text-xs italic">Nenhum item encontrado.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const currentStock = getCurrentStock(item.id, items, movements)
                const totalValue = currentStock * item.unitPrice

                // --- Lógica de Estilo da Linha (Dark Compatible) ---
                let rowClass = 'group bg-white dark:bg-[#0a0f1d] hover:bg-slate-50 dark:hover:bg-[#111827] transition-all'
                let badgeClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                let StatusIcon = CheckCircle2

                if (currentStock <= 0) {
                  // Vermelho
                  rowClass = 'group bg-red-50 hover:bg-red-100 dark:bg-[#E30613]/10 dark:hover:bg-[#E30613]/20 transition-all'
                  badgeClass = 'bg-[#E30613] text-white dark:bg-[#E30613]'
                  StatusIcon = XCircle
                } else if (currentStock < 10) {
                  // Amarelo
                  rowClass = 'group bg-amber-50 hover:bg-amber-100 dark:bg-[#FFCD00]/10 dark:hover:bg-[#FFCD00]/20 transition-all'
                  badgeClass = 'bg-[#FFCD00] text-amber-900 dark:bg-[#FFCD00] dark:text-amber-950'
                  StatusIcon = AlertTriangle
                }

                return (
                  <tr key={`${item.id}-${index}`} className={rowClass}>
                    <td
                      className="px-6 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[220px] sm:max-w-[320px]"
                      title={item.description}
                    >
                      <div className="truncate">{item.description}</div>
                    </td>

                    <td
                      className="px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap max-w-[160px]"
                      title={item.classification}
                    >
                      <div className="truncate">{item.classification}</div>
                    </td>

                    <td className="px-6 py-3.5 text-xs text-right text-slate-400 dark:text-slate-500 font-mono whitespace-nowrap">
                      {item.initialQty}
                    </td>

                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${badgeClass} min-w-[80px] justify-center`}
                      >
                        <StatusIcon size={10} strokeWidth={3} />
                        {currentStock} un
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-xs text-right text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                      {totalValue.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ItemsTable