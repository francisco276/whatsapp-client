import { TemplateList } from "@/components/templetes/template-list"
import { useQuery } from "@tanstack/react-query"
import { useWorkspaceId } from "@/hooks/useWorkspaceId"
import * as TemplateService from '@/lib/services/templates'

export const Templates = () => {
  const workspaceId = useWorkspaceId()
  const { data } = useQuery({
    queryKey: [workspaceId,'TemplatesTableQuery'],
    queryFn: () => TemplateService.get({ workspaceId })
  })

  return <TemplateList templates={data || []} />
}
