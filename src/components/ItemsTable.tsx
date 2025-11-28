// src/components/ItemsTable.tsx
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

// Normaliza texto: tira acento, coloca em minúsculo, tira espaços extras
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

    // Sempre monto uma lista com descrição normalizada
    const withNorm = items.map((item) => ({
      item,
      descNorm: normalizeText(item.description),
    }))

    // Sem termo → tudo ordenado alfabeticamente
    if (!termNorm) {
      return withNorm
        .sort((a, b) =>
          a.descNorm.localeCompare(b.descNorm, 'pt-BR', {
            sensitivity: 'base',
          }),
        )
        .map(({ item }) => item)
    }

    // Com termo → calculo posição da ocorrência na descrição
    const withMeta = withNorm
      .map(({ item, descNorm }) => {
        const index = descNorm.indexOf(termNorm)
        if (index === -1) return null // não contém o termo

        return {
          item,
          descNorm,
          index,          // posição onde o termo aparece
          isPrefix: index === 0, // começa com o termo?
        }
      })
      .filter(
        (
          x,
        ): x is {
          item: AlmoxItem
          descNorm: string
          index: number
          isPrefix: boolean
        } => x !== null,
      )

    // Ranking:
    // 1) quem COMEÇA com o termo (index 0) vem primeiro
    // 2) depois, quem tem o termo mais à esquerda
    // 3) empatou? ordena alfabético pela descrição
    withMeta.sort((a, b) => {
      if (a.isPrefix !== b.isPrefix) {
        return a.isPrefix ? -1 : 1
      }
      if (a.index !== b.index) {
        return a.index - b.index
      }
      return a.descNorm.localeCompare(b.descNorm, 'pt-BR', {
        sensitivity: 'base',
      })
    })

    return withMeta.map(({ item }) => item)
  }, [items, search])

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden mb-10">
      {/* Header Fixo */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Visão Geral do Estoque</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Saldo atualizado em tempo real.
          </p>
        </div>

        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome..."
            className="pl-10 pr-4 py-2 w-64 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-xs font-medium transition-all outline-none"
          />
        </div>
      </div>

      {/* Tabela Scrollável (MAIOR, mas ainda com overflow) */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar max-h-[420px] lg:max-h-[520px] 2xl:max-h-[620px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th
                className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider group cursor-help"
                title="Ordenado alfabeticamente (com prioridade para o que bate melhor na busca)"
              >
                <div className="flex items-center gap-1">
                  Descrição
                  <ArrowUpDown size={10} className="text-slate-300" />
                </div>
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Classificação
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">
                Inicial
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">
                Saldo Atual
              </th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right whitespace-nowrap">
                Valor Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-300">
                    <Search size={24} />
                    <span className="text-xs italic">Nenhum item encontrado.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const currentStock = getCurrentStock(item.id, items, movements)
                const totalValue = currentStock * item.unitPrice

                // --- Lógica de Estilo da Linha (Row) ---
                let rowClass = 'group bg-white hover:bg-slate-50 transition-all'
                let badgeClass = 'bg-slate-100 text-slate-600'
                let StatusIcon = CheckCircle2

                if (currentStock <= 0) {
                  rowClass = 'group bg-rose-50 hover:bg-rose-100 transition-all'
                  badgeClass = 'bg-rose-500 text-white'
                  StatusIcon = XCircle
                } else if (currentStock < 10) {
                  rowClass = 'group bg-amber-50 hover:bg-amber-100 transition-all'
                  badgeClass = 'bg-amber-400 text-amber-900'
                  StatusIcon = AlertTriangle
                }

                return (
                  // key única mesmo com itens duplicados na planilha
                  <tr key={`${item.id}-${index}`} className={rowClass}>
                    {/* Descrição com truncate */}
                    <td
                      className="px-6 py-3.5 text-xs font-semibold text-slate-700 max-w-[220px] sm:max-w-[320px]"
                      title={item.description}
                    >
                      <div className="truncate">{item.description}</div>
                    </td>

                    {/* Classificação com truncate também */}
                    <td
                      className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap max-w-[160px]"
                      title={item.classification}
                    >
                      <div className="truncate">{item.classification}</div>
                    </td>

                    <td className="px-6 py-3.5 text-xs text-right text-slate-400 font-mono whitespace-nowrap">
                      {item.initialQty}
                    </td>

                    {/* Coluna de Saldo */}
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${badgeClass} min-w-[80px] justify-center`}
                      >
                        <StatusIcon size={10} strokeWidth={3} />
                        {currentStock} un
                      </div>
                    </td>

                    <td className="px-6 py-3.5 text-xs text-right text-slate-600 font-medium whitespace-nowrap">
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
