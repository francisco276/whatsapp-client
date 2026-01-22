import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getConfigurationByUser, updateConfigurationByUser } from "@/lib/services/preferences"
import { useWorkspaceId } from "./useWorkspaceId"
import { UserPreferencesConfig } from "@/types"

export const usePreferences = ({ userId }: { userId: string }) => {
  const workspaceId = useWorkspaceId()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => getConfigurationByUser({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (config: UserPreferencesConfig) => updateConfigurationByUser({ workspaceId, userId, config }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', userId] })
    }
  })

  return {
    isLoading: isLoading || isPending,
    mutate,
    config: data
  }
}
