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
    this.monday = mondaySdk({ apiVersion: MONDAY_API_VERSION, apiToken: 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ5MDc3NDM5NiwiYWFpIjoxMSwidWlkIjo2ODc0Mzc3MCwiaWFkIjoiMjAyNS0wMy0yNVQyMTowNDowNi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjA0NDE5OTIsInJnbiI6InVzZTEifQ.8OVSd52cG3-O--c0dfb4iAt6Le5b8ekbumKTPeR5Ne4' })
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
