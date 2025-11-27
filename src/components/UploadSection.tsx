import React, { useState } from 'react'
import type { AlmoxItem } from '../types'
import { parseItemsFromFile } from '../utils/excel'
import ConfirmDialog from './ui/ConfirmDialog'

interface Props {
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
  // novo: quem chama decide o que limpar (itens, movimentos etc.)
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
        setError('Ops! Não achamos itens. Verifique os cabeçalhos da planilha.')
        return
      }
      onItemsLoaded(items)
    } catch (err) {
      console.error(err)
      setError('Erro ao ler o arquivo. Tem certeza que é um Excel válido?')
    } finally {
      setLoading(false)
    }
  }

  const handleClearClick = () => {
    if (!onClearItems) return
    setShowConfirm(true)
  }

  const handleConfirmClear = () => {
    // limpa estado local do componente
    setFileName(null)
    setError(null)
    setShowConfirm(false)
    // pede pro pai limpar os dados de fato (itens + movimentos, por ex.)
    onClearItems?.()
  }

  const handleCancelClear = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">1. Carregar Dados</h2>
            <p className="text-sm text-slate-500 mt-1">
              Importe sua planilha{' '}
              <span className="font-medium text-indigo-600">.xlsx</span> para começar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
              {currentItemCount} itens
            </span>

            {hasItems && (
              <button
                type="button"
                onClick={handleClearClick}
                className="inline-flex items-center justify-center p-1.5 rounded-full border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
                title="Limpar dados carregados desta planilha"
              >
                {/* ícone lixeira */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <label
          className={[
            'flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-2xl transition-all duration-300 group',
            disabled
              ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer',
          ].join(' ')}
        >
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full group-hover:scale-110 transition-transform">
            {loading ? (
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            )}
          </div>
          <div className="text-center">
            <span className="text-sm font-semibold text-slate-700 block">
              {loading
                ? 'Processando...'
                : hasItems
                ? 'Planilha carregada'
                : 'Clique para selecionar'}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">
              Planilhas Excel (.xlsx ou .xls)
            </span>
            {hasItems && (
              <span className="text-[10px] text-slate-400 block mt-1">
                Para trocar a planilha, limpe os dados usando o ícone de lixeira.
              </span>
            )}
          </div>
          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled}
          />
        </label>

        <div className="mt-4 min-h-[1.5rem]">
          {fileName && !error && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-green-500"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="truncate max-w-[200px] font-medium">{fileName}</span>
            </div>
          )}
          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-100">
              {error}
            </p>
          )}
          {!error && !fileName && (
            <p className="text-xs text-slate-400 text-center">
              Dica: Use os mesmos nomes de cabeçalho da planilha oficial.
            </p>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={showConfirm}
        title="Limpar dados desta planilha?"
        description={
          'Isso vai apagar os itens carregados e o histórico salvo neste navegador para esta planilha.\n\nVocê pode exportar os movimentos em Excel antes de limpar, se quiser manter um backup.'
        }
        confirmLabel="Sim, limpar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmClear}
        onCancel={handleCancelClear}
      />
    </>
  )
}

export default UploadSection
