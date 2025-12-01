import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react'
import { AppAlert } from '../components/ui/AppAlert'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

interface ToastOptions {
  variant?: ToastVariant
  title?: string
  message: string
}

interface Toast extends ToastOptions {
  id: number
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = Date.now() + Math.random()
      const newToast: Toast = {
        id,
        variant: options.variant ?? 'info',
        title: options.title,
        message: options.message,
      }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container no canto inferior direito */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 w-[280px] max-w-[calc(100%-2rem)]">
        {toasts.map((toast) => (
          <AppAlert
            key={toast.id}
            variant={toast.variant}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return ctx
}
