import mondaySdk, { MondayClientSdk } from 'monday-sdk-js'
import { MONDAY_API_VERSION } from '../../config/constants'

export class MondayApi {
  private monday: MondayClientSdk

  constructor() {
    this.monday = mondaySdk({ apiVersion: MONDAY_API_VERSION })
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
