// src/App.tsx
import React, { useEffect, useState } from 'react'
import type { AlmoxItem, Movement } from './types'
import { loadItems, loadMovements, saveItems, saveMovements } from './utils/storage'
import { syncInventoryToGoogleSheet, syncMovementsToGoogleSheet } from './utils/sheets'
import { exportMovementsToExcel } from './utils/excel'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { Menu, Wifi, WifiOff, RefreshCw, Download, Trash2, Zap } from 'lucide-react'

// Componentes
import Sidebar from './components/Sidebar'
import MovementForm from './components/MovementForm'
import ItemsTable from './components/ItemsTable'
import HistoryPanel from './components/HistoryPanel'
import ConfirmDialog from './components/ui/ConfirmDialog'
import LocalChangesCard from './components/LocalChangesCard'
import StatsCards from './components/StatsCards'
import ItemsManagerModal from './components/ItemsManagerModal'
import MovementsManagerModal from './components/MovementsManagerModal'
import StockSummaryModal from './components/StockSummaryModal'

// Logos
import logoLight from './assets/logo-empetur.png'
import logoNight from './assets/logo-empetur-night.png'
import logocontrole from './assets/logo-controle.png'
import logocontrolenight from './assets/logo-controle-night.png'

const AppContent: React.FC = () => {
  const { theme } = useTheme()
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [showItemsManager, setShowItemsManager] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false)
  const [isStockSummaryOpen, setIsStockSummaryOpen] = useState(false) // << NOVO
  const { showToast } = useToast()

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

  const handleItemsLoaded = (newItems: AlmoxItem[]) => setItems(newItems)

  const handleAddMovement = (mov: Movement) =>
    setMovements((prev) => [...prev, mov])

  const handleClearAllData = () => {
    setItems([])
    setMovements([])
    saveItems([])
    saveMovements([])
    setShowClearDialog(false)
  }

  const handleDeleteMovement = (id: string) => {
    setMovements((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      localStorage.setItem('almox_movements', JSON.stringify(updated))
      return updated
    })
  }

  const handleSync = async () => {
    if (!items.length) {
      showToast({
        variant: 'info',
        title: 'Vazio',
        message: 'Importe uma planilha antes.',
      })
      return
    }
    if (!isOnline) {
      showToast({
        variant: 'warning',
        title: 'Offline',
        message: 'Sem internet.',
      })
      return
    }
    setSyncing(true)
    try {
      await syncInventoryToGoogleSheet(items, movements)
      const updatedList = await syncMovementsToGoogleSheet(items, movements)
      if (updatedList === null) {
        showToast({
          variant: 'info',
          title: 'Tudo certo',
          message: 'Nada novo para enviar.',
        })
        return
      }
      setMovements(updatedList)
      showToast({
        variant: 'success',
        title: 'Sucesso',
        message: 'Sincronizado!',
      })
    } catch (error: any) {
      console.error(error)
      showToast({
        variant: 'error',
        title: 'Erro',
        message: error?.message || 'Falha na sincronização.',
      })
    } finally {
      setSyncing(false)
    }
  }

  const hasData = items.length > 0

  // Definição das logos baseada no tema
  const empeturLogo = theme === 'dark' ? logoNight : logoLight
  const controleLogo = theme === 'dark' ? logocontrolenight : logocontrole

  return (
    <div className="min-h-screen bg-[#f0f4f8] dark:bg-[#050505] text-slate-600 dark:text-slate-300 font-sans transition-colors duração-500 overflow-x-hidden relative selection:bg-[#0F3B82] selection:text-white">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#0F3B82] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 dark:opacity-10 animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#4800BC] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 dark:opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-[#89D700] rounded-full mix-blend-multiply filter blur-[128px] opacity-5 dark:opacity-5 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* --- MOBILE HEADER --- */}
        <div className="lg:hidden fixed top-4 left-4 right-4 h-16 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl flex items-center justify-between px-5 z-50 shadow-lg shadow-black/5">
          <div className="font-black text-[#0F3B82] dark:text-white flex items-center gap-3 text-lg tracking-tight">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0F3B82] to-[#4800BC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#0F3B82]/20">
              <Zap size={18} fill="currentColor" />
            </div>
            <span>ALMOX</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white rounded-xl active:scale-95 transition-all"
          >
            <Menu size={20} />
          </button>
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside
          className={`
    fixed top-0 left-0 h-screen z-50 w-80 
    transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    lg:bg-transparent
  `}
        // REMOVIDO: "lg:sticky"
        // MANTIDO: "fixed" (agora vale para mobile e desktop)
        >
          <div className="h-full p-0 lg:p-6 lg:pr-0">
            {/* Adicionado overflow-y-auto aqui caso o menu seja muito alto e precise de scroll interno */}
            <div className="h-full w-full bg-white/80 dark:bg-[#111111]/80 backdrop-blur-2xl lg:rounded-[2rem] border-r lg:border border-slate-200/50 dark:border-white/5 shadow-2xl lg:shadow-none overflow-hidden overflow-y-auto relative">
              <Sidebar
                onCloseMobile={() => setIsSidebarOpen(false)}
                onItemsLoaded={handleItemsLoaded}
                currentItemCount={items.length}
                hasData={hasData}
                items={items}
                movements={movements}
              />
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 p-4 lg:p-8 pt-24 lg:pt-8 w-full lg:ml-80 transition-[margin] duration-500">
          <div className="max-w-[1600px] mx-auto flex flex-col gap-8">
            {/* Header Desktop - LOGOS EM DESTAQUE */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
                  Dashboard
                </h1>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Visão geral do sistema e operações.
                </p>
              </div>

              {/* Área de Marcas - Aumentada e Destacada */}
              <div className="flex items-center gap-8 bg-white/40 dark:bg-white/5 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
                {/* Controle Interno */}
                <div className="h-[60px] flex items-center">
                  <img
                    src={controleLogo}
                    alt="Logo Controle Interno"
                    className="h-full w-auto object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* Divisor */}
                <div className="h-10 w-px bg-slate-300 dark:bg-white/10 opacity-50" />

                {/* EMPETUR */}
                <div className="h-[50px] flex items-center">
                  <img
                    src={empeturLogo}
                    alt="Logo EMPETUR"
                    className="h-full w-auto object-contain hover:scale-105 transition-transform duração-300 drop-shadow-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* Status Indicator */}
                <div
                  className={`ml-4 flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/20 backdrop-blur-md transition-all ${isOnline ? 'text-[#89D700]' : 'text-[#E30613]'
                    }`}
                >
                  {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-white/60 dark:bg-[#111111]/60 backdrop-blur-xl p-2.5 rounded-2xl border border-white/40 dark:border-white/5 shadow-sm">
              <button
                onClick={handleSync}
                disabled={!hasData || syncing}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F3B82] hover:bg-[#0d306b] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-lg shadow-[#0F3B82]/30 active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>

              <button
                onClick={() => exportMovementsToExcel(items, movements)}
                disabled={!hasData}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 font-bold text-xs uppercase tracking-wide transition-all active:scale-95 disabled:opacity-50"
              >
                <Download size={16} />
                Excel
              </button>

              <div className="ml-auto pl-3 border-l border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setShowClearDialog(true)}
                  disabled={!hasData}
                  className="p-3 rounded-xl text-[#E30613] hover:bg-[#E30613]/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {hasData && (
              <StatsCards
                items={items}
                movements={movements}
                onOpenItemsManager={() => setShowItemsManager(true)}
                onOpenMovementsManager={() => setIsMovementsModalOpen(true)}
                onOpenStockSummary={() => setIsStockSummaryOpen(true)} // << NOVO
              />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="xl:col-span-4 space-y-6 lg:space-y-8">
                <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                  <MovementForm items={items} onAddMovement={handleAddMovement} />
                </div>

                <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
                  <LocalChangesCard
                    items={items}
                    movements={movements}
                    onDelete={handleDeleteMovement}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="xl:col-span-8 space-y-6 lg:space-y-8 h-full flex flex-col">
                <div className="flex-1 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden min-h-[500px]">
                  <HistoryPanel items={items} movements={movements} />
                </div>
              </div>
            </div>

            {/* Full Width Table */}
            <div className="bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
              <ItemsTable items={items} movements={movements} />
            </div>
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={showClearDialog}
        title="Formatação Completa"
        description="Esta ação irá apagar todos os dados locais. Isso é irreversível."
        confirmLabel="Confirmar Limpeza"
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearDialog(false)}
      />

      <ItemsManagerModal
        open={showItemsManager}
        onClose={() => setShowItemsManager(false)}
        items={items}
        movements={movements}
        onItemsChange={setItems}
        onAddMovement={handleAddMovement}
      />

      <MovementsManagerModal
        open={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
        movements={movements}
        items={items} // Importante passar items para mostrar o nome
        onDeleteMovement={handleDeleteMovement}
      />

      <StockSummaryModal
        open={isStockSummaryOpen}
        onClose={() => setIsStockSummaryOpen(false)}
        items={items}
        movements={movements}
      />
    </div>
  )
}

const App: React.FC = () => (
  <ThemeProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </ThemeProvider>
)

export default App
