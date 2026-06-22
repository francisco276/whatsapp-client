const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
const NOTIFICATION_ICON = 'https://cdn.monday.com/images/favicon.ico'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  const { type, data } = event.data || {}

  if (type === 'NEW_MESSAGE') {
    const title = data?.contactName || 'Nuevo mensaje de WhatsApp'
    const body = data?.preview || 'Has recibido un nuevo mensaje'

    self.registration.showNotification(title, {
      body,
      icon: NOTIFICATION_ICON,
      badge: NOTIFICATION_ICON,
      tag: 'whatsapp-message-' + (data?.chatId || Date.now()),
      renotify: true,
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200]
    })
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus()
      }
    })
  )
})
