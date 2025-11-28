import React, { useState } from 'react'
import type { AlmoxItem } from '../types'
import { parseItemsFromFile } from '../utils/excel'
import ConfirmDialog from './ui/ConfirmDialog'

interface Props {
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
  onClearItems?: () => void
}

const UploadSection: React.FC<Props> = ({
  onItemsLoaded,
  currentItemCount,
  onClearItems,
}) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const hasItems = currentItemCount > 0
  const disabled = loading || hasItems

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)
    setFileName(file.name)

    try {
      const items = await parseItemsFromFile(file)
      if (!items.length) {
        setError('O arquivo parece vazio. Verifique os cabeçalhos.')
        return
      }
      onItemsLoaded(items)
    } catch (err) {
      console.error(err)
      setError('Erro na leitura. Certifique-se que é um Excel válido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="relative group overflow-hidden rounded-3xl border border-white/10 bg-gray-900/40 backdrop-blur-xl shadow-2xl transition-all hover:shadow-cyan-500/10">
        {/* Barra de progresso visual no topo */}
        <div className={`absolute top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-1000 ${hasItems ? 'w-full' : 'w-0'}`} />

        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Central de Dados
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-light">
              Importe sua planilha para energizar o sistema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Badge Neon */}
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 transition-all ${hasItems
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'bg-white/5 border-white/10 text-gray-500'
              }`}>
              <span className="relative flex h-2 w-2">
                {hasItems && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${hasItems ? 'bg-cyan-500' : 'bg-gray-600'}`}></span>
              </span>
              <span className="text-xs font-bold tracking-wider uppercase">{currentItemCount} Itens Ativos</span>
            </div>

            {hasItems && onClearItems && (
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all duration-300"
                title="Descartar dados"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* Área de Drop Futurista */}
        <div className="px-8 pb-8">
          <label
            className={`
              relative flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer overflow-hidden
              ${disabled
                ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                : 'border-white/20 hover:border-cyan-400/50 hover:bg-cyan-500/5 group/drop'
              }
            `}
          >
            {/* Efeito de Scan no Hover */}
            {!disabled && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent translate-y-[-100%] group-hover/drop:translate-y-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />}

            <div className="z-10 flex flex-col items-center">
              {loading ? (
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className={`p-4 rounded-full transition-all duration-300 ${hasItems ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400 group-hover/drop:scale-110 group-hover/drop:text-cyan-300'}`}>
                  {hasItems ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 011.04-.207z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  )}
                </div>
              )}

              <div className="mt-4 text-center">
                <span className={`text-sm font-medium transition-colors ${error ? 'text-red-400' : 'text-gray-300'}`}>
                  {error || (loading ? 'Processando matrix...' : hasItems ? 'Arquivo carregado com sucesso' : 'Clique ou arraste sua planilha .xlsx')}
                </span>
                {fileName && !error && <p className="text-xs text-cyan-400 mt-1 font-mono tracking-tight">{fileName}</p>}
              </div>
            </div>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} disabled={disabled} />
          </label>
        </div>
      </section>

      <ConfirmDialog
        open={showConfirm}
        title="Formatar Sistema?"
        description="Isso limpará todos os dados da memória local. Tenha certeza que salvou o que precisava."
        confirmLabel="Sim, Limpar Tudo"
        cancelLabel="Cancelar"
        onConfirm={() => {
          onClearItems?.()
          setShowConfirm(false)
          setFileName(null)
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}

export default UploadSection