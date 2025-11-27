import React, { useState } from 'react'
import type { AlmoxItem, Movement, MovementType } from '../types'

interface Props {
  items: AlmoxItem[]
  onAddMovement: (movement: Movement) => void
}

const MovementForm: React.FC<Props> = ({ items, onAddMovement }) => {
  const today = new Date().toISOString().slice(0, 10)
  
  // Estados do formulário
  const [date, setDate] = useState(today)
  const [type, setType] = useState<MovementType>('saida')
  const [quantity, setQuantity] = useState('')
  const [docRef, setDocRef] = useState('')
  const [notes, setNotes] = useState('')
  const [attachmentName, setAttachmentName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Estados simplificados para o Item
  const [itemSearch, setItemSearch] = useState('') // O texto que aparece no input
  const [selectedItemId, setSelectedItemId] = useState('') // O ID real selecionado

  const disabled = !items.length

  // Função simplificada de seleção via Datalist
  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setItemSearch(val)
    setError(null)

    // Tenta encontrar o item que bate exatamente com o texto digitado/selecionado
    const found = items.find((item) => item.description === val)
    if (found) {
      setSelectedItemId(found.id)
    } else {
      setSelectedItemId('') // Se o texto não bate com nenhum item, limpa o ID
    }
  }

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedItemId) {
      setError('Por favor, selecione um item válido da lista.')
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
      itemId: selectedItemId,
      type,
      quantity: parsedQty,
      document: docRef.trim() || undefined,
      notes: notes.trim() || undefined,
      attachmentName: attachmentName || undefined,
    }

    onAddMovement(movement)

    // Limpeza do formulário
    setQuantity('')
    setDocRef('')
    setNotes('')
    setAttachmentName(null)

    // 🔹 limpa também o item escolhido
    setItemSearch('')
    setSelectedItemId('')
  }


  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setAttachmentName(file ? file.name : null)
  }

  const inputClass =
    'w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all placeholder:text-slate-400 disabled:opacity-60 disabled:cursor-not-allowed'
  const labelClass = 'text-xs font-semibold text-slate-500 ml-1 mb-1.5 block'

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

        {/* --- AQUI ESTÁ A MUDANÇA: INPUT COM DATALIST --- */}
        <div>
          <label className={labelClass}>Item (Buscar)</label>
          <input
            list="items-list" // Conecta ao datalist abaixo
            type="text"
            value={itemSearch}
            onChange={handleItemChange}
            className={inputClass}
            placeholder={disabled ? 'Sem itens...' : 'Digite para buscar ou selecione...'}
            disabled={disabled}
          />
          
          {/* A lista nativa oculta que o navegador usa para autocomplete */}
          <datalist id="items-list">
            {items.map((item) => (
              <option key={item.id} value={item.description} />
            ))}
          </datalist>

          {/* Feedback visual se encontrou o ID ou não (opcional, para debug/certeza) */}
          {!selectedItemId && itemSearch.length > 0 && (
            <p className="text-[10px] text-amber-600 mt-1 ml-1">
              Selecione uma opção da lista para confirmar.
            </p>
          )}
        </div>
        {/* ----------------------------------------------- */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Doc. (Opcional)</label>
            <input
              type="text"
              value={docRef}
              onChange={(e) => setDocRef(e.target.value)}
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

        <div>
          <label className={labelClass}>Anexo (Opcional)</label>
          <input
            type="file"
            onChange={handleAttachmentChange}
            className={inputClass}
            disabled={disabled}
          />
          {attachmentName && (
            <p className="mt-1 text-[11px] text-slate-500 ml-1">
              Arquivo: <span className="font-medium">{attachmentName}</span>
            </p>
          )}
        </div>

        {error && <p className="text-xs text-rose-500 px-1 font-medium">{error}</p>}

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