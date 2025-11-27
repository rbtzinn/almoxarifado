import React, { useState } from 'react'
import type { AlmoxItem } from '../types'
import { parseItemsFromFile } from '../utils/excel'

interface Props {
  onItemsLoaded: (items: AlmoxItem[]) => void
  currentItemCount: number
}

const UploadSection: React.FC<Props> = ({ onItemsLoaded, currentItemCount }) => {
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">1. Carregar Dados</h2>
          <p className="text-sm text-slate-500 mt-1">
            Importe sua planilha <span className="font-medium text-indigo-600">.xlsx</span> para começar.
          </p>
        </div>
        <span className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
          {currentItemCount} itens
        </span>
      </div>

      <label className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed rounded-2xl border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all duration-300 group">
        <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full group-hover:scale-110 transition-transform">
          {loading ? (
             <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>
        <div className="text-center">
          <span className="text-sm font-semibold text-slate-700 block">
            {loading ? 'Processando...' : 'Clique para selecionar'}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Planilhas Excel (.xlsx ou .xls)</span>
        </div>
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
      </label>

      <div className="mt-4 min-h-[1.5rem]">
        {fileName && !error && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-500">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
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
  )
}

export default UploadSection