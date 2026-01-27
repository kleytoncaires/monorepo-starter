import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import { AlignJustify, LayoutDashboard, Users, User, LogOut, Sun, Moon, FileText, Smartphone, Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ROLES } from '@/constants/roles.constants';
import { ROUTES } from '@/constants/routes.constants';
import { Breadcrumbs } from '@/components';
import { notificationsService, Notification } from '@/services/notifications.service';
import { getUploadUrl } from '@/services/api';
import { formatDate } from '@/utils/string.utils';

const NOTIFICATION_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const NOTIFICATION_COLORS = {
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
};

const DRAWER_WIDTH = 260;

const menuItems = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { path: ROUTES.USERS, label: 'Usuários', icon: Users, adminOnly: true },
  { path: ROUTES.AUDIT_LOGS, label: 'Auditoria', icon: FileText, adminOnly: true },
  { path: ROUTES.SESSIONS, label: 'Sessões', icon: Smartphone },
  { path: ROUTES.NOTIFICATIONS, label: 'Notificações', icon: Bell },
  { path: ROUTES.PROFILE, label: 'Meu Perfil', icon: User },
];

const drawerPaperStyles = {
  backgroundColor: 'secondary.dark',
  borderRight: 'none',
  boxSizing: 'border-box',
  width: DRAWER_WIDTH,
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 30000,
  });

  const { data: recentNotifications } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsService.getAll({ page: 1, limit: 5 }),
    enabled: Boolean(notifAnchorEl),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const handleNotifOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleNotifClick = (notif: Notification) => {
    if (!notif.read) {
      markAsReadMutation.mutate(notif.id);
    }
    handleNotifClose();
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const visibleMenuItems = menuItems.filter(
    item => !item.adminOnly || user?.role === ROLES.ADMIN
  );

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          alignItems: 'center',
          display: 'flex',
          height: 64,
          px: 2.5,
        }}
      >
        <img src="/logo.svg" alt="Logo" style={{ height: 28, filter: 'brightness(0) invert(1)' }} />
      </Box>

      <Box sx={{ flex: 1, px: 2, py: 3 }}>
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            mb: 1.5,
            px: 1,
            textTransform: 'uppercase',
          }}
        >
          Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {visibleMenuItems.map(item => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.25,
                    transition: 'all 0.15s ease',
                    ...(isSelected
                      ? {
                          backgroundColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                          },
                        }
                      : {
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.08)',
                          },
                        }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isSelected ? 'common.white' : 'rgba(255,255,255,0.7)',
                      minWidth: 40,
                    }}
                  >
                    <item.icon size={20} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        sx: {
                          color: isSelected ? 'common.white' : 'rgba(255,255,255,0.8)',
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                        },
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'secondary.dark',
          ml: { sm: `${DRAWER_WIDTH}px` },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          zIndex: theme => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ color: 'common.white', display: { sm: 'none' }, mr: 1 }}
          >
            <AlignJustify size={24} />
          </IconButton>
          <Box sx={{ alignItems: 'center', display: { xs: 'flex', sm: 'none' } }}>
            <img src="/logo.svg" alt="Logo" style={{ height: 24, filter: 'brightness(0) invert(1)' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
            <IconButton
              onClick={toggleTheme}
              sx={{ color: 'common.white' }}
              title={mode === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {mode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
            <IconButton
              onClick={handleNotifOpen}
              sx={{ color: 'common.white' }}
              title="Notificações"
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.65rem',
                    height: 18,
                    minWidth: 18,
                  },
                }}
              >
                <Bell size={20} />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notifAnchorEl)}
              anchorEl={notifAnchorEl}
              onClose={handleNotifClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    mt: 1,
                    width: 360,
                  },
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography fontWeight={600}>Notificações</Typography>
              </Box>
              <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
                {!recentNotifications?.data?.length ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma notificação
                    </Typography>
                  </Box>
                ) : (
                  recentNotifications.data.map((notif: Notification) => {
                    const NotifIcon = NOTIFICATION_ICONS[notif.type as keyof typeof NOTIFICATION_ICONS] || Info;
                    const notifColor = NOTIFICATION_COLORS[notif.type as keyof typeof NOTIFICATION_COLORS] || 'info.main';
                    return (
                      <Box
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        sx={{
                          alignItems: 'flex-start',
                          bgcolor: notif.read ? 'transparent' : 'action.hover',
                          borderBottom: 1,
                          borderColor: 'divider',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: 1.5,
                          p: 2,
                          '&:hover': { bgcolor: 'action.selected' },
                          '&:last-child': { borderBottom: 0 },
                        }}
                      >
                        <Box sx={{ color: notifColor, mt: 0.25 }}>
                          <NotifIcon size={18} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={notif.read ? 400 : 600} noWrap>
                            {notif.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                            {notif.message}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDate(notif.createdAt)}
                          </Typography>
                        </Box>
                        {!notif.read && (
                          <Box sx={{ bgcolor: 'primary.main', borderRadius: '50%', height: 8, mt: 0.5, width: 8 }} />
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
              <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1 }}>
                <Button
                  fullWidth
                  size="small"
                  onClick={() => {
                    handleNotifClose();
                    navigate(ROUTES.NOTIFICATIONS);
                  }}
                >
                  Ver todas
                </Button>
              </Box>
            </Popover>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography sx={{ color: 'common.white', fontSize: '0.875rem', fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                {user?.role === ROLES.ADMIN ? 'Administrador' : 'Usuário'}
              </Typography>
            </Box>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                p: 0.5,
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
            >
              <Avatar
                alt={user?.name}
                src={getUploadUrl(user?.avatarUrl)}
                sx={{
                  backgroundColor: 'primary.main',
                  fontWeight: 600,
                  height: 40,
                  width: 40,
                }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  minWidth: 200,
                  mt: 1,
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate(ROUTES.PROFILE);
              }}
              sx={{ gap: 1.5, py: 1.25 }}
            >
              <User size={18} />
              <Typography sx={{ fontSize: '0.875rem' }}>Meu Perfil</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                navigate(ROUTES.SESSIONS);
              }}
              sx={{ gap: 1.5, py: 1.25 }}
            >
              <Smartphone size={18} />
              <Typography sx={{ fontSize: '0.875rem' }}>Sessões</Typography>
            </MenuItem>
            {user?.role === ROLES.ADMIN && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate(ROUTES.AUDIT_LOGS);
                }}
                sx={{ gap: 1.5, py: 1.25 }}
              >
                <FileText size={18} />
                <Typography sx={{ fontSize: '0.875rem' }}>Auditoria</Typography>
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: 'error.main',
                gap: 1.5,
                py: 1.25,
                '&:hover': {
                  backgroundColor: 'error.light',
                },
              }}
            >
              <LogOut size={18} />
              <Typography sx={{ fontSize: '0.875rem' }}>Sair</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ flexShrink: { sm: 0 }, width: { sm: DRAWER_WIDTH } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': drawerPaperStyles,
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': drawerPaperStyles,
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh',
          mt: 8,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Breadcrumbs />
          <Box sx={{ flex: 1 }}>
            <Outlet />
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 4, pt: 3, textAlign: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                cursor: 'pointer',
                fontSize: '0.75rem',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
              onClick={() => window.open('https://wa.me/5531999748338', '_blank')}
            >
              Desenvolvido por Caires Digital
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
