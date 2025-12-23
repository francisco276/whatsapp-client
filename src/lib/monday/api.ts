import mondaySdk, { MondayClientSdk } from 'monday-sdk-js'
import { MondayQuery } from './query'
import { MondayRequest } from './request'
import { MONDAY_API_VERSION } from '../../config/constants'
import { MondayListenResponse } from '@/types/monday'
import { MondayMutation } from './mutations'

export class MondayApi {
  private monday: MondayClientSdk
  private requestor: MondayRequest
  public query: MondayQuery
  public mutation: MondayMutation

  constructor() {
    const config: { apiVersion: string, token?: string } = { apiVersion: MONDAY_API_VERSION }
    if (import.meta.env.MODE === 'development' && import.meta.env.VITE_MONDAY_API) {
      config.token = import.meta.env.VITE_MONDAY_API
    }

    this.monday = mondaySdk({...config })
    this.requestor = new MondayRequest(this.monday)
    this.query = new MondayQuery(this.requestor)
    this.mutation = new MondayMutation(this.requestor)
  }

  async listen<T>(event: 'settings', callback: (data: MondayListenResponse<T>) => void) {
    return this.monday.listen<T>(event, (res) => callback(res as MondayListenResponse<T>))
  }

  async getContext() {
    return this.monday.get('context')
  }

  async notice(message: string, type: string, timeout: number) {
    return this.monday.execute('notice', {
      message,
      type,
      timeout,
    })
  }

  async execute(event: string, params: { [id: string]: number | string }) {
    return this.monday.execute(event, params)
  }

  async errorNotice(message: string, timeout: number = 5000) {
    return this.notice(message, 'error', timeout)
  }

  async successNotice(message: string, timeout: number = 2000) {
    return this.notice(message, 'success', timeout)
  }
}
