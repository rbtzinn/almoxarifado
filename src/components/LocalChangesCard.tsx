import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  Search,
  Trash2,
  X
} from 'lucide-react'

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
  onDelete: (movementId: string) => void
}

const LocalChangesCard: React.FC<Props> = ({ items, movements, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredMovements = useMemo(() => {
    if (!searchTerm) return sortedMovements
    const term = normalizeText(searchTerm)
    return sortedMovements.filter((m) => {
      const item = items.find((i) => i.id === m.itemId)
      const description = item?.description || ''
      return normalizeText(description).includes(term)
    })
  }, [sortedMovements, searchTerm, items])

  if (!movements.length) {
    return (
      <section className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center transition-colors duration-300">
        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Database className="w-5 h-5 text-slate-300 dark:text-slate-500" />
        </div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tudo limpo</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
          Novas movimentações aparecerão aqui.
        </p>
      </section>
    )
  }

  return (
    <section className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden max-h-[500px] transition-colors duration-300">
      {/* Header */}
      <header className="px-5 py-4 border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-950 z-10 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Fila de Sync</h2>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full ${
              unsyncedCount > 0
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {unsyncedCount > 0 ? `${unsyncedCount} PENDENTES` : 'TUDO SALVO'}
          </span>
        </div>

        {/* Busca */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar item na fila..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 transition-all placeholder-slate-400"
          />
          <Search size={12} className="absolute left-2.5 top-2 text-slate-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </header>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-0">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">
            Nenhuma movimentação encontrada para "{searchTerm}"
          </div>
        ) : (
          filteredMovements.map((m) => {
            const item = items.find((i) => i.id === m.itemId)
            const isPending = !m.synced

            return (
              <div
                key={m.id}
                className={`group flex items-center gap-3 rounded-xl border p-2.5 transition-all
              ${
                isPending
                  ? 'bg-amber-50/40 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
                  : 'bg-white dark:bg-slate-900 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              >
                {/* Ícone */}
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    m.type === 'entrada'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {m.type === 'entrada' ? (
                    <ArrowDownRight size={14} strokeWidth={3} />
                  ) : (
                    <ArrowUpRight size={14} strokeWidth={3} />
                  )}
                </div>

                {/* Detalhes */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">
                      {item?.description ?? 'Item desconhecido'}
                    </p>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap bg-slate-100 dark:bg-slate-800 px-1.5 rounded">
                      {m.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(m.date).toLocaleDateString('pt-BR')}
                    </span>
                    {m.document && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 border-l border-slate-200 dark:border-slate-700 pl-2 truncate max-w-[80px]">
                        {m.document}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="shrink-0 pl-1 flex items-center gap-2">
                  <div className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza?')) onDelete(m.id)
                      }}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isPending ? (
                    <Clock size={14} className="text-amber-400" />
                  ) : (
                    <CheckCircle2 size={14} className="text-slate-200 dark:text-slate-700" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <p className="text-[9px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 uppercase tracking-wide font-medium">
          <RefreshCw size={9} />
          Sincronização Manual
        </p>
      </div>
    </section>
  )
}

export default LocalChangesCard