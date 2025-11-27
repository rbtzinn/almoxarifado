import React, { useEffect, useState } from 'react'
import type { AlmoxItem, Movement } from './types'
import { loadItems, loadMovements, saveItems, saveMovements } from './utils/storage'
import { exportMovementsToExcel } from './utils/excel'
import UploadSection from './components/UploadSection'
import MovementForm from './components/MovementForm'
import ItemsTable from './components/ItemsTable'
import HistoryPanel from './components/HistoryPanel'

const App: React.FC = () => {
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])

  useEffect(() => {
    setItems(loadItems())
    setMovements(loadMovements())
  }, [])

  useEffect(() => {
    saveItems(items)
  }, [items])

  useEffect(() => {
    saveMovements(movements)
  }, [movements])

  const handleItemsLoaded = (newItems: AlmoxItem[]) => {
    setItems(newItems)
  }

  const handleAddMovement = (movement: Movement) => {
    setMovements((prev) => [...prev, movement])
  }

  const handleExportMovements = () => {
    exportMovementsToExcel(items, movements)
  }

  const handleClearAll = () => {
    const ok = window.confirm(
      'Isso vai limpar TODOS os itens carregados e movimentos salvos neste navegador. Deseja continuar?',
    )
    if (!ok) return
    setItems([])
    setMovements([])
    saveItems([])
    saveMovements([])
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-600 selection:bg-indigo-100 selection:text-indigo-700">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M4.606 12.97a.75.75 0 01-.134 1.051 2.494 2.494 0 00-.93 2.437 2.494 2.494 0 002.437-.93.75.75 0 111.186.918 3.995 3.995 0 01-3.217 1.48a3.995 3.995 0 01-1.48-3.217 3.995 3.995 0 011.088-2.871.75.75 0 011.05.132z" />
                  <path fillRule="evenodd" d="M3.974 4.197c-1.353 1.96-1.092 4.618.72 6.43a.75.75 0 11-1.06 1.06 6.75 6.75 0 01-.97-8.307.75.75 0 011.31.817zm2.483-1.69c1.96-1.353 4.618-1.092 6.43.72a.75.75 0 101.06-1.06 6.75 6.75 0 00-8.307-.97.75.75 0 00.817 1.31z" clipRule="evenodd" />
                  <path d="M11.754 6.134a.75.75 0 01.442 1.065 2.494 2.494 0 001.558.826 2.494 2.494 0 002.134-1.63.75.75 0 111.416.495 3.995 3.995 0 01-3.414 2.61 3.995 3.995 0 01-2.494-1.32 3.995 3.995 0 01-1.127-2.943.75.75 0 011.485.897z" />
                </svg>
              </span>
              <span>Almoxarifado</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 ml-1">Controle simplificado de estoque</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportMovements}
              className="hidden sm:inline-flex items-center rounded-xl bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!movements.length}
            >
              Baixar Excel
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-full">
            <UploadSection
              onItemsLoaded={handleItemsLoaded}
              currentItemCount={items.length}
            />
          </div>
          <div className="lg:col-span-1 h-full">
            <MovementForm items={items} onAddMovement={handleAddMovement} />
          </div>
        </div>

        <ItemsTable items={items} movements={movements} />

        <HistoryPanel items={items} movements={movements} />
      </main>
      
      <footer className="text-center py-8 text-xs text-slate-400">
        <p>© 2025 Controle de Almoxarifado • Design Intuitivo</p>
      </footer>
    </div>
  )
}

export default App