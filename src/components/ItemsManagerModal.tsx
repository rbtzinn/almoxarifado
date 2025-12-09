// src/components/ItemsManagerModal.tsx
import React, {
  useState,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'
import {
  X,
  Search,
  Package,
  Tag,
  DollarSign,
  Hash,
  Trash2,
  Plus,
  AlertCircle,
  ArrowLeft,
  Box,
} from 'lucide-react'

export interface ItemsManagerModalProps {
  open: boolean
  onClose: () => void
  items: AlmoxItem[]
  movements: Movement[]
  onItemsChange: Dispatch<SetStateAction<AlmoxItem[]>>
  onAddMovement: (movement: Movement) => void
}

const ItemsManagerModal: React.FC<ItemsManagerModalProps> = ({
  open,
  onClose,
  items,
  movements,
  onItemsChange,
  onAddMovement,
}) => {
  // --- STATES ---
  const [search, setSearch] = useState('')

  // Form States
  const [description, setDescription] = useState('')
  const [classification, setClassification] = useState('')
  const [isCustomClass, setIsCustomClass] = useState(false)
  const [initialQty, setInitialQty] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  // --- MEMOS ---
  const uniqueClassifications = useMemo(() => {
    const classes = new Set(items.map((i) => i.classification))
    return Array.from(classes).sort()
  }, [items])

  const itemsWithStock = useMemo(() => {
    return items
      .map((item) => {
        const currentStock = getCurrentStock(item.id, items, movements)
        const totalValue = currentStock * item.unitPrice
        return { ...item, currentStock, totalValue }
      })
      .filter((item) => {
        const term = search.trim().toUpperCase()
        if (!term) return true
        return (
          item.description.toUpperCase().includes(term) ||
          item.classification.toUpperCase().includes(term)
        )
      })
      .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'))
  }, [items, movements, search])

  // --- EFFECTS ---
  useEffect(() => {
    if (!open) return
    setSearch('')
    resetForm()
    setItemToDelete(null)
  }, [open])

  const resetForm = () => {
    setDescription('')
    setClassification('')
    setIsCustomClass(false)
    setInitialQty('')
    setUnitPrice('')
    setFormError(null)
  }

  // --- HANDLERS ---
  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    onItemsChange((prev) => prev.filter((i) => i.id !== itemToDelete))
    setItemToDelete(null)
  }

  const cancelDelete = () => {
    setItemToDelete(null)
  }

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const desc = description.trim().toUpperCase()
    const cls = classification.trim().toUpperCase()

    if (!desc || !cls) {
      setFormError('Preencha descrição e classificação.')
      return
    }

    const qty = Number(String(initialQty).replace(',', '.')) || 0
    const price = Number(String(unitPrice).replace(',', '.')) || 0

    const id = `${cls}__${desc}`

    if (items.some((i) => i.id === id)) {
      setFormError('Já existe um item com essa descrição e classificação.')
      return
    }

    const newItem: AlmoxItem = {
      id,
      classification: cls,
      description: desc,
      initialQty: qty,
      unitPrice: price,
      initialStockValue: qty * price,
    } as unknown as AlmoxItem

    onItemsChange((prev) => [...prev, newItem])

    if (qty > 0) {
      const today = new Date().toISOString().slice(0, 10)
      const movement: Movement = {
        id: `item-create-${Date.now()}`,
        date: today,
        itemId: newItem.id,
        type: 'entrada',
        quantity: qty,
        document: '',
        notes: 'Cadastro inicial de item',
        synced: false,
      } as Movement

      onAddMovement(movement)
    }

    resetForm()
  }

  const handleClassificationSelect = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value
    if (value === 'NEW__CLASS__OPTION') {
      setIsCustomClass(true)
      setClassification('')
    } else {
      setIsCustomClass(false)
      setClassification(value)
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

      {/* Modal Principal */}
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] bg-white dark:bg-[#0b101b] rounded-3xl shadow-2xl shadow-black/50 border border-slate-200/60 dark:border-white/5 overflow-hidden flex flex-col transform transition-all">
        
        {/* --- MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (Sobreposto) --- */}
        {itemToDelete && (
          <div className="absolute inset-0 z-[70] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white dark:bg-[#0e1421] rounded-2xl shadow-2xl border border-red-100 dark:border-red-900/30 p-6 transform scale-100 animate-in fade-in zoom-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 text-red-600 dark:text-red-400 mx-auto shadow-sm">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
                Excluir Item?
              </h3>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Esta ação removerá o item <strong>permanentemente</strong> do seu
                armazenamento local. O histórico de movimentações deste item
                poderá ficar inconsistente.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg shadow-red-600/20 transition-all active:scale-95"
                >
                  Sim, excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-[#0b101b]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#0F3B82]/10 text-[#0F3B82] dark:bg-[#00C3E3]/15 dark:text-[#00C3E3]">
                <Box size={20} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Catálogo de Itens
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Gerencie os produtos cadastrados no sistema.
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

        {/* Conteúdo (Layout de Colunas) */}
        <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-white/5 overflow-hidden">
          
          {/* ESQUERDA: Lista de Itens */}
          <div className="flex-1 min-w-0 flex flex-col bg-slate-50/30 dark:bg-[#05080f]">
            {/* Barra de Busca */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-[#0b101b]">
              <div className="relative group">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 group-focus-within:text-[#0F3B82] dark:group-focus-within:text-[#00C3E3] transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3]/50 focus:bg-white dark:focus:bg-black/40 transition-all uppercase"
                  placeholder="BUSCAR POR NOME OU CLASSIFICAÇÃO..."
                />
                <div className="absolute right-3.5 top-3.5 text-[10px] font-bold text-slate-300 dark:text-slate-600">
                  {items.length} REGISTROS
                </div>
              </div>
            </div>

            {/* Tabela Scrollável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
              <div className="bg-white dark:bg-[#0e1421] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50/80 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
                        Item
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
                        Classificação
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                        Qtd
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">
                        Preço
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center w-14">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {itemsWithStock.map((item) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:bg-[#0F3B82]/10 group-hover:text-[#0F3B82] transition-colors">
                              <Package size={14} />
                            </div>
                            <span
                              className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase truncate max-w-[180px]"
                              title={item.description}
                            >
                              {item.description}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                            {item.classification}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`text-xs font-mono font-medium tabular-nums ${
                              item.currentStock <= 0
                                ? 'text-rose-500 font-bold'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.currentStock}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                            {item.unitPrice.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => handleDeleteClick(item.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!itemsWithStock.length && (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                            <Package
                              size={40}
                              strokeWidth={1.5}
                              className="mb-3 opacity-20"
                            />
                            <p className="text-sm font-medium">
                              Nenhum item encontrado
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DIREITA: Formulário */}
          <div className="w-full lg:w-[380px] flex flex-col bg-white dark:bg-[#0b101b] z-10 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0e1421]">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded bg-[#0F3B82]/10 text-[#0F3B82] dark:bg-[#00C3E3]/15 dark:text-[#00C3E3]">
                    <Plus size={14} strokeWidth={3} />
                </span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Novo Cadastro
                </p>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Adicionar Item
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Preencha os dados abaixo para adicionar ao catálogo local.
              </p>
            </div>

            <form
              onSubmit={handleCreateItem}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5 bg-white dark:bg-[#0b101b]"
            >
              {/* Descrição */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Hash size={12} />
                  Descrição do Item
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] focus:bg-white dark:focus:bg-[#0b101b] uppercase transition-all"
                  placeholder="EX: PAPEL A4 75G"
                  autoFocus
                />
              </div>

              {/* Classificação */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Tag size={12} />
                  Classificação
                </label>

                {!isCustomClass ? (
                  <div className="relative">
                    <select
                      value={classification}
                      onChange={handleClassificationSelect}
                      className="w-full appearance-none px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] uppercase transition-all cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10"
                    >
                      <option value="" disabled>
                        SELECIONE...
                      </option>
                      {uniqueClassifications.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                      <option
                        value="NEW__CLASS__OPTION"
                        className="font-bold text-[#0F3B82] dark:text-[#00C3E3]"
                      >
                        + NOVA CLASSIFICAÇÃO...
                      </option>
                    </select>
                    {/* Seta customizada */}
                    <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                      <svg
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 1L5 5L9 1"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={classification}
                        onChange={(e) =>
                          setClassification(e.target.value.toUpperCase())
                        }
                        className="w-full px-4 py-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/30 text-xs font-bold text-blue-900 dark:text-blue-100 placeholder:text-blue-300 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] uppercase animate-in slide-in-from-left-2 fade-in"
                        placeholder="DIGITE A NOVA CLASSIFICAÇÃO"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomClass(false)
                        setClassification('')
                      }}
                      className="px-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                      title="Voltar para lista"
                    >
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Quantidade e Preço */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Qtd. Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialQty}
                    onChange={(e) => setInitialQty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <DollarSign size={12} />
                    Preço Unit.
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F3B82] dark:focus:ring-[#00C3E3] transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Mensagem de Erro */}
              {formError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="text-xs font-medium leading-relaxed">
                    {formError}
                  </span>
                </div>
              )}
            </form>

            {/* Footer do Form */}
            <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0e1421]">
              <button
                type="button"
                onClick={handleCreateItem}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#0F3B82] hover:bg-[#0d306b] dark:bg-[#0F3B82] dark:hover:bg-[#00C3E3] text-white shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all duration-200 group"
              >
                <Plus
                  size={18}
                  className="group-hover:rotate-90 transition-transform duration-300"
                />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Adicionar ao Catálogo
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemsManagerModal