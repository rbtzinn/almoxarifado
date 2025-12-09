import React, { useState, useMemo } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { Calendar, Package, FileText, Search, ArrowRight, Check } from 'lucide-react'
import { AppAlert } from './ui/AppAlert'

interface Props { items: AlmoxItem[]; onAddMovement: (m: Movement) => void }

const MovementForm: React.FC<Props> = ({ items, onAddMovement }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [type, setType] = useState<'entrada' | 'saida'>('saida')
  const [quantity, setQuantity] = useState('')
  const [doc, setDoc] = useState('')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredItems = useMemo(() => 
    items.filter(i => i.description.toLowerCase().includes(search.toLowerCase())).slice(0, 5),
  [items, search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return setError('Selecione um item.')
    const qty = Number(quantity.replace(',', '.'))
    if (!qty || qty <= 0) return setError('Quantidade inválida.')

    onAddMovement({
      id: `mov-${Date.now()}`,
      itemId: selectedId,
      date,
      type,
      quantity: qty,
      document: doc,
      synced: false
    })
    
    setQuantity('')
    setDoc('')
    setSearch('')
    setSelectedId('')
    setError(null)
  }

  const inputClass = "w-full bg-slate-50 dark:bg-black/20 border-0 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] transition-all placeholder:text-slate-400"
  const labelClass = "block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-[#0F3B82] dark:text-white tracking-tight">Nova Movimentação</h2>
        <div className="flex bg-slate-100 dark:bg-white/10 p-1 rounded-xl">
           <button onClick={() => setType('entrada')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'entrada' ? 'bg-white dark:bg-[#0F3B82] text-[#89D700] shadow-sm' : 'text-slate-400'}`}>ENTRADA</button>
           <button onClick={() => setType('saida')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'saida' ? 'bg-white dark:bg-[#0F3B82] text-[#E30613] shadow-sm' : 'text-slate-400'}`}>SAÍDA</button>
        </div>
      </div>

      {error && <div className="mb-4"><AppAlert variant="warning" message={error} onClose={() => setError(null)} /></div>}

      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        {/* Busca Interativa */}
        <div className="relative group">
           <label className={labelClass}>Item do Estoque</label>
           <div className="relative">
              <Search className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
              <input 
                 type="text" 
                 value={search}
                 onChange={e => { setSearch(e.target.value); setShowResults(true); if(!e.target.value) setSelectedId('') }}
                 className={`${inputClass} pl-11`}
                 placeholder="Pesquise por nome..."
                 disabled={!items.length}
              />
              {selectedId && <Check className="absolute right-4 top-3.5 text-[#89D700] w-4 h-4" />}
           </div>
           
           {/* Dropdown Flutuante */}
           {showResults && search && !selectedId && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                 {filteredItems.map(item => (
                    <button key={item.id} type="button" onClick={() => { setSelectedId(item.id); setSearch(item.description); setShowResults(false); setError(null) }} className="w-full text-left px-5 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 border-b border-slate-50 dark:border-white/5 last:border-0 transition-colors">
                       {item.description}
                    </button>
                 ))}
                 {!filteredItems.length && <div className="p-4 text-xs text-center text-slate-400">Nada encontrado.</div>}
              </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-5">
           <div>
              <label className={labelClass}>Quantidade</label>
              <div className="relative">
                 <Package className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                 <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)} className={`${inputClass} pl-11`} placeholder="0" inputMode="decimal" />
              </div>
           </div>
           <div>
              <label className={labelClass}>Data</label>
              <div className="relative">
                 <Calendar className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
                 <input type="date" value={date} onChange={e => setDate(e.target.value)} className={`${inputClass} pl-11 dark:[color-scheme:dark]`} />
              </div>
           </div>
        </div>

        <div>
           <label className={labelClass}>Documento (Opcional)</label>
           <div className="relative">
               <FileText className="absolute left-4 top-3.5 text-slate-400 w-4 h-4" />
               <input type="text" value={doc} onChange={e => setDoc(e.target.value)} className={`${inputClass} pl-11`} placeholder="NF, Pedido..." />
           </div>
        </div>

        <button 
          type="submit" 
          disabled={!items.length}
          className={`
            w-full py-4 rounded-xl font-bold text-sm tracking-wide text-white shadow-lg shadow-[#0F3B82]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2
            bg-gradient-to-r from-[#0F3B82] to-[#4800BC] hover:brightness-110
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
           Confirmar <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}

export default MovementForm