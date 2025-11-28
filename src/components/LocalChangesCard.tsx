// src/components/LocalChangesCard.tsx
import React, { useMemo } from 'react'
import type { AlmoxItem, Movement } from '../types'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
} from 'lucide-react'

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
}

const LocalChangesCard: React.FC<Props> = ({ items, movements }) => {
  const total = movements.length
  const unsyncedCount = useMemo(
    () => movements.filter((m) => !m.synced).length,
    [movements],
  )

  const sortedMovements = useMemo(
    () =>
      [...movements].sort((a, b) => {
        if (a.synced !== b.synced) return a.synced ? 1 : -1
        if (a.date < b.date) return 1
        if (a.date > b.date) return -1
        return a.id.localeCompare(b.id)
      }),
    [movements],
  )

  // --- Empty State ---
  if (!movements.length) {
    return (
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-3">
          <Database className="w-5 h-5 text-slate-300" />
        </div>
        <h2 className="text-sm font-semibold text-slate-700">Tudo limpo</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
          Novas movimentações aparecerão aqui.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
      {/* Header Compacto */}
      <header className="px-5 py-4 border-b border-slate-50 bg-white z-10 flex justify-between items-center shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-800">Fila de Sync</h2>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            unsyncedCount > 0
              ? 'bg-amber-50 text-amber-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {unsyncedCount > 0 ? `${unsyncedCount} PENDENTES` : 'TUDO SALVO'}
        </span>
      </header>

      {/* Lista com Scroll Independente (MENOR) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0 max-h-40 lg:max-h-48">
        {sortedMovements.map((m) => {
          const item = items.find((i) => i.id === m.itemId)
          const isPending = !m.synced

          return (
            <div
              key={m.id}
              className={`flex items-center gap-3 rounded-xl border p-2.5 transition-all
              ${
                isPending
                  ? 'bg-amber-50/40 border-amber-100'
                  : 'bg-white border-transparent hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  m.type === 'entrada'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-rose-100 text-rose-600'
                }`}
              >
                {m.type === 'entrada' ? (
                  <ArrowDownRight size={14} strokeWidth={3} />
                ) : (
                  <ArrowUpRight size={14} strokeWidth={3} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-slate-700 truncate pr-2">
                    {item?.description ?? 'Item desconhecido'}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap bg-slate-100 px-1.5 rounded">
                    {m.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {new Date(m.date).toLocaleDateString('pt-BR')}
                  </span>
                  {m.document && (
                    <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2 truncate max-w-[80px]">
                      {m.document}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 pl-1">
                {isPending ? (
                  <Clock size={14} className="text-amber-400" />
                ) : (
                  <CheckCircle2 size={14} className="text-slate-200" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Minimalista */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 shrink-0">
        <p className="text-[9px] text-slate-400 flex items-center justify-center gap-1.5 uppercase tracking-wide font-medium">
          <RefreshCw size={9} />
          Sincronização Manual
        </p>
      </div>
    </section>
  )
}

export default LocalChangesCard
