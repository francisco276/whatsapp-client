import { MONDAY_API_VERSION } from "@/config/constants";
import { MondayRequest } from './request';
import { notification, changeColumnValue, createUpdate } from "./mutations/index";

export class MondayMutation {
  private requestor: MondayRequest
  constructor(requestor: MondayRequest) {
    this.requestor = requestor
  }

  async createNotification(userId: string, targetId: string, message: string) {
    return this.requestor.request(
      'createNotification',
      notification,
      {
        apiVersion: MONDAY_API_VERSION,
        variables: {
          userId,
          targetId,
          message
        }
      }
    )
  }

  async changeColumnValue(boardId: string, itemId: string, columnId: string, value: string) {
    return this.requestor.request(
      'changeColumnValue',
      changeColumnValue,
      {
        apiVersion: MONDAY_API_VERSION,
        variables: {
          boardId,
          itemId,
          columnId,
          value
        }
      }
    )
  }

  async createUpdate(itemId: string, body: string) {
    return this.requestor.request(
      'createUpdate',
      createUpdate,
      {
        apiVersion: MONDAY_API_VERSION,
        variables: {
          itemId,
          body
        }
      }
    )
  }
}

