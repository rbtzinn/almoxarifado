// src/App.tsx
import React, { useEffect, useState } from 'react'
import type { AlmoxItem, Movement } from './types'
import { loadItems, loadMovements, saveItems, saveMovements } from './utils/storage'
import { syncMovementsToGoogleSheet } from './utils/sheets'
import { exportMovementsToExcel } from './utils/excel'

// Componentes
import Sidebar from './components/Sidebar'
import MovementForm from './components/MovementForm'
import ItemsTable from './components/ItemsTable'
import HistoryPanel from './components/HistoryPanel'
import ConfirmDialog from './components/ui/ConfirmDialog'
import LocalChangesCard from './components/LocalChangesCard'
import { Menu } from 'lucide-react'

const App: React.FC = () => {
  // --- Estados de Dados ---
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])

  // --- Estados de UI ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // --- Effects ---
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

  // --- Handlers ---
  const handleItemsLoaded = (newItems: AlmoxItem[]) => setItems(newItems)
  const handleAddMovement = (mov: Movement) => setMovements(prev => [...prev, mov])

  const handleClearAllData = () => {
    setItems([])
    setMovements([])
    saveItems([])
    saveMovements([])
    setShowClearDialog(false)
  }

  const handleDeleteMovement = (movementId: string) => {
    // 1. Remove do estado atual
    const updatedMovements = movements.filter(m => m.id !== movementId);
    setMovements(updatedMovements);

    // 2. Salva no LocalStorage
    localStorage.setItem('almox_movements', JSON.stringify(updatedMovements));

    // O somatório da Sidebar será atualizado automaticamente 
    // pois ele depende do array 'movements' que acabou de mudar.
  };

  const handleSync = async () => {
    if (!items.length) return alert('Sem dados para sincronizar.')
    setSyncing(true)
    try {
      const updatedList = await syncMovementsToGoogleSheet(items, movements)
      if (updatedList) setMovements(updatedList)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-600 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex">
      {/* --- MENU MOBILE (Header) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="font-bold text-slate-800 flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
            A
          </div>
          Almoxarifado
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:sticky top-0 left-0 bottom-0 z-50 h-screen w-72 bg-white border-r border-slate-200 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <Sidebar
          onCloseMobile={() => setIsSidebarOpen(false)}
          onItemsLoaded={handleItemsLoaded}
          currentItemCount={items.length}
          onClear={() => setShowClearDialog(true)}
          onExport={() => exportMovementsToExcel(items, movements)}
          onSync={handleSync}
          isSyncing={syncing}
          hasData={items.length > 0}
          items={items}
          movements={movements}
        />
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden w-full max-w-[1920px] mx-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Area (Desktop) */}
          <div className="hidden lg:flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">
                Gerencie entradas, saídas e audite o estoque.
              </p>
            </div>
            <div className="text-xs font-medium bg-white px-3 py-1.5 rounded-full border border-slate-200 text-slate-500 shadow-sm">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            {/* Coluna Esquerda: Form */}
            <div className="xl:col-span-4">
              <MovementForm items={items} onAddMovement={handleAddMovement} />
            </div>

            {/* Coluna Direita: Painéis */}
            <div className="xl:col-span-8 flex flex-col">
              <HistoryPanel items={items} movements={movements} />
            </div>
          </div>

          {/* Fila de Sync */}
          <div className="w-full pt-2">
            <LocalChangesCard
              items={items}
              movements={movements}
              onDelete={handleDeleteMovement} // <--- Passar a função aqui
            />
          </div>

          {/* Tabela de Itens */}
          <div className="w-full pt-2">
            <ItemsTable items={items} movements={movements} />
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={showClearDialog}
        title="Resetar Sistema"
        description="Isso removerá todos os dados do navegador. Tem certeza?"
        confirmLabel="Sim, Limpar tudo"
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  )
}

export default App
