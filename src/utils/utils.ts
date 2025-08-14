import { ColumnValue } from '@/types/monday'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function getColumnById({ columnValues, columnId }: { columnValues: ColumnValue[], columnId: string }) {
  return columnValues.find(column => column.id === columnId)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
