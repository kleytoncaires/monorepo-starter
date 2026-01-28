import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        py: 8,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'grey.100',
          borderRadius: '50%',
          color: 'grey.400',
          display: 'flex',
          height: 64,
          justifyContent: 'center',
          mb: 2,
          width: 64,
        }}
      >
        <Icon size={28} />
      </Box>
      <Typography fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.disabled">
          {description}
        </Typography>
      )}
    </Box>
  );
}
