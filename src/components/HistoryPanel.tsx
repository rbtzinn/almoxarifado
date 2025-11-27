import React, { useEffect, useMemo, useState, useRef } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getMovementsForItemUpToDate, getStockOnDate } from '../utils/stock'

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
}

const HistoryPanel: React.FC<Props> = ({ items, movements }) => {
  const todayIso = new Date().toISOString().slice(0, 10)
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(todayIso)

  // busca + dropdown único
  const [itemSearch, setItemSearch] = useState<string>('')
  const [isItemOpen, setIsItemOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // fecha dropdown clicando fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsItemOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // itens ordenados por descrição
  const sortedItems = useMemo(
    () =>
      items
        .slice()
        .sort((a, b) => a.description.localeCompare(b.description, 'pt-BR')),
    [items],
  )

  // filtro + prioridade: começa com termo > contém termo
  const filteredItems = useMemo(() => {
    const base = sortedItems
    const term = itemSearch.trim().toLowerCase()
    if (!term) return base

    return base.slice().sort((a, b) => {
      const aDesc = a.description.toLowerCase()
      const bDesc = b.description.toLowerCase()

      const aStarts = aDesc.startsWith(term) ? 0 : 1
      const bStarts = bDesc.startsWith(term) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts

      const aIncludes = aDesc.includes(term) ? 0 : 1
      const bIncludes = bDesc.includes(term) ? 0 : 1
      if (aIncludes !== bIncludes) return aIncludes - bIncludes

      return aDesc.localeCompare(bDesc, 'pt-BR')
    })
  }, [sortedItems, itemSearch])

  // se não tiver item selecionado ainda, pega o primeiro filtrado
  useEffect(() => {
    if (!selectedItemId && filteredItems.length) {
      setSelectedItemId(filteredItems[0].id)
      setItemSearch(filteredItems[0].description)
    }
  }, [filteredItems, selectedItemId])

  // se o item selecionado sair do filtro, seleciona o primeiro da lista
  useEffect(() => {
    if (!filteredItems.length) return
    const exists = filteredItems.some((i) => i.id === selectedItemId)
    if (!exists) {
      setSelectedItemId(filteredItems[0].id)
      setItemSearch(filteredItems[0].description)
    }
  }, [filteredItems, selectedItemId])

  const selectedItem =
    filteredItems.find((i) => i.id === selectedItemId) || null

  const { stock, entradas, saidas, relevantMovs } = useMemo(() => {
    if (!selectedItem) {
      return {
        stock: 0,
        entradas: 0,
        saidas: 0,
        relevantMovs: [] as Movement[],
      }
    }
    const relevant = getMovementsForItemUpToDate(
      selectedItem.id,
      movements,
      selectedDate,
    ).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

    const stockValue = getStockOnDate(
      selectedItem.id,
      items,
      movements,
      selectedDate,
    )

    const entradasTotal = relevant
      .filter((m) => m.type === 'entrada')
      .reduce((sum, m) => sum + m.quantity, 0)

    const saidasTotal = relevant
      .filter((m) => m.type === 'saida')
      .reduce((sum, m) => sum + m.quantity, 0)

    return {
      stock: stockValue,
      entradas: entradasTotal,
      saidas: saidasTotal,
      relevantMovs: relevant,
    }
  }, [selectedItem, movements, selectedDate, items])

  const selectClass =
    'w-full rounded-xl border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all'

  const handleItemInputClick = () => {
    if (!items.length) return
    setIsItemOpen((prev) => !prev)
  }

  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setItemSearch(value)
    setIsItemOpen(true)
  }

  const handleSelectItem = (item: AlmoxItem) => {
    setSelectedItemId(item.id)
    setItemSearch(item.description)
    setIsItemOpen(false)
  }

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">4. Máquina do Tempo</h2>
        <p className="text-sm text-slate-500">
          Veja quanto havia no estoque em qualquer data passada.
        </p>
      </div>

      {!items.length ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
          Sem dados para analisar no momento.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-500 ml-1 mb-1.5 block">
                Data de referência
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={selectClass}
              />
            </div>

            {/* Campo ÚNICO: busca + dropdown */}
            <div className="sm:col-span-2" ref={dropdownRef}>
              <label className="text-xs font-semibold text-slate-500 ml-1 mb-1.5 block">
                Item (Descrição)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={itemSearch}
                  onChange={handleItemInputChange}
                  onClick={handleItemInputClick}
                  className={`${selectClass} pr-9 cursor-pointer`}
                  placeholder="Clique ou comece a digitar para filtrar..."
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transition-transform ${
                      isItemOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>

                {isItemOpen && (
                  <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-56 overflow-auto text-sm">
                    {filteredItems.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400">
                        Nenhum item encontrado.
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectItem(item)}
                          className={`w-full text-left px-3 py-2 hover:bg-indigo-50 ${
                            item.id === selectedItemId
                              ? 'bg-indigo-50 font-semibold'
                              : ''
                          }`}
                        >
                          {item.description}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedItem && (
            <div className="mb-8">
              {/* Cartão de Destaque (Saldo Final) */}
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-xs font-medium uppercase tracking-wide mb-1">
                    Saldo em {new Date(selectedDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-4xl font-bold">{stock}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {selectedItem.description}
                  </p>
                  <p className="text-indigo-200 text-sm">
                    {selectedItem.classification}
                  </p>
                </div>
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400 font-medium uppercase">
                    Inicial
                  </p>
                  <p className="text-xl font-bold text-slate-700 mt-1">
                    {selectedItem.initialQty}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-600 font-medium uppercase">
                    Entradas
                  </p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">
                    +{entradas}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                  <p className="text-xs text-rose-600 font-medium uppercase">
                    Saídas
                  </p>
                  <p className="text-xl font-bold text-rose-700 mt-1">
                    -{saidas}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 px-1">
              Histórico de Movimentações
            </h3>
            <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3">
                {relevantMovs.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        m.type === 'entrada' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-slate-700">
                          {m.type === 'entrada' ? 'Entrada' : 'Saída'} de{' '}
                          <span className="font-bold">{m.quantity}</span>
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(m.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Linha de documentos/anexos */}
                      {(m.document || m.attachmentName) && (
                        <div className="flex flex-wrap gap-2 mb-1">
                          {m.document && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path d="M4.5 3.75A1.75 1.75 0 016.25 2h5.086c.464 0 .908.184 1.236.512l2.916 2.916c.328.328.512.772.512 1.236v7.586A1.75 1.75 0 0114.25 16.5h-8A1.75 1.75 0 014.5 14.75v-11z" />
                              </svg>
                              Doc: {m.document}
                            </span>
                          )}
                          {m.attachmentName && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-3 h-3"
                              >
                                <path d="M8.75 4.75A3.25 3.25 0 0112 8v5a2.5 2.5 0 11-5 0V7.5a1 1 0 012 0v5.25a.75.75 0 101.5 0V8a1.75 1.75 0 10-3.5 0v5a3.25 3.25 0 006.5 0V7.5a4.25 4.25 0 10-8.5 0v5.75a.75.75 0 01-1.5 0V7.5a5.75 5.75 0 1111.5 0v5.5a4 4 0 11-8 0V8a.75.75 0 011.5 0v5a2.5 2.5 0 105 0V8a3.25 3.25 0 00-6.5 0v4.75" />
                              </svg>
                              Anexo: {m.attachmentName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Observações */}
                      <p className="text-xs text-slate-500 truncate">
                        {m.notes || (
                          <span className="italic opacity-50">
                            Sem observações
                          </span>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
                {!relevantMovs.length && (
                  <li className="text-center py-6 text-sm text-slate-400 italic">
                    Nenhuma movimentação registrada até esta data.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default HistoryPanel
