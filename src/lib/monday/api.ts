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
    this.monday = mondaySdk({ apiVersion: MONDAY_API_VERSION })
    this.requestor = new MondayRequest(this.monday)
    this.query = new MondayQuery(this.requestor)
    this.mutation = new MondayMutation(this.requestor)
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

  async errorNotice(message: string, timeout: number = 5000) {
    return this.notice(message, 'error', timeout)
  }

  async successNotice(message: string, timeout: number = 2000) {
    return this.notice(message, 'success', timeout)
  }
}
