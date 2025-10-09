import { MondayApi } from "../lib/monday/api"
import type { AppContext } from "../types/monday"
import { useQuery } from '@tanstack/react-query'

const monday = new MondayApi()

export const useContext = () => {

  const query = useQuery<AppContext>({
    queryKey: ['getContext'],
    queryFn: () => getContext(),
    enabled: !!monday,
  })

  const getContext = async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const context: any = await monday.getContext()

    return {
        workspaceId: context?.data?.workspaceId,
        itemId: context?.data?.itemId,
        boardId: context?.data?.boardId,
        userId: context?.data?.user.id,
        theme: context?.data?.theme,
        version: `${context?.data?.appVersion.versionData.major}.${context?.data?.appVersion.versionData.minor}`,
        accountId: context?.data?.account.id
      } as AppContext
  }

  return query
}
