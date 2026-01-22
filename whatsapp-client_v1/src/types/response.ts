export type Response = {
  ok: boolean
}

export type SuccessDataResponse<T> = Response & {
  data: T
}

export type SuccessMessageResponse = Response & {
  message: string
}
