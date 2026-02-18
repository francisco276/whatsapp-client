import { useEffect, useRef, useCallback } from 'react'

export const useServiceWorker = () => {
  const readyRef = useRef<boolean>(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[SW] Service Workers not supported')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        return navigator.serviceWorker.ready
      })
      .then(() => {
        readyRef.current = true
        console.log('[SW] Service Worker ready')
      })
      .catch((error) => {
        console.log('[SW] Service Worker registration failed:', error.message)
      })
  }, [])

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
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

    if (readyRef.current && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'NEW_MESSAGE',
        data
      })
    } else {
      try {
        new Notification(title, options)
      } catch (e) {
        console.log('[SW] Notification failed:', e)
      }
    }
  }, [])

  return { sendNotification, requestPermission }
}
