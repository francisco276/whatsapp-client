import { SocketClient } from "../socket"
import type { SocketSuccessResponse, SocketErrorResponse, QrUpdateData, SessionAddedData } from '../../types/socket'

export const handlerUpdateQrCode = (socket: SocketClient, callback: (qr: string) => void | Promise<void>) => {
  socket.on('qrcode.updated', (event) => {
    const { data: eventData } = event
    if (eventData.status === 'success') {
      const { data } = event as SocketSuccessResponse
      const { qr } = data.data as QrUpdateData
      callback(qr)
    }
  })
}

export const handlerConnection = (socket: SocketClient, callback: (params: { message: string, error?: boolean, insert?: boolean }) => void | Promise<void>) => {
  socket.on('connection.update', (event) => {
    const { data: eventData } = event
    if (eventData.status === 'error') {
      const { data } = event as SocketErrorResponse
      callback({ error: true, message: data.message })
    } else {
      const { data } = event as SocketSuccessResponse
      const { insert } = data.data as SessionAddedData
      callback({ message: 'Connection success', insert })
    }
  })
}
