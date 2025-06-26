/* eslint-disable @typescript-eslint/no-explicit-any */

import { CountryCode } from "libphonenumber-js"

export type AppContext = {
  workspaceId: string
  itemId: string
  userId: string
  boardId: string
  idleItemId: string
  userPunchesBoardID: string
  version: string
  theme: string
  accountId: string
}

export type MondayError = {
  message: string
  locations: {
    line: number
    column: number
  }[]
  path: string[]
  extensions: {
    code: string
    error_data: object
    status_code: number
  }
}

export type MondayResponse<T> = {
  data: {
    [key: string]: any
  } | T
  errors: MondayError[]
  account_id: string
}

export type AppSettings = {
  phoneColumnId: string
}

export type ColumnValue = {
  id: string
  value: string
  country_short_name?: CountryCode
  phone?: string
}

export type MondayListenResponse<T> = {
  data: T,
  method: string
  requestId: string
  type: string
}

export type SingleSettings = {
  phoneColumnId: null | string
}

export type User = {
  email: string
  id: string,
  name: string,
  photo_thumb: string
}
