import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Users, Search, Trash2, Pencil, UserX } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ROLES, Role } from '@/constants/roles.constants'
import { getInitials, formatDate } from '@/utils/string.utils'
import { useUsers } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader, Modal, ConfirmModal, DataTable, TableSkeleton, EmptyState, Pagination, type Column } from '@/components'
import type { User } from '@/types/auth'

interface EditUserForm {
  name: string
  role: Role
  isActive: boolean
}

export default function UsersPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user: currentUser } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const debouncedSearch = useDebounce(search, 300)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [toggleDialog, setToggleDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    role: ROLES.USER,
    isActive: true,
  })

  const {
    users,
    meta,
    isLoading,
    error,
    deleteUser,
    isDeleting,
    updateUser,
    isUpdating,
    toggleStatus,
    isTogglingStatus,
  } = useUsers({ page, limit, search: debouncedSearch || undefined, sortBy: 'name', sortOrder: 'asc' })

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleDeleteClick = (user: User) => {
    if (currentUser && user.id === currentUser.id) return
    setDeleteDialog({ open: true, user })
  }

  const handleDeleteConfirm = () => {
    if (!deleteDialog.user) return
    deleteUser(deleteDialog.user.id, {
      onSuccess: () => setDeleteDialog({ open: false, user: null }),
    })
  }

  const handleEditClick = (user: User) => {
    setEditForm({
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    })
    setEditDialog({ open: true, user })
  }

  const handleEditSave = () => {
    if (!editDialog.user) return
    updateUser(
      { id: editDialog.user.id, data: editForm },
      { onSuccess: () => setEditDialog({ open: false, user: null }) }
    )
  }

  const handleToggleStatus = (user: User) => {
    if (currentUser && user.id === currentUser.id) return
    if (user.isActive) {
      setToggleDialog({ open: true, user })
    } else {
      toggleStatus({ id: user.id, isActive: true })
    }
  }

  const handleToggleConfirm = () => {
    if (!toggleDialog.user) return
    toggleStatus(
      { id: toggleDialog.user.id, isActive: false },
      { onSuccess: () => setToggleDialog({ open: false, user: null }) }
    )
  }

  const columns: Column<User>[] = [
    {
      key: 'user',
      label: 'Usuário',
      render: user => (
        <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'common.white',
              fontSize: '0.8rem',
              fontWeight: 600,
              height: 36,
              width: 36,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {user.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: 'role',
      label: 'Função',
      render: user => {
        const isAdmin = user.role === ROLES.ADMIN
        return (
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: isAdmin ? 'warning.main' : 'secondary.main',
              borderRadius: 5,
              display: 'inline-flex',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'common.white',
                fontWeight: 500,
              }}
            >
              {isAdmin ? 'Admin' : 'Usuário'}
            </Typography>
          </Box>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: user => {
        const isCurrentUser = currentUser?.id === user.id
        return (
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}>
            <Tooltip
              title={
                isCurrentUser
                  ? 'Você não pode alterar sua própria conta'
                  : user.isActive
                    ? 'Clique para desativar'
                    : 'Clique para ativar'
              }
            >
              <span>
                <Switch
                  size="small"
                  checked={user.isActive}
                  disabled={isCurrentUser || isTogglingStatus}
                  onChange={() => handleToggleStatus(user)}
                  color="primary"
                />
              </span>
            </Tooltip>
            <Typography
              variant="caption"
              fontWeight={500}
              color={user.isActive ? 'primary.main' : 'text.disabled'}
            >
              {user.isActive ? 'Ativo' : 'Inativo'}
            </Typography>
          </Box>
        )
      },
    },
    {
      key: 'createdAt',
      label: 'Cadastro',
      render: user => (
        <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.8rem' }}>
          {formatDate(user.createdAt)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      width: 80,
      render: user => {
        const isCurrentUser = currentUser?.id === user.id
        return (
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              justifyContent: 'flex-end',
            }}
          >
            <Tooltip title="Editar">
              <IconButton
                size="small"
                onClick={e => {
                  e.stopPropagation()
                  handleEditClick(user)
                }}
                sx={{ color: 'text.secondary' }}
              >
                <Pencil size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isCurrentUser ? 'Você não pode excluir sua própria conta' : 'Excluir'}>
              <span>
                <IconButton
                  size="small"
                  disabled={isCurrentUser}
                  onClick={e => {
                    e.stopPropagation()
                    handleDeleteClick(user)
                  }}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
                    '&.Mui-disabled': { color: 'text.disabled' },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <Box>
        <PageHeader icon={Users} title="Usuários" description="Gerencie os usuários do sistema" />
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>
      </Box>
    )
  }

  const renderMobileCard = (user: User) => {
    const isCurrentUser = currentUser?.id === user.id

    return (
      <Box
        key={user.id}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          opacity: user.isActive ? 1 : 0.5,
          py: 2,
          '&:last-child': { borderBottom: 0 },
        }}
      >
        <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'action.selected',
              color: 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: 600,
              height: 40,
              width: 40,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 1, mb: 0.5 }}>
              <Typography variant="body2" fontWeight={500}>
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: user.role === ROLES.ADMIN ? 'warning.main' : 'secondary.main',
                  borderRadius: 0.5,
                  color: 'common.white',
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  px: 1,
                  py: 0.25,
                }}
              >
                {user.role === ROLES.ADMIN ? 'Admin' : 'Usuário'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1 }}>
              {user.email}
            </Typography>
            <Box sx={{ alignItems: 'center', display: 'flex', gap: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: user.isActive ? 'success.main' : 'text.disabled',
                  fontWeight: 500,
                }}
              >
                {user.isActive ? 'Ativo' : 'Inativo'}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {formatDate(user.createdAt)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleEditClick(user)}
              sx={{ color: 'text.secondary' }}
            >
              <Pencil size={16} />
            </IconButton>
            <IconButton
              size="small"
              disabled={isCurrentUser}
              onClick={() => handleDeleteClick(user)}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'error.main' },
                '&.Mui-disabled': { color: 'text.disabled' },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box>
      <PageHeader icon={Users} title="Usuários" description="Gerencie os usuários do sistema" />

      {error && (
        <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
          Erro ao carregar usuários. Verifique suas permissões.
        </Alert>
      )}

      <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <TextField
            fullWidth
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            size="small"
            sx={{ mb: 3 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {users.length === 0 ? (
            <EmptyState
              icon={UserX}
              title={debouncedSearch ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
              description={
                debouncedSearch
                  ? 'Tente buscar por outro termo'
                  : 'Adicione usuários para começar'
              }
            />
          ) : isMobile ? (
            <>
              <Box>{users.map(renderMobileCard)}</Box>
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={users}
                keyExtractor={user => user.id}
                rowSx={user => ({ opacity: user.isActive ? 1 : 0.5 })}
              />
              {meta && (
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  total={meta.total}
                  limit={meta.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmModal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteConfirm}
        title="Excluir Usuário"
        subtitle="Esta ação não pode ser desfeita"
        icon={Trash2}
        message={
          <>
            Tem certeza que deseja excluir o usuário <strong>{deleteDialog.user?.name}</strong>?
          </>
        }
        confirmText={isDeleting ? 'Excluindo...' : 'Excluir'}
        loading={isDeleting}
      />

      <ConfirmModal
        open={toggleDialog.open}
        onClose={() => setToggleDialog({ open: false, user: null })}
        onConfirm={handleToggleConfirm}
        title="Desativar Usuário"
        subtitle="O usuário perderá acesso ao sistema"
        icon={UserX}
        message={
          <>
            Tem certeza que deseja desativar o usuário <strong>{toggleDialog.user?.name}</strong>?
            Ele não poderá mais acessar o sistema.
          </>
        }
        confirmText={isTogglingStatus ? 'Desativando...' : 'Desativar'}
        loading={isTogglingStatus}
      />

      <Modal
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, user: null })}
        title="Editar Usuário"
        subtitle="Altere as informações do usuário"
        icon={Pencil}
        loading={isUpdating}
        onConfirm={handleEditSave}
        confirmText={isUpdating ? 'Salvando...' : 'Salvar'}
        confirmColor="primary"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            label="Nome"
            value={editForm.name}
            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth
            select
            label="Função"
            value={editForm.role}
            onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value as Role }))}
          >
            <MenuItem value={ROLES.USER}>Usuário</MenuItem>
            <MenuItem value={ROLES.ADMIN}>Administrador</MenuItem>
          </TextField>
          <Box
            sx={{
              bgcolor: editForm.isActive ? 'primary.lighter' : 'action.hover',
              borderRadius: 2,
              p: 2,
              transition: 'background-color 0.2s ease',
            }}
          >
            <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
                <Box
                  sx={{
                    alignItems: 'center',
                    bgcolor: editForm.isActive ? 'primary.main' : 'text.disabled',
                    borderRadius: 1,
                    color: 'common.white',
                    display: 'flex',
                    height: 36,
                    justifyContent: 'center',
                    transition: 'background-color 0.2s ease',
                    width: 36,
                  }}
                >
                  {editForm.isActive ? <Users size={18} /> : <Users size={18} />}
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {editForm.isActive ? 'Conta Ativa' : 'Conta Inativa'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {editForm.isActive
                      ? 'Usuário pode acessar o sistema'
                      : 'Usuário bloqueado do sistema'}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={editForm.isActive}
                onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                color="primary"
              />
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}
