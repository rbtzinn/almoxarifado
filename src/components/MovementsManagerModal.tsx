// src/components/MovementsManagerModal.tsx
import React, { useState, useMemo } from 'react'
import type { Movement, AlmoxItem } from '../types'
import {
  X,
  Trash2,
  Calendar,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  CloudOff,
  Search,
  History,
  AlertTriangle,
  FileText,
} from 'lucide-react'

interface MovementsManagerModalProps {
  open: boolean
  onClose: () => void
  movements: Movement[]
  items: AlmoxItem[]
  onDeleteMovement: (id: string) => void
}

const MovementsManagerModal: React.FC<MovementsManagerModalProps> = ({
  open,
  onClose,
  movements,
  items,
  onDeleteMovement,
}) => {
  const [search, setSearch] = useState('')

  const itemsMap = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.id] = item.description
      return acc
    }, {} as Record<string, string>)
  }, [items])

  const filteredMovements = useMemo(() => {
    return movements
      .filter((m) => {
        const itemName = itemsMap[m.itemId] || ''
        const term = search.toLowerCase()
        return (
          itemName.toLowerCase().includes(term) ||
          m.notes?.toLowerCase().includes(term) ||
          m.document?.toLowerCase().includes(term)
        )
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [movements, itemsMap, search])

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir este registro? Isso afetará o cálculo de saldo local.',
      )
    ) {
      onDeleteMovement(id)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] bg-white dark:bg-[#0b101b] rounded-3xl shadow-2xl shadow-black/50 border border-slate-200/60 dark:border-white/5 flex flex-col overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-[#0b101b]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-[#0F3B82]/10 text-[#0F3B82] dark:bg-[#00C3E3]/15 dark:text-[#00C3E3]">
                <History size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                Histórico de Movimentações
                <span className="text-[10px] font-bold text-slate-400 uppercase border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full tracking-wider">
                  Total: {movements.length}
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Visualize e gerencie as entradas e saídas registradas.
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

        {/* Toolbar de Busca */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0b101b]">
          <div className="relative group">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0F3B82] dark:group-focus-within:text-[#00C3E3] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do item, observação ou documento..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3]/50 focus:bg-white dark:focus:bg-black/40 transition-all"
            />
          </div>
        </div>

        {/* Lista Scrollável */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-50/30 dark:bg-[#05080f]">
          {filteredMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Package size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhuma movimentação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMovements.map((mov) => {
                const isEntry = mov.type === 'entrada'
                const isSynced = mov.synced

                return (
                  <div
                    key={mov.id}
                    className="group bg-white dark:bg-[#0e1421] p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden"
                  >
                    {/* Indicador lateral colorido */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isEntry ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                    {/* Coluna 1: Ícone e Data */}
                    <div className="flex items-center gap-4 min-w-[160px]">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isEntry
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                        }`}
                      >
                        {isEntry ? (
                          <ArrowDownLeft size={20} />
                        ) : (
                          <ArrowUpRight size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                            isEntry
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {mov.type}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                          <Calendar size={10} />
                          {new Date(mov.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>

                    {/* Coluna 2: Item e Detalhes */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {itemsMap[mov.itemId] ||
                            'Item desconhecido (removido)'}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                         {mov.document && (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                <FileText size={10} />
                                {mov.document}
                            </div>
                         )}
                         <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {mov.notes || 'Sem observações adicionais'}
                         </p>
                      </div>
                    </div>

                    {/* Coluna 3: Quantidade */}
                    <div className="flex items-center gap-6 md:justify-end md:min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/5 pt-3 md:pt-0 pl-0 md:pl-4 mt-1 md:mt-0">
                      
                      <div className="text-right">
                        <span className="text-base font-mono font-bold text-slate-700 dark:text-slate-200 block leading-none">
                          {mov.quantity}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Qtd
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                         {/* Status Badge */}
                        {isSynced ? (
                            <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" title="Sincronizado">
                                <CheckCircle2 size={16} />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Pendente de Envio">
                                <CloudOff size={16} />
                            </div>
                        )}

                        <button
                            onClick={() => handleDelete(mov.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                            title="Excluir do histórico local"
                        >
                            <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400 text-center flex items-center justify-center gap-2">
          <AlertTriangle size={12} />
          <span>Atenção: Excluir um registro aqui remove o histórico local. Se já foi sincronizado com a planilha, a planilha não será alterada.</span>
        </div>
      </div>
    </div>
  )
}

export default MovementsManagerModal