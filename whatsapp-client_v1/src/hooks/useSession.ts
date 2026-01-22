import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSessions, deleteSession } from '@/lib/services/sessions'
import { getProfile } from '@/lib/services/profile'

type UseSessionsProps = {
  workspaceId: string
}

export const useSessions = ({ workspaceId }: UseSessionsProps) => {
  return useQuery({
    queryKey: ['getSessions', workspaceId],
    queryFn: () => getSessions({ workspaceId }),
    enabled: !!workspaceId,
  })
}

type UseSessionInformationProps = {
  workspaceId: string
  sessionId: string
}

export const useSessionInformation = ({ workspaceId, sessionId }: UseSessionInformationProps) => {
  return useQuery({
    queryKey: [sessionId],
    queryFn: () => getProfile({ workspaceId, sessionId }),
    enabled: !!workspaceId && !!sessionId
  })
}

export const useDeleteSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({ queryKey: ['getSessions', workspaceId] })
    }
  })
}
