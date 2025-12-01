import React, { useEffect, useState } from 'react'
import type { AlmoxItem, Movement } from './types'
import { loadItems, loadMovements, saveItems, saveMovements } from './utils/storage'
import { syncMovementsToGoogleSheet } from './utils/sheets'
import { exportMovementsToExcel } from './utils/excel'
// Adicionei useTheme na importação
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { ToastProvider, useToast } from './contexts/ToastContext'

// Componentes
import Sidebar from './components/Sidebar'
import MovementForm from './components/MovementForm'
import ItemsTable from './components/ItemsTable'
import HistoryPanel from './components/HistoryPanel'
import ConfirmDialog from './components/ui/ConfirmDialog'
import LocalChangesCard from './components/LocalChangesCard'
import { Menu, Wifi, WifiOff, RefreshCw, Download, Trash2 } from 'lucide-react'

// Importando as DUAS logos
import logoLight from './assets/logo-empetur.png'
import logoNight from './assets/logo-empetur-night.png'
import logocontrole from './assets/logo-controle.png'
import logocontrolenight from './assets/logo-controle-night.png'

const AppContent: React.FC = () => {
  // --- Hook do Tema ---
  const { theme } = useTheme()

  // --- Estados de Dados ---
  const [items, setItems] = useState<AlmoxItem[]>([])
  const [movements, setMovements] = useState<Movement[]>([])

  // --- Estados de UI ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [syncing, setSyncing] = useState(false)

  // --- Estado de Conexão Real ---
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  const { showToast } = useToast()

  // --- Effects ---

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

  const handleAddMovement = (mov: Movement) =>
    setMovements((prev) => [...prev, mov])

  const handleClearAllData = () => {
    setItems([])
    setMovements([])
    saveItems([])
    saveMovements([])
    setShowClearDialog(false)
  }

  const handleDeleteMovement = (movementId: string) => {
    const updatedMovements = movements.filter((m) => m.id !== movementId)
    setMovements(updatedMovements)
    localStorage.setItem('almox_movements', JSON.stringify(updatedMovements))
  }

  const handleSync = async () => {
    if (!items.length) {
      showToast({
        variant: 'info',
        title: 'Nada para sincronizar',
        message:
          'Nenhum item foi importado. Importe uma planilha antes de sincronizar.',
      })
      return
    }

    if (!isOnline) {
      showToast({
        variant: 'warning',
        title: 'Você está offline',
        message:
          'Conecte-se à internet para sincronizar com o Google Sheets.',
      })
      return
    }

    setSyncing(true)
    try {
      const updatedList = await syncMovementsToGoogleSheet(items, movements)

      // Função retornou null => não tinha movimento novo
      if (updatedList === null) {
        showToast({
          variant: 'info',
          title: 'Nenhuma alteração nova',
          message: 'Não há novas movimentações para enviar para a planilha.',
        })
        return
      }

      // Sucesso: recebemos a lista com os synced marcados
      setMovements(updatedList)
      showToast({
        variant: 'success',
        title: 'Sincronização concluída',
        message: 'As movimentações foram sincronizadas com sucesso.',
      })
    } catch (error: any) {
      console.error(error)
      showToast({
        variant: 'error',
        title: 'Erro na sincronização',
        message:
          error?.message ||
          'Ocorreu um problema ao sincronizar os dados com o Google Sheets.',
      })
    } finally {
      setSyncing(false)
    }
  }

  const hasData = items.length > 0

  // Estilos de botão reutilizáveis
  const actionBtnClass =
    'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  // Lógica para escolher as logos corretas por tema
  const empeturLogo = theme === 'dark' ? logoNight : logoLight
  const controleLogo = theme === 'dark' ? logocontrolenight : logocontrole

  return (
    // Removi 'flex' daqui para controlar manualmente a estrutura vertical
    <div className="min-h-screen bg-slate-50 dark:bg-[#050912] text-slate-600 dark:text-slate-300 font-sans transition-colors duration-300">
      {/* --- BARRA SUPERIOR DE IDENTIDADE (Cores de PE) --- */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[100] flex shadow-md">
        <div className="h-full w-1/4 bg-[#0F3B82]"></div>
        <div className="h-full w-1/4 bg-[#FFCD00]"></div>
        <div className="h-full w-1/4 bg-[#89D700]"></div>
        <div className="h-full w-1/4 bg-[#E30613]"></div>
      </div>

      {/* Wrapper Flexível que compensa a barra fixa (pt-3) */}
      <div className="flex pt-0 min-h-screen">
        {/* --- MENU MOBILE (Header) --- */}
        <div className="lg:hidden fixed top-3 left-0 right-0 h-16 bg-white dark:bg-[#0F3B82] border-b border-slate-200 dark:border-blue-900 flex items-center justify-between px-4 z-40 shadow-sm transition-colors">
          <div className="font-bold text-[#0F3B82] dark:text-white flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-[#0F3B82] dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-[#0F3B82] shadow-lg">
              A
            </div>
            Almoxarifado
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 dark:text-blue-100 hover:bg-slate-100 dark:hover:bg-blue-800 rounded-lg active:scale-95 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* --- SIDEBAR --- */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-[#0F3B82]/20 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Ajustado top-3 e altura calculada para descontar a barra */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 bottom-0 z-50 h-[calc(100vh-0.75rem)] w-72 bg-white dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-slate-800 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <Sidebar
            onCloseMobile={() => setIsSidebarOpen(false)}
            onItemsLoaded={handleItemsLoaded}
            currentItemCount={items.length}
            hasData={hasData}
            items={items}
            movements={movements}
          />
        </aside>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 overflow-x-hidden w-full max-w-[1920px] mx-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Area (Desktop) */}
            <div className="hidden lg:flex items-center justify-between">
              {/* Logos à esquerda */}
              <div className="flex items-center gap-10">
                {/* CONTROLE INTERNO */}
                <div className="h-[80px] w-[300px] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={controleLogo}
                    alt="Logo Controle Interno EMPETUR"
                    className="h-[130px] w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>

                {/* EMPETUR + GOV PE */}
                <div className="h-[64px] w-[320px] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={empeturLogo}
                    alt="Logo EMPETUR"
                    className="h-[130px] w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>

              {/* Área Direita: Status + Data */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all duration-300 ${isOnline
                      ? 'bg-white dark:bg-[#0F3B82]/20 border-slate-200 dark:border-[#0F3B82]/40'
                      : 'bg-[#E30613]/10 dark:bg-[#E30613]/20 border-[#E30613]/20 dark:border-[#E30613]/40'
                    }`}
                >
                  <span className="relative flex h-2 w-2">
                    {isOnline && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#89D700] opacity-75"></span>
                    )}
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-[#89D700]' : 'bg-[#E30613]'
                        }`}
                    ></span>
                  </span>
                  <span
                    className={`text-xs font-bold ${isOnline
                        ? 'text-slate-600 dark:text-blue-100'
                        : 'text-[#E30613] dark:text-red-300'
                      }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  {isOnline ? (
                    <Wifi size={14} className="text-[#89D700]" />
                  ) : (
                    <WifiOff size={14} className="text-[#E30613]" />
                  )}
                </div>

                <div className="text-xs font-medium bg-white dark:bg-[#111827] px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 shadow-sm transition-colors">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* NOVA BARRA DE AÇÕES (TOOLBAR) */}
            <div className="bg-white dark:bg-[#0a0f1d] p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 px-1">
                {/* Botão Sync */}
                <button
                  onClick={handleSync}
                  disabled={!hasData || syncing}
                  className={`${actionBtnClass} bg-blue-50 text-[#0F3B82] hover:bg-[#0F3B82] hover:text-white dark:bg-[#0F3B82]/20 dark:text-[#00C3E3] dark:hover:bg-[#0F3B82] dark:hover:text-white`}
                >
                  <RefreshCw
                    size={16}
                    className={syncing ? 'animate-spin' : ''}
                  />
                  {syncing ? 'Sincronizando...' : 'Sync Planilha'}
                </button>

                {/* Botão Baixar */}
                <button
                  onClick={() => exportMovementsToExcel(items, movements)}
                  disabled={!hasData}
                  className={`${actionBtnClass} bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`}
                >
                  <Download size={16} />
                  Baixar Histórico
                </button>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-800 ml-auto">
                {/* Botão Limpar */}
                <button
                  onClick={() => setShowClearDialog(true)}
                  disabled={!hasData}
                  className={`${actionBtnClass} text-[#E30613] hover:bg-[#E30613]/10 dark:hover:bg-[#E30613]/20 px-3`}
                  title="Limpar todos os dados"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Limpar Tudo</span>
                </button>
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
      </div>

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

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
