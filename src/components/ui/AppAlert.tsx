import React from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react'

type Variant = 'success' | 'error' | 'info' | 'warning'

interface AppAlertProps {
  variant?: Variant
  title?: string
  message: string
  onClose?: () => void
}

const baseClasses =
  'flex items-start gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm shadow-sm border'

// Cores adaptadas para a marca PE
const variantClasses: Record<Variant, string> = {
  success:
    'bg-[#89D700]/10 dark:bg-[#89D700]/20 border-[#89D700]/30 dark:border-[#89D700]/50 text-[#4a7500] dark:text-[#89D700]',
  error:
    'bg-[#E30613]/10 dark:bg-[#E30613]/20 border-[#E30613]/30 dark:border-[#E30613]/50 text-[#9e040d] dark:text-red-200',
  info:
    'bg-[#00C3E3]/10 dark:bg-[#00C3E3]/20 border-[#00C3E3]/30 dark:border-[#00C3E3]/50 text-[#006b7d] dark:text-[#00C3E3]',
  warning:
    'bg-[#FFCD00]/10 dark:bg-[#FFCD00]/20 border-[#FFCD00]/30 dark:border-[#FFCD00]/50 text-[#997b00] dark:text-[#FFCD00]',
}

const iconMap: Record<Variant, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
}

export const AppAlert: React.FC<AppAlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
}) => {
  return (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="mt-0.5">{iconMap[variant]}</div>

      <div className="flex-1">
        {title && (
          <p className="font-semibold leading-snug mb-0.5">{title}</p>
        )}
        <p className="leading-snug">{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 mt-0.5 inline-flex items-center justify-center rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}