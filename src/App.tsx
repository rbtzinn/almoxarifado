// src/App.tsx
import React, { useEffect, useState } from 'react'
import type { AlmoxItem, Movement } from './types'
import { loadItems, loadMovements, saveItems, saveMovements } from './utils/storage'
import { syncMovementsToGoogleSheet } from './utils/sheets'
import { exportMovementsToExcel } from './utils/excel'
import { ThemeProvider } from './contexts/ThemeContext'

// Componentes
import Sidebar from './components/Sidebar'
import MovementForm from './components/MovementForm'
import ItemsTable from './components/ItemsTable'
import HistoryPanel from './components/HistoryPanel'
import ConfirmDialog from './components/ui/ConfirmDialog'
import LocalChangesCard from './components/LocalChangesCard'
import { Menu, Wifi, WifiOff } from 'lucide-react' // Importei icones de Wifi

const App: React.FC = () => {
  // --- Estados de Dados ---
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])

  // --- Estados de UI ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // --- NOVO: Estado de Conexão Real ---
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  // --- Effects ---
  
  // 1. Monitorar Conexão (Online/Offline)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
    const updatedMovements = movements.filter(m => m.id !== movementId);
    setMovements(updatedMovements);
    localStorage.setItem('almox_movements', JSON.stringify(updatedMovements));
  };

  const handleSync = async () => {
    if (!items.length) return alert('Sem dados para sincronizar.')
    if (!isOnline) return alert('Você precisa estar online para sincronizar com o Google.') // Bloqueio extra
    
    setSyncing(true)
    try {
      const updatedList = await syncMovementsToGoogleSheet(items, movements)
      if (updatedList) setMovements(updatedList)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 flex transition-colors duration-300">
        
        {/* --- MENU MOBILE (Header) --- */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 shadow-sm transition-colors">
          <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 dark:shadow-none shadow-lg">
              A
            </div>
            Almoxarifado
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* --- SIDEBAR --- */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
          fixed lg:sticky top-0 left-0 bottom-0 z-50 h-screen w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out
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
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Gerencie entradas, saídas e audite o estoque.
                </p>
              </div>

              {/* Área Direita: Status + Data */}
              <div className="flex items-center gap-3">
                
                {/* --- Indicador Online/Offline REAL --- */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${
                    isOnline 
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800' 
                      : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    </span>
                    <span className={`text-xs font-bold ${isOnline ? 'text-slate-600 dark:text-slate-300' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                    {isOnline ? <Wifi size={14} className="text-emerald-500"/> : <WifiOff size={14} className="text-rose-500"/>}
                </div>
                {/* ------------------------------- */}

                <div className="text-xs font-medium bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm transition-colors">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
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
                onDelete={handleDeleteMovement}
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
    </ThemeProvider>
  )
}

export default App