import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes.constants';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.USERS]: 'Usuários',
  [ROUTES.PROFILE]: 'Meu Perfil',
  [ROUTES.SESSIONS]: 'Sessões',
  [ROUTES.AUDIT_LOGS]: 'Logs de Auditoria',
  [ROUTES.NOTIFICATIONS]: 'Notificações',
};

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  for (const segment of paths) {
    currentPath += `/${segment}`;
    const label = ROUTE_LABELS[currentPath];
    if (label) {
      breadcrumbs.push({ label, path: currentPath });
    }
  }

  return breadcrumbs;
}

export default function Breadcrumbs() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs
        separator={<ChevronRight size={16} />}
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
            mx: 0.5,
          },
        }}
      >
        <Link
          component={RouterLink}
          to={ROUTES.DASHBOARD}
          sx={{
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'none',
            },
          }}
        >
          <Typography variant="body2">Início</Typography>
        </Link>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast) {
            return (
              <Typography key={item.path} variant="body2" color="text.primary" fontWeight={500}>
                {item.label}
              </Typography>
            );
          }

          return (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'none',
                },
              }}
            >
              <Typography variant="body2">{item.label}</Typography>
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
