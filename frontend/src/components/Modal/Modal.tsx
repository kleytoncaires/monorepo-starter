import { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import { X, LucideIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  confirmColor?: 'primary' | 'error' | 'secondary';
  cancelText?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  maxWidth = 'xs',
  loading = false,
  onConfirm,
  confirmText = 'Confirmar',
  confirmColor = 'primary',
  cancelText = 'Cancelar',
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Fade }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: 2,
            borderTop: 4,
            borderColor: 'primary.main',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'flex-start',
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 1.5 }}>
          {Icon && (
            <Box sx={{ color: 'primary.main', display: 'flex', mt: 0.25 }}>
              <Icon size={20} strokeWidth={2.5} />
            </Box>
          )}
          <Box>
            <Typography fontWeight={600} sx={{ lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            mt: -0.5,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3 }}>{children}</DialogContent>

      {(actions || onConfirm) && (
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1.5,
            justifyContent: 'flex-end',
            px: 3,
            py: 2.5,
          }}
        >
          {actions || (
            <>
              <Button
                onClick={onClose}
                disabled={loading}
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                variant="contained"
                color={confirmColor}
                disabled={loading}
                disableElevation
                sx={{ fontWeight: 500, px: 3 }}
              >
                {loading ? <CircularProgress size={18} color="inherit" /> : confirmText}
              </Button>
            </>
          )}
        </Box>
      )}
    </Dialog>
  );
}

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  message: ReactNode;
  icon?: LucideIcon;
  confirmText?: string;
  confirmColor?: 'primary' | 'error';
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  subtitle,
  message,
  icon: Icon,
  confirmText = 'Confirmar',
  confirmColor = 'error',
  loading = false,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slots={{ transition: Fade }}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            borderRadius: 2,
            borderTop: 4,
            borderColor: 'error.main',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden',
          },
        },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      }}
    >
      <Box
        sx={{
          alignItems: 'flex-start',
          bgcolor: 'action.hover',
          display: 'flex',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 1.5 }}>
          {Icon && (
            <Box sx={{ color: 'error.main', display: 'flex', mt: 0.25 }}>
              <Icon size={20} strokeWidth={2.5} />
            </Box>
          )}
          <Box>
            <Typography fontWeight={600} sx={{ lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            mt: -0.5,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1.5,
          justifyContent: 'flex-end',
          px: 3,
          py: 2.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          disableElevation
          sx={{ fontWeight: 500, px: 3 }}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : confirmText}
        </Button>
      </Box>
    </Dialog>
  );
}
