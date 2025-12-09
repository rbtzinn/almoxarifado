// src/components/StatsCards.tsx
import React, { useMemo } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import {
  Package,
  Wallet,
  CloudAlert,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react'

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
  onOpenItemsManager: () => void
  onOpenMovementsManager: () => void
  onOpenStockSummary: () => void
}

const StatsCards: React.FC<Props> = ({
  items,
  movements,
  onOpenItemsManager,
  onOpenMovementsManager,
  onOpenStockSummary,
}) => {
  const pendingCount = useMemo(
    () => movements.filter((m) => !m.synced).length,
    [movements],
  )

  const totalEstoque = useMemo(() => {
    return items.reduce((acc, item) => {
      const stock = getCurrentStock(item.id, items, movements)
      return acc + stock * (item.unitPrice || 0)
    }, 0)
  }, [items, movements])

  const totalEntradas = useMemo(() => {
    const itemById = new Map(items.map((i) => [i.id, i]))
    return movements
      .filter((m) => m.type === 'entrada')
      .reduce((acc, m) => {
        const item = itemById.get(m.itemId)
        if (!item) return acc
        return acc + (item.unitPrice || 0) * m.quantity
      }, 0)
  }, [items, movements])

  const totalSaidas = useMemo(() => {
    const itemById = new Map(items.map((i) => [i.id, i]))
    return movements
      .filter((m) => m.type === 'saida')
      .reduce((acc, m) => {
        const item = itemById.get(m.itemId)
        if (!item) return acc
        return acc + (item.unitPrice || 0) * m.quantity
      }, 0)
  }, [items, movements])

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* Card 1 - Itens cadastrados */}
      <button
        type="button"
        onClick={onOpenItemsManager}
        className="group text-left bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F3B82]/10 text-[#0F3B82] dark:bg-[#00C3E3]/10 dark:text-[#00C3E3] flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
                Itens cadastrados
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {items.length}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-colors" />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Clique para gerenciar cadastro, inclusão e exclusão de itens.
        </p>
      </button>

      {/* Card 2 - Valor total em estoque */}
      <button
        type="button"
        onClick={onOpenStockSummary}
        className="group text-left bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
                Valor em estoque
              </p>
              <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {totalEstoque.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-colors" />
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <ArrowDownRight size={10} className="text-emerald-500" />
            Entradas:{' '}
            {totalEntradas.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowUpRight size={10} className="text-rose-500" />
            Saídas:{' '}
            {totalSaidas.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      </button>

      {/* Card 3 - Pendências de sincronização */}
      <button
        type="button"
        onClick={onOpenMovementsManager}
        className="group text-left bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center">
              <CloudAlert size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
                Pendências de envio
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {pendingCount}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-colors" />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Clique para visualizar e gerenciar a fila de sincronização.
        </p>
      </button>
    </section>
  )
}

export default StatsCards
