import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, PaginationParams, PaginatedResponse } from '@/services/users.service'
import { useToast } from '@/contexts/ToastContext'
import type { User } from '@/types/auth'

const USERS_QUERY_KEY = 'users'

export function useUsers(params?: PaginationParams) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const queryKey = [USERS_QUERY_KEY, params]

  const query = useQuery({
    queryKey,
    queryFn: () => usersService.getAll(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey)
      queryClient.setQueryData<PaginatedResponse<User>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.filter((u) => u.id !== id),
          meta: { ...old.meta, total: old.meta.total - 1 },
        }
      })
      return { previousData }
    },
    onSuccess: () => {
      showSuccess('Usuário excluído com sucesso!')
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousData)
      showError('Erro ao excluir usuário.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      usersService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey)
      queryClient.setQueryData<PaginatedResponse<User>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((u) => (u.id === id ? { ...u, ...data } : u)),
        }
      })
      return { previousData }
    },
    onSuccess: () => {
      showSuccess('Usuário atualizado com sucesso!')
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousData)
      showError('Erro ao atualizar usuário.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersService.update(id, { isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<PaginatedResponse<User>>(queryKey)
      queryClient.setQueryData<PaginatedResponse<User>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          data: old.data.map((u) => (u.id === id ? { ...u, isActive } : u)),
        }
      })
      return { previousData }
    },
    onSuccess: (updated) => {
      showSuccess(updated.isActive ? 'Usuário ativado!' : 'Usuário desativado!')
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousData)
      showError('Erro ao alterar status do usuário.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
    },
  })

  return {
    users: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    deleteUser: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateUser: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    toggleStatus: toggleStatusMutation.mutate,
    isTogglingStatus: toggleStatusMutation.isPending,
  }
}
