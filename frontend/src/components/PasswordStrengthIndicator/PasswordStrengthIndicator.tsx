import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'
import { Check, X } from 'lucide-react'
import { PASSWORD_PATTERNS, PASSWORD_MIN_LENGTH } from '@/constants/validation.constants'

import type { SxProps, Theme } from '@mui/material/styles'

interface PasswordStrengthIndicatorProps {
  password: string
  sx?: SxProps<Theme>
}

interface Requirement {
  label: string
  met: boolean
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: `${PASSWORD_MIN_LENGTH}+ caracteres`, met: password.length >= PASSWORD_MIN_LENGTH },
    { label: 'Maiúscula', met: PASSWORD_PATTERNS.uppercase.test(password) },
    { label: 'Minúscula', met: PASSWORD_PATTERNS.lowercase.test(password) },
    { label: 'Número', met: PASSWORD_PATTERNS.number.test(password) },
    { label: 'Especial', met: PASSWORD_PATTERNS.special.test(password) },
  ]
}

function getStrengthColor(score: number): 'error' | 'warning' | 'success' {
  if (score <= 2) return 'error'
  if (score <= 4) return 'warning'
  return 'success'
}

export default function PasswordStrengthIndicator({ password, sx }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const requirements = getRequirements(password)
  const score = requirements.filter(r => r.met).length
  const progress = (score / 5) * 100
  const color = getStrengthColor(score)

  return (
    <Box sx={{ mt: 1.5, ...sx }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={color}
        sx={{
          bgcolor: 'grey.200',
          borderRadius: 1,
          height: 6,
          mb: 1.5,
        }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {requirements.map((req, i) => (
          <Box key={i} sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
            <Box sx={{ color: req.met ? 'success.main' : 'grey.400', display: 'flex' }}>
              {req.met ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
            </Box>
            <Typography
              variant="caption"
              color={req.met ? 'text.primary' : 'text.disabled'}
              sx={{ fontSize: '0.75rem' }}
            >
              {req.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
