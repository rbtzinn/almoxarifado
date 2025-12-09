// src/components/ClassificationModal.tsx
import React, { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Package, Search, Tag, Box } from 'lucide-react'
import type { AlmoxItem } from '../types'

interface ClassItemInfo {
  item: AlmoxItem
  stock: number
  total: number
}

interface ClassificationModalProps {
  isOpen: boolean
  onClose: () => void
  classification: string
  items: ClassItemInfo[]
  totalValue: number
}

const ClassificationModal: React.FC<ClassificationModalProps> = ({
  isOpen,
  onClose,
  classification,
  items,
  totalValue,
}) => {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Evita problemas de SSR/hidratação e controla scroll do body
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, isOpen])

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return items
    return items.filter(({ item }) =>
      item.description.toLowerCase().includes(term),
    )
  }, [items, searchTerm])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Card do Modal */}
      <div className="relative z-10 w-full max-w-xl max-h-[85vh] bg-white dark:bg-[#0b101b] rounded-3xl shadow-2xl shadow-black/50 border border-slate-200/60 dark:border-white/5 flex flex-col overflow-hidden transform transition-all">
        
        {/* Header Glassmorphism */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-[#0b101b]/50 backdrop-blur-sm z-20">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex gap-4 min-w-0">
               <div className="p-3 rounded-2xl bg-[#0F3B82]/10 text-[#0F3B82] dark:bg-[#00C3E3]/15 dark:text-[#00C3E3] h-fit">
                  <Tag size={20} />
               </div>
               <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
                    Detalhes da Classificação
                  </p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white truncate tracking-tight leading-none">
                    {classification}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                        <Box size={10} />
                        {filteredItems.length} Itens
                     </span>
                  </div>
               </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="group p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
               <div className="p-1 rounded-full border border-slate-200 dark:border-white/20 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors">
                 <X size={16} />
               </div>
            </button>
          </div>

          {/* Barra de Busca Integrada */}
          <div className="relative group mt-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-[#0F3B82] dark:group-focus-within:text-[#00C3E3] transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3]/50 focus:bg-white dark:focus:bg-black/40 transition-all"
              placeholder="Filtrar itens desta categoria..."
              autoFocus
            />
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-3 bg-slate-50/30 dark:bg-[#05080f]">
          {filteredItems.map(({ item, stock, total }) => (
            <div
              key={item.id}
              className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0e1421] border border-slate-100 dark:border-white/5 hover:border-[#0F3B82]/30 dark:hover:border-[#00C3E3]/30 hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Efeito hover lateral */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0F3B82] dark:bg-[#00C3E3] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-[#0F3B82]/5 group-hover:text-[#0F3B82] dark:group-hover:text-[#00C3E3] transition-colors">
                  <Package size={20} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mb-1"
                    title={item.description}
                  >
                    {item.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded font-medium">
                      Estoque: <strong className="text-slate-700 dark:text-slate-200">{stock}</strong>
                    </span>
                    {item.unitPrice > 0 && (
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        Unit: {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 pl-2">
                <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                  {total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
              </div>
            </div>
          ))}

          {!filteredItems.length && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <Package size={48} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">
                Nenhum item encontrado.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#0b101b] flex items-center justify-between z-20">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Total Acumulado
          </span>
          <span className="text-xl font-black text-[#0F3B82] dark:text-[#00C3E3] tabular-nums">
            {totalValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ClassificationModal