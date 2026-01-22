import { MondayClientSdk } from 'monday-sdk-js'
import { ERROR_SERVER_ERROR } from '@/config/errors'
import { API_TIMEOUT } from '@/config/constants'
import { PublicError } from '@/errors/PublicError'
import { MondayResponse } from '@/types/monday'

/**
 * Requestor service for monday API
 */
export class MondayRequest {
  private monday: MondayClientSdk;
  constructor(monday: MondayClientSdk) {
    this.monday = monday;
  }


  getErrorMessage(errors: string[]) {
    return `${ERROR_SERVER_ERROR} Details: ${errors.join('; ')}`
  }

  async request<T>(label: string, query: string, options?: object) {
    const response = await Promise.race([
      this.monday.api(query, options),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new PublicError(`Request ${label} took too long.`)),
          API_TIMEOUT
        )
      )
    ]) as MondayResponse<T>

    if (response.errors?.length) {
      throw new PublicError(
        this.getErrorMessage(response.errors.map((error) => error.message))
      )
    }

    return response
  }
}
