import React from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, description,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar',
  onConfirm, onCancel,
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-[#131b2e] border border-white/10 shadow-2xl p-6 transform scale-100 transition-all">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        {description && <p className="text-sm text-gray-400 whitespace-pre-line mb-6">{description}</p>}
        
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-lg shadow-rose-900/50 hover:bg-rose-500 transition-all active:scale-95">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
export default ConfirmDialog