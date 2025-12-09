import React, { useMemo } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { Cloud, Check, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Props { items: AlmoxItem[]; movements: Movement[]; onDelete: (id: string) => void }

const LocalChangesCard: React.FC<Props> = ({ items, movements, onDelete }) => {
  const pending = useMemo(() => movements.filter(m => !m.synced), [movements])
  
  if (!pending.length) return (
     <div className="w-full bg-white dark:bg-[#0a0f1d] p-6 text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-3">
           <Cloud className="text-slate-300 dark:text-slate-600" size={20} />
        </div>
        <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Tudo Sincronizado</p>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">O sistema está atualizado com a nuvem.</p>
     </div>
  )

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0f1d] relative w-full">
       {/* Topo indicador animado */}
       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD00] to-[#E30613] animate-pulse" />
       
       <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-[#FFCD00]"></span>
             Fila de Envio ({pending.length})
          </h3>
          <span className="text-[10px] font-bold text-[#FFCD00] uppercase tracking-wider bg-[#FFCD00]/10 px-2 py-1 rounded-lg">Pendente</span>
       </div>

       {/* Lista com Limite de Altura e Scroll */}
       <div className="overflow-y-auto custom-scrollbar p-3 space-y-2 max-h-[240px]">
          {pending.map(m => {
             const item = items.find(i => i.id === m.itemId)
             return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 dark:bg-[#FFCD00]/5 border border-amber-100 dark:border-[#FFCD00]/10 hover:bg-amber-100/50 transition-colors group">
                   <div className={`p-2 rounded-lg shrink-0 ${m.type === 'entrada' ? 'bg-[#89D700]/20 text-[#4a7500]' : 'bg-[#E30613]/20 text-[#E30613]'}`}>
                      {m.type === 'entrada' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={item?.description}>
                        {item?.description || 'Item desconhecido'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {m.quantity} un &bull; {new Date(m.date).toLocaleDateString()}
                      </p>
                   </div>

                   <button 
                     onClick={() => window.confirm('Remover esta pendência?') && onDelete(m.id)}
                     className="p-2 text-slate-400 hover:text-[#E30613] hover:bg-white dark:hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                     title="Excluir pendência"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
             )
          })}
       </div>
    </div>
  )
}

export default LocalChangesCard