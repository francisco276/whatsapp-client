import { MondayRequest } from './request';
import { getPhoneColumnsByItemId, getAllColumnValuesFromItem, getUsers, getUsersWithName, getBoardColumns, getItemName, getBoardItemsWithPhoneColumn } from './queries'
import { User, ColumnValue, BoardColumn } from '@/types/monday'

/**
 * Stores methods to work with Monday GraphQL Queries
 */
export class MondayQuery {
  private requestor: MondayRequest;
  constructor(requestor: MondayRequest) {
    this.requestor = requestor
  }

  async getPhoneColumnsByIdsForItem<T>({ itemId, columnId }: { itemId: string | number, columnId: string }) {
    return this.requestor.request<T>(
      'getPhoneColumnsByItemId',
      getPhoneColumnsByItemId,
      {
        variables: {
         itemId,
         columnId
        }
      }
    )
  }

  async getAllColumnValuesFromItem({ itemId }: { itemId: string | number }) {
    return this.requestor.request<{ items: { column_values: ColumnValue[] }[] }>(
      'getAllColumnValuesFromItem',
      getAllColumnValuesFromItem,
      {
        variables: {
         itemId
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

  async getBoardColumns(boardId: string) {
    return this.requestor.request<{ boards: { columns: BoardColumn[] }[] }>(
      'getBoardColumns',
      getBoardColumns,
      {
        variables: {
          boardId
        }
      }
    )
  }

  async getItemName(itemId: string | number) {
    return this.requestor.request<{ items: { name: string }[] }>(
      'getItemName',
      getItemName,
      {
        variables: {
          itemId
        }
      }
    )
  }

  async getBoardItemsWithPhoneColumn(boardId: string | number, columnId: string) {
    return this.requestor.request<{
      boards: {
        items_page: {
          items: {
            id: string
            name: string
            column_values: { id: string; text: string; value: string; phone?: string }[]
          }[]
        }
      }[]
    }>(
      'getBoardItemsWithPhoneColumn',
      getBoardItemsWithPhoneColumn,
      { variables: { boardId, columnId } }
    )
  }
}
