import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { LayoutDashboard, BarChart3, Activity, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components';

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      icon: BarChart3,
      color: 'info' as const,
      title: 'Estatísticas',
      description: 'Sua visão geral do painel aparecerá aqui.',
    },
    {
      icon: Activity,
      color: 'success' as const,
      title: 'Atividade Recente',
      description: 'Sua atividade recente será exibida aqui.',
    },
    {
      icon: Bell,
      color: 'warning' as const,
      title: 'Notificações',
      description: 'Você não tem novas notificações.',
    },
  ];

  return (
    <Box>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description={`Bem-vindo de volta, ${user?.name}!`}
      />

      <Grid container spacing={3}>
        {cards.map(card => (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <Card
              elevation={0}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 3,
                height: '100%',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'grey.400',
                  boxShadow: 1,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: `${card.color}.lighter`,
                    borderRadius: 2,
                    color: `${card.color}.main`,
                    display: 'inline-flex',
                    justifyContent: 'center',
                    mb: 2,
                    p: 1.25,
                  }}
                >
                  <card.icon size={22} />
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
