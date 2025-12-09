// src/components/StockSummaryModal.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import {
  X,
  PieChart,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Package,
} from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  items: AlmoxItem[]
  movements: Movement[]
}

type ClassSummary = {
  classification: string
  valorEntrada: number
  valorSaida: number
  saldo: number
  valorEstoqueAtual: number
}

const StockSummaryModal: React.FC<Props> = ({
  open,
  onClose,
  items,
  movements,
}) => {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<'overview' | 'byClass'>('overview')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const {
    totalEstoque,
    totalEntrada,
    totalSaida,
    saldoGeral,
    porClassificacao,
  } = useMemo(() => {
    const itemById = new Map(items.map((i) => [i.id, i]))

    let totalEstoque = 0
    let totalEntrada = 0
    let totalSaida = 0

    const mapaEstoqueClass = new Map<string, number>()
    const mapaMovClass = new Map<string, { entrada: number; saida: number }>()

    for (const item of items) {
      const stock = getCurrentStock(item.id, items, movements)
      const valor = stock * (item.unitPrice || 0)
      totalEstoque += valor

      const cls = item.classification?.trim() || 'OUTROS'
      mapaEstoqueClass.set(cls, (mapaEstoqueClass.get(cls) ?? 0) + valor)
    }

    for (const mov of movements) {
      const item = itemById.get(mov.itemId)
      if (!item) continue
      const cls = item.classification?.trim() || 'OUTROS'
      const valor = (item.unitPrice || 0) * mov.quantity

      const bucket = mapaMovClass.get(cls) ?? { entrada: 0, saida: 0 }
      if (mov.type === 'entrada') {
        bucket.entrada += valor
        totalEntrada += valor
      } else {
        bucket.saida += valor
        totalSaida += valor
      }
      mapaMovClass.set(cls, bucket)
    }

    const saldoGeral = totalEntrada - totalSaida

    const porClassificacao: ClassSummary[] = Array.from(
      new Set([
        ...Array.from(mapaMovClass.keys()),
        ...Array.from(mapaEstoqueClass.keys()),
      ]),
    )
      .map((cls) => {
        const mov = mapaMovClass.get(cls) ?? { entrada: 0, saida: 0 }
        const valorEstoqueAtual = mapaEstoqueClass.get(cls) ?? 0
        return {
          classification: cls,
          valorEntrada: mov.entrada,
          valorSaida: mov.saida,
          saldo: mov.entrada - mov.saida,
          valorEstoqueAtual,
        }
      })
      .sort((a, b) => b.valorEstoqueAtual - a.valorEstoqueAtual)

    return {
      totalEstoque,
      totalEntrada,
      totalSaida,
      saldoGeral,
      porClassificacao,
    }
  }, [items, movements])

  // Utilitário de formatação
  const formatMoney = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (!mounted || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop com blur mais forte e cor mais profunda */}
      <div
        className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Card Principal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200/60 dark:border-white/5 shadow-2xl shadow-black/50 overflow-hidden transform transition-all">
        
        {/* Header Elegante */}
        <div className="flex-none px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-start justify-between bg-white/50 dark:bg-[#0b101b]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0F3B82] to-[#0a2a60] text-white shadow-lg shadow-blue-900/20">
              <PieChart size={24} className="opacity-90" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Análise Financeira
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Visão consolidada de patrimônio e fluxo de valor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="group p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="p-1 rounded-full border border-slate-200 dark:border-white/20 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
              <X size={16} />
            </div>
          </button>
        </div>

        {/* Tabs Estilizadas */}
        <div className="flex-none px-6 sm:px-8 py-4 bg-slate-50/50 dark:bg-[#080c14]/50 border-b border-slate-100 dark:border-white/5">
          <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl w-fit">
            <button
              onClick={() => setTab('overview')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                tab === 'overview'
                  ? 'bg-white dark:bg-white/10 text-[#0F3B82] dark:text-[#00C3E3] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Layers size={14} />
              Visão Geral
            </button>
            <button
              onClick={() => setTab('byClass')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${
                tab === 'byClass'
                  ? 'bg-white dark:bg-white/10 text-[#0F3B82] dark:text-[#00C3E3] shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <PieChart size={14} />
              Por Classificação
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-[#05080f] p-6 sm:p-8">
          {tab === 'overview' ? (
            <div className="space-y-6">
              {/* Grid Principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Card Hero - Total em Estoque */}
                <div className="lg:col-span-1 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F3B82] via-[#0b2e66] to-[#051530] p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col justify-between min-h-[220px]">
                  {/* Círculos decorativos de fundo */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00C3E3]/10 rounded-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-blue-200/80 mb-2">
                      <Package size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Patrimônio em Estoque</span>
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 text-white">
                      {totalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                      <span className="text-lg text-blue-200/60 font-medium">
                        {((totalEstoque % 1).toFixed(2)).replace('0.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-100/70">
                      <span>Total de itens</span>
                      <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{items.length}</span>
                    </div>
                  </div>
                </div>

                {/* Cards Secundários */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Entradas */}
                  <div className="bg-white dark:bg-[#0e1421] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <ArrowDownRight size={18} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entradas</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatMoney(totalEntrada)}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50/50 dark:bg-emerald-500/5 px-2 py-1 rounded w-fit">
                      Acumulado
                    </div>
                  </div>

                  {/* Saídas */}
                  <div className="bg-white dark:bg-[#0e1421] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <ArrowUpRight size={18} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saídas</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                        {formatMoney(totalSaida)}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50/50 dark:bg-rose-500/5 px-2 py-1 rounded w-fit">
                      Acumulado
                    </div>
                  </div>

                  {/* Saldo */}
                  <div className="bg-white dark:bg-[#0e1421] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <Wallet size={18} />
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo</span>
                      </div>
                      <div className={`text-2xl font-bold tabular-nums ${saldoGeral >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatMoney(saldoGeral)}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400 font-medium px-2 py-1">
                      Entradas - Saídas
                    </div>
                  </div>

                </div>
              </div>

              {/* Dica / Info extra */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10">
                 <div className="mt-0.5 text-[#0F3B82] dark:text-[#00C3E3]">
                    <TrendingUp size={16} />
                 </div>
                 <div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Como os valores são calculados?</p>
                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 mt-1">
                       O <strong>Valor em Estoque</strong> reflete a quantidade atual multiplicada pelo preço unitário. 
                       Já as <strong>Entradas e Saídas</strong> somam todo o histórico de movimentações, independente do estoque atual.
                    </p>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Detalhamento por Categoria</h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">{porClassificacao.length} Categorias</span>
               </div>
              
              <div className="bg-white dark:bg-[#0e1421] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                        <th className="px-5 py-4 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Classificação</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entrada</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saída</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saldo Líquido</th>
                        <th className="px-5 py-4 text-right font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-100/50 dark:bg-white/5">Estoque Atual</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {porClassificacao.map((row) => (
                        <tr
                          key={row.classification}
                          className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                            {row.classification}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-emerald-600/80 dark:text-emerald-400/80">
                            {formatMoney(row.valorEntrada)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums text-rose-600/80 dark:text-rose-400/80">
                            {formatMoney(row.valorSaida)}
                          </td>
                          <td className={`px-5 py-4 text-right tabular-nums font-medium ${
                            row.saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {formatMoney(row.saldo)}
                          </td>
                          <td className="px-5 py-4 text-right tabular-nums font-bold text-slate-800 dark:text-white bg-slate-50/30 dark:bg-white/5 group-hover:bg-slate-100/50 dark:group-hover:bg-white/10 transition-colors">
                            {formatMoney(row.valorEstoqueAtual)}
                          </td>
                        </tr>
                      ))}
                      {porClassificacao.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={24} className="opacity-20" />
                                <p>Nenhuma classificação encontrada.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default StockSummaryModal