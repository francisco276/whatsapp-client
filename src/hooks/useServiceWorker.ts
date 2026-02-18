import { useCallback } from 'react'

export const useServiceWorker = () => {
  const requestPermission = useCallback(async (): Promise<'granted' | 'denied' | 'unsupported'> => {
    if (!('Notification' in window)) return 'unsupported'

    if (Notification.permission === 'granted') return 'granted'
    if (Notification.permission === 'denied') return 'denied'

    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted' ? 'granted' : 'denied'
    } catch {
      return 'unsupported'
    }
  }, [])

  const sendNotification = useCallback(async (data: { chatId?: string, contactName?: string, preview?: string }) => {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const title = data.contactName || 'Nuevo mensaje de WhatsApp'
    const options: NotificationOptions = {
      body: data.preview || 'Has recibido un nuevo mensaje',
      icon: 'https://cdn.monday.com/images/favicon.ico',
      tag: 'whatsapp-message-' + (data.chatId || Date.now()),
      silent: false
    }

    try {
      new Notification(title, options)
    } catch (e) {
      console.log('[SW] Notification failed:', e)
    }
  }, [])

  return { sendNotification, requestPermission }
}
