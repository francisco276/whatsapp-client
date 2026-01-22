import { ColumnValue } from '@/types/monday'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import parsePhoneNumber from "libphonenumber-js"

export function getPhoneColumnsByColumnId({ columnValues, columnId }: { columnValues: ColumnValue[], columnId: string }) {
  const column  = columnValues.find(column => column.id === columnId)

  if (column === undefined) return
  console.log({ column }, 'Column Value Type')

  if (column.__typename === 'PhoneValue') {
    const { phone, country_short_name } = column
    return { phone, country_short_name }
  }

  if (column.__typename === 'MirrorValue') {
    const { display_value } = column
    const formatedPhone = display_value.startsWith('+') ? display_value : `+${display_value}`
    const phoneData = parsePhoneNumber(formatedPhone)
    console.log({ phoneData }, 'Parsed Phone Data')
    if (phoneData === undefined) return
    return { phone: phoneData.number, country_short_name: phoneData?.country }
  }

  return
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
