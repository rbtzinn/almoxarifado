import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { AlmoxItem, Movement, MovementType } from '../types'
import { 
  Calendar, 
  Package, 
  FileText, 
  Type, 
  ArrowDownRight, 
  ArrowUpRight,
  Search,
  Check,
  CheckCircle2
} from 'lucide-react'
import { AppAlert } from './ui/AppAlert'

interface Props { items: AlmoxItem[]; onAddMovement: (m: Movement) => void }

const MovementForm: React.FC<Props> = ({ items, onAddMovement }) => {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [type, setType] = useState<MovementType>('saida')
  const [quantity, setQuantity] = useState('')
  const [docRef, setDocRef] = useState('')
  const [notes, setNotes] = useState('')
  
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formError, setFormError] = useState<string | null>(null)

  const disabled = !items.length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredItems = useMemo(() => {
    const term = itemSearch.toLowerCase()
    return items.filter(item => item.description.toLowerCase().includes(term))
  }, [items, itemSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemSearch(e.target.value)
    setSelectedItemId('')
    setShowDropdown(true)
  }

  const handleSelectItem = (item: AlmoxItem) => {
    setItemSearch(item.description)
    setSelectedItemId(item.id)
    setShowDropdown(false)
    setFormError(null)
  }

  // Só permite números + vírgula/ponto no campo de quantidade
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // permite apagar tudo
    if (value === '') {
      setQuantity('')
      return
    }

    // normaliza para validar (troca vírgula por ponto)
    const normalized = value.replace(',', '.')

    // aceita: 123 | 123. | 123.45
    const regex = /^\d+(\.\d*)?$/

    if (regex.test(normalized)) {
      setQuantity(value)
    }
    // se não passar na regex, simplesmente ignora a digitação
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedItemId) {
      setFormError('Selecione um item da lista antes de confirmar o movimento.')
      return
    }

    const qty = Number(quantity.replace(',', '.'))
    if (!qty || qty <= 0) {
      setFormError('Informe uma quantidade válida maior que zero.')
      return
    }

    onAddMovement({
      id: `mov-${Date.now()}`,
      date,
      itemId: selectedItemId,
      type,
      quantity: qty,
      document: docRef,
      notes,
      synced: false,
    })
    
    setQuantity('')
    setDocRef('')
    setNotes('')
    setItemSearch('')
    setSelectedItemId('')
    setFormError(null)
  }

  // Estilos de Input - Foco na cor Azul Marinho
  const inputWrapper = "group flex items-center w-full rounded-xl bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-[#0F3B82] dark:focus-within:border-[#00C3E3] focus-within:ring-4 focus-within:ring-[#0F3B82]/10 transition-all h-11"
  const inputField = "w-full h-full bg-transparent border-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-0 px-3 outline-none disabled:opacity-50"
  const iconClass = "w-4 h-4 text-slate-400 ml-3 shrink-0 group-focus-within:text-[#0F3B82] dark:group-focus-within:text-[#00C3E3] transition-colors"
  const labelClass = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 ml-1"

  return (
    <div className="bg-white dark:bg-[#0a0f1d] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full flex flex-col transition-colors duration-300">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#0F3B82] dark:text-white">Registrar Movimento</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">Controle de entrada e saída.</p>
      </div>

      {/* ALERTA DE ERRO DO FORM */}
      {formError && (
        <div className="mb-4">
          <AppAlert
            variant="warning"
            title="Atenção"
            message={formError}
            onClose={() => setFormError(null)}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
        {/* Toggle Entrada/Saída */}
        <div className="bg-slate-50 dark:bg-[#111827] p-1 rounded-xl flex border border-slate-100 dark:border-slate-700 relative">
          <button 
            type="button" 
            onClick={() => setType('entrada')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${type === 'entrada' ? 'bg-white dark:bg-[#0F3B82] text-[#89D700] dark:text-[#89D700] shadow-sm ring-1 ring-black/5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ArrowDownRight size={14} strokeWidth={3} />
            ENTRADA
          </button>
          <button 
            type="button" 
            onClick={() => setType('saida')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all duration-200 ${type === 'saida' ? 'bg-white dark:bg-[#0F3B82] text-[#E30613] dark:text-[#E30613] shadow-sm ring-1 ring-black/5' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <ArrowUpRight size={14} strokeWidth={3} />
            SAÍDA
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data</label>
            <div className={inputWrapper}>
               <Calendar className={iconClass} />
               <input 
                 type="date" 
                 value={date} 
                 onChange={e => setDate(e.target.value)} 
                 className={`${inputField} dark:[color-scheme:dark]`} 
                 disabled={disabled} 
               />
            </div>
          </div>
          <div>
            <label className={labelClass}>Quantidade</label>
            <div className={inputWrapper}>
               <Package className={iconClass} />
               <input 
                 type="text"
                 inputMode="decimal"
                 value={quantity}
                 onChange={handleQuantityChange}
                 placeholder="0"
                 disabled={disabled}
                 className={inputField}
               />
            </div>
          </div>
        </div>

        {/* Dropdown de Busca */}
        <div className="relative" ref={dropdownRef}>
          <label className={labelClass}>Buscar Item</label>
          <div className={inputWrapper} onClick={() => setShowDropdown(true)}>
            <Search className={iconClass} />
            <input 
              type="text"
              value={itemSearch}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              className={inputField}
              placeholder="Digite para buscar..."
              disabled={disabled}
            />
          </div>
          
          {showDropdown && !disabled && (
            <div className="absolute z-30 mt-1 w-full bg-white dark:bg-[#1f2937] rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-[#0F3B82]/20 hover:text-[#0F3B82] dark:hover:text-white border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{item.description}</span>
                    {item.id === selectedItemId && (
                      <Check size={14} className="text-[#0F3B82] dark:text-[#00C3E3]" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                  Nenhum item encontrado.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className={labelClass}>Doc (Opcional)</label>
             <div className={inputWrapper}>
                <FileText className={iconClass} />
                <input
                  type="text"
                  value={docRef}
                  onChange={e => setDocRef(e.target.value)}
                  className={inputField}
                  disabled={disabled}
                  placeholder="NF-e..."
                />
             </div>
          </div>
          <div>
             <label className={labelClass}>Obs (Opcional)</label>
             <div className={inputWrapper}>
                <Type className={iconClass} />
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className={inputField}
                  disabled={disabled}
                  placeholder="..."
                />
             </div>
          </div>
        </div>

        <div className="mt-auto pt-2">
          {/* BOTÃO PRINCIPAL - GRADIENTE PERNAMBUCO (Azul para Roxo) */}
          <button 
            type="submit" 
            disabled={disabled} 
            className="w-full bg-gradient-to-r from-[#0F3B82] to-[#4800BC] hover:from-[#09295e] hover:to-[#36008f] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0F3B82]/20 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={18} />
            CONFIRMAR MOVIMENTO
          </button>
        </div>
      </form>
    </div>
  )
}

export default MovementForm
