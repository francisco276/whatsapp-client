import { MONDAY_API_VERSION } from "@/config/constants";
import { MondayRequest } from './request';
import { notification } from "./mutations/index";

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
}

