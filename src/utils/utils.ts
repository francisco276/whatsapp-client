import { ColumnValue } from '@/types/monday'

export function getColumnById({ columnValues, columnId }: { columnValues: ColumnValue[], columnId: string }) {
  return columnValues.find(column => column.id === columnId)
}
