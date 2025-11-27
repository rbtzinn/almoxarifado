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

const App: React.FC = () => {
  // --- Estados de Dados ---
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  
  // --- Estados de UI ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobile Menu
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // --- Effects (Persistência) ---
  useEffect(() => {
    setItems(loadItems())
    setMovements(loadMovements())
  }, [])

  useEffect(() => { saveItems(items) }, [items])
  useEffect(() => { saveMovements(movements) }, [movements])

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

  const handleSync = async () => {
    if (!items.length) return alert('Sem dados para sincronizar.')
    setSyncing(true)
    try { await syncMovementsToGoogleSheet(items, movements) }
    finally { setSyncing(false) }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-600 font-sans selection:bg-gray-200 selection:text-black">
      
      {/* --- MENU MOBILE (Header) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded-md" /> 
          Almoxarifado
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-500 hover:bg-gray-50 rounded-lg"
        >
          {/* Icon Hamburger */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* --- SIDEBAR (Importação & Ações) --- */}
      {/* Overlay Escuro no Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-80 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          onCloseMobile={() => setIsSidebarOpen(false)}
          onItemsLoaded={handleItemsLoaded}
          currentItemCount={items.length}
          onClear={() => setShowClearDialog(true)}
          onExport={() => exportMovementsToExcel(items, movements)}
          onSync={handleSync}
          isSyncing={syncing}
          hasData={items.length > 0}
        />
      </aside>

      {/* --- CONTEÚDO PRINCIPAL (Main) --- */}
      <main className="lg:ml-80 p-4 lg:p-10 pt-20 lg:pt-10 space-y-8 max-w-[1600px]">
        
        {/* Grid Superior: Formulário + Painel de Histórico (lado a lado em telas grandes) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 h-full">
            <MovementForm items={items} onAddMovement={handleAddMovement} />
          </div>
          <div className="xl:col-span-7 h-full">
            <HistoryPanel items={items} movements={movements} />
          </div>
        </div>

        {/* Tabela de Itens (Ocupa a largura toda abaixo) */}
        <div className="w-full">
           <ItemsTable items={items} movements={movements} />
        </div>

      </main>

      <ConfirmDialog
        open={showClearDialog}
        title="Resetar Sistema"
        description="Deseja remover todos os itens e históricos importados?"
        confirmLabel="Sim, Limpar"
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearDialog(false)}
      />
    </div>
  )
}

export default App