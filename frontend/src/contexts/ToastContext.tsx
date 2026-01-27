import { createContext, useContext, useState, useCallback, ReactNode, SyntheticEvent } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastSeverity = 'success' | 'error' | 'warning' | 'info'

interface ToastState {
  open: boolean
  message: string
  severity: ToastSeverity
}

interface ToastContextType {
  showToast: (message: string, severity?: ToastSeverity) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    color: 'success.main' as const,
  },
  error: {
    icon: XCircle,
    color: 'error.main' as const,
  },
  warning: {
    icon: AlertTriangle,
    color: 'warning.main' as const,
  },
  info: {
    icon: Info,
    color: 'info.main' as const,
  },
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  })

  const showToast = useCallback((message: string, severity: ToastSeverity = 'info') => {
    setToast({ open: true, message, severity })
  }, [])

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success')
    },
    [showToast]
  )

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error')
    },
    [showToast]
  )

  const handleClose = useCallback((_?: SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setToast(prev => ({ ...prev, open: false }))
  }, [])

  const config = toastConfig[toast.severity]
  const Icon = config.icon

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: config.color,
            borderRadius: 2,
            boxShadow: 3,
            color: 'common.white',
            display: 'flex',
            gap: 1.5,
            maxWidth: 400,
            minWidth: 300,
            p: 2,
          }}
        >
          <Icon size={22} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{toast.message}</Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: 'rgba(255,255,255,0.8)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'common.white' },
            }}
          >
            <X size={18} />
          </IconButton>
        </Box>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
