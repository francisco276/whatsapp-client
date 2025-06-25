import { MondayRequest } from './request';
import { getPhoneColumnsByItemId, getUsers, getUsersWithName } from './queries'
import { User } from '@/types/monday'

/**
 * Stores methods to work with Monday GraphQL Queries
 */
export class MondayQuery {
  private requestor: MondayRequest;
  constructor(requestor: MondayRequest) {
    this.requestor = requestor
  }

  async getPhoneColumnsByIdsForItem<T>(itemId: string | number) {
    return this.requestor.request<T>(
      'getPhoneColumnsByItemId',
      getPhoneColumnsByItemId,
      {
        variables: {
          id: itemId.toString()
        }
      }
    )
  }

  async getUsers() {
    return this.requestor.request<{ users: User[] }>('getUsers', getUsers)
  }

  async getUsersWithName(name: string) {
    return this.requestor.request('getUsersWithName', getUsersWithName, {
      variables: {
        name
      }
    })
  }
}
