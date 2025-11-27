import React, { useState } from 'react'
import type { AlmoxItem, Movement, MovementType } from '../types'

interface Props {
  items: AlmoxItem[]
  onAddMovement: (movement: Movement) => void
}

const MovementForm: React.FC<Props> = ({ items, onAddMovement }) => {
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [itemId, setItemId] = useState('')
  const [type, setType] = useState<MovementType>('saida')
  const [quantity, setQuantity] = useState('')
  const [document, setDocument] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemId) {
      setError('Por favor, escolha um item.')
      return
    }

    const parsedQty = Number(quantity.replace(',', '.'))
    if (!parsedQty || parsedQty <= 0) {
      setError('A quantidade precisa ser maior que zero.')
      return
    }

    setError(null)

    const movement: Movement = {
      id: `mov-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date,
      itemId,
      type,
      quantity: parsedQty,
      document: document.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    onAddMovement(movement)
    setQuantity('')
    setDocument('')
    setNotes('')
  }

  const disabled = !items.length

  // Estilos reutilizáveis para inputs
  const inputClass = "w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
  const labelClass = "text-xs font-semibold text-slate-500 ml-1 mb-1.5 block"

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">2. Novo Movimento</h2>
        <p className="text-sm text-slate-500">Registre entradas ou saídas.</p>
      </div>

      {disabled && (
        <div className="bg-amber-50 text-amber-700 px-4 py-3 rounded-xl text-xs mb-4 border border-amber-100">
          ⚠️ Carregue a planilha primeiro para liberar o formulário.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Tipo */}
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button
            type="button"
            onClick={() => setType('entrada')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
              type === 'entrada'
                ? 'bg-emerald-500 text-white shadow-emerald-200'
                : 'bg-transparent text-slate-500 hover:text-slate-700 shadow-none'
            }`}
            disabled={disabled}
          >
            Entrada
          </button>
          <button
            type="button"
            onClick={() => setType('saida')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
              type === 'saida'
                ? 'bg-rose-500 text-white shadow-rose-200'
                : 'bg-transparent text-slate-500 hover:text-slate-700 shadow-none'
            }`}
            disabled={disabled}
          >
            Saída
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>Qtd.</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={inputClass}
              placeholder="0"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Item</label>
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className={`${inputClass} appearance-none`}
            disabled={disabled}
          >
            <option value="">Selecione o item...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.description}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Doc. (Opcional)</label>
            <input
              type="text"
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              className={inputClass}
              placeholder="Ex: NF-123"
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass}>Obs. (Opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="..."
              disabled={disabled}
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 px-1">{error}</p>}

        <button
          type="submit"
          disabled={disabled}
          className="w-full mt-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          Confirmar Movimento
        </button>
      </form>
    </section>
  )
}

export default MovementForm