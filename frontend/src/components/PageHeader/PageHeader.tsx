import { ElementType } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon | ElementType;
  title: string;
  description: string;
}

export default function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>
          <Icon size={22} strokeWidth={2.5} />
        </Box>
        <Typography variant="h6" component="h1" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ pl: 4.5 }}>
        {description}
      </Typography>
    </Box>
  );
}
