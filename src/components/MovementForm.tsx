import React, { useState, useRef, useEffect, useMemo } from 'react'
import type { AlmoxItem, Movement, MovementType } from '../types'

interface Props { items: AlmoxItem[]; onAddMovement: (m: Movement) => void }

const MovementForm: React.FC<Props> = ({ items, onAddMovement }) => {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [type, setType] = useState<MovementType>('saida')
  const [quantity, setQuantity] = useState('')
  const [docRef, setDocRef] = useState('')
  const [notes, setNotes] = useState('')
  
  // Estados para o Dropdown Customizado
  const [itemSearch, setItemSearch] = useState('')
  const [selectedItemId, setSelectedItemId] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  const disabled = !items.length

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filtra a lista baseado no que foi digitado
  const filteredItems = useMemo(() => {
    const term = itemSearch.toLowerCase()
    return items.filter(item => item.description.toLowerCase().includes(term))
  }, [items, itemSearch])

  // Ao digitar no input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemSearch(e.target.value)
    setSelectedItemId('') // Limpa seleção se usuário editar texto
    setShowDropdown(true)
  }

  // Ao clicar em um item da lista
  const handleSelectItem = (item: AlmoxItem) => {
    setItemSearch(item.description)
    setSelectedItemId(item.id)
    setShowDropdown(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItemId) return alert('Selecione um item da lista.')
    const qty = Number(quantity.replace(',', '.'))
    if (!qty || qty <= 0) return alert('Quantidade inválida.')

    onAddMovement({
      id: `mov-${Date.now()}`,
      date, itemId: selectedItemId, type, quantity: qty,
      document: docRef, notes,
    })
    
    setQuantity(''); setDocRef(''); setNotes(''); setItemSearch(''); setSelectedItemId('')
  }

  // Classes CSS
  const inputClass = "w-full rounded-xl border border-transparent bg-gray-50 px-4 py-3 text-sm text-slate-700 placeholder:text-gray-400 focus:bg-white focus:border-slate-200 focus:ring-0 transition-all outline-none"
  const labelClass = "block text-xs font-semibold text-slate-500 mb-1.5 ml-1"

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Registrar Movimento</h2>
        <p className="text-sm text-slate-400">Entrada ou saída de material.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        {/* Toggle */}
        <div className="bg-gray-50 p-1.5 rounded-xl flex border border-gray-100">
          <button type="button" onClick={() => setType('entrada')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${type === 'entrada' ? 'bg-white text-slate-900 shadow-sm border border-gray-100' : 'text-slate-400 hover:text-slate-600'}`}>Entrada</button>
          <button type="button" onClick={() => setType('saida')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${type === 'saida' ? 'bg-white text-rose-600 shadow-sm border border-gray-100' : 'text-slate-400 hover:text-slate-600'}`}>Saída</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Data</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} disabled={disabled} />
          </div>
          <div>
            <label className={labelClass}>Quantidade</label>
            <input 
              type="number" 
              step="0.01" 
              value={quantity} 
              onChange={e => setQuantity(e.target.value)} 
              placeholder="0" 
              disabled={disabled} 
              className={`${inputClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
          </div>
        </div>

        {/* --- DROPDOWN CUSTOMIZADO AQUI --- */}
        <div className="relative" ref={dropdownRef}>
          <label className={labelClass}>Buscar Item</label>
          <input 
            type="text" 
            value={itemSearch} 
            onChange={handleSearchChange}
            onFocus={() => setShowDropdown(true)}
            className={inputClass} 
            placeholder="Digite para buscar..." 
            disabled={disabled} 
          />
          
          {/* A lista flutuante (Absolute) */}
          {showDropdown && !disabled && (
            <div className="absolute z-20 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto custom-scrollbar">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-gray-50 hover:text-slate-900 border-b border-gray-50 last:border-0 transition-colors"
                  >
                    {item.description}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400 italic">
                  Nenhum item encontrado.
                </div>
              )}
            </div>
          )}
        </div>
        {/* -------------------------------- */}

        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>Doc (Op.)</label><input type="text" value={docRef} onChange={e => setDocRef(e.target.value)} className={inputClass} disabled={disabled} /></div>
          <div><label className={labelClass}>Obs (Op.)</label><input type="text" value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} disabled={disabled} /></div>
        </div>

        <button type="submit" disabled={disabled} className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-colors disabled:opacity-50 text-sm shadow-lg shadow-slate-200">
          Confirmar
        </button>
      </form>
    </div>
  )
}
export default MovementForm