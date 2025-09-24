export type TemplateItem = {
  id: string
  name: string
  workspaceId: string
  description: string
  message: string
  active: boolean
  updatedAt: string
  updatedBy: string
}

export type CreateTemplate = Pick<TemplateItem, 'name' | 'workspaceId' | 'description' | 'message' | 'active'>
export type UpdateTemplate = Omit<TemplateItem, 'id' | 'updatedAt' | 'updatedBy'> & { templateId: string }
