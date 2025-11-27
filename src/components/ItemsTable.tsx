import React, { useMemo, useState } from 'react'
import type { AlmoxItem, Movement } from '../types'
import { getCurrentStock } from '../utils/stock'

interface Props {
  items: AlmoxItem[]
  movements: Movement[]
}

const ItemsTable: React.FC<Props> = ({ items, movements }) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter(
      (i) =>
        i.description.toLowerCase().includes(term) ||
        i.classification.toLowerCase().includes(term),
    )
  }, [items, search])

  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">3. Visão Geral do Estoque</h2>
          <p className="text-sm text-slate-500">
            Saldo atual considerando todas as movimentações.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            Hoje: {today}
          </span>
        </div>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-4 w-4 text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar item por nome ou classificação..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        />
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-5 py-4 first:pl-6 bg-slate-50">Descrição</th>
                <th className="px-5 py-4 hidden sm:table-cell bg-slate-50">
                  Classificação
                </th>
                <th className="px-5 py-4 text-right bg-slate-50">Inicial</th>
                <th className="px-5 py-4 text-right bg-slate-50">Atual</th>
                <th className="px-5 py-4 text-right bg-slate-50">R$ Total</th>
                <th className="px-5 py-4 text-right last:pr-6 bg-slate-50">Movs.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.map((item) => {
                const currentStock = getCurrentStock(item.id, items, movements)
                const value = currentStock * item.unitPrice
                const movCount = movements.filter(
                  (m) => m.itemId === item.id,
                ).length

                const stockClass =
                  currentStock <= 0
                    ? 'bg-rose-100 text-rose-600'
                    : currentStock < 20
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'

                const stockTitle =
                  currentStock <= 0
                    ? 'Estoque zerado'
                    : currentStock < 20
                    ? 'Estoque abaixo do nível mínimo (20)'
                    : 'Estoque dentro do nível esperado'

                // >>> NOVO: classe para DESTACAR A LINHA TODA <<<
                const rowHighlightClass =
                  currentStock <= 0
                    ? 'bg-rose-50/80 ring-1 ring-rose-200'
                    : currentStock < 20
                    ? 'bg-amber-50/80 ring-1 ring-amber-200'
                    : ''

                // opcional: borda lateral forte (ajuda a chamar mais atenção)
                const leftBorderClass =
                  currentStock <= 0
                    ? 'border-l-4 border-rose-500'
                    : currentStock < 20
                    ? 'border-l-4 border-amber-400'
                    : ''

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${rowHighlightClass}`}
                  >
                    <td
                      className={`px-5 py-4 first:pl-6 align-top ${leftBorderClass}`}
                    >
                      <p className="font-medium text-slate-700">
                        {item.description}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell align-top">
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-500">
                        {item.classification || '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-500 align-top">
                      {item.initialQty}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <span
                        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-xs font-bold ${stockClass}`}
                        title={stockTitle}
                      >
                        {currentStock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-slate-600 font-medium align-top">
                      {value
                        ? value.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })
                        : '-'}
                    </td>
                    <td className="px-5 py-4 text-right last:pr-6 align-top">
                      <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {movCount}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-slate-300"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                        />
                      </svg>
                      <p>Nenhum item encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ItemsTable
