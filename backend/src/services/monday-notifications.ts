import { db } from '@/db'
import { mondayCredentialsTable, mondayUserTargetsTable, authorizationTable, contactTable, chatTable } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const MONDAY_API_URL = 'https://api.monday.com/v2'

const CREATE_NOTIFICATION_MUTATION = `
  mutation ($userId: ID!, $targetId: ID!, $message: String!) {
    create_notification(
      user_id: $userId,
      target_id: $targetId,
      text: $message,
      target_type: Project
    ) {
      text
    }
  }
`

interface MondayNotificationParams {
  workspaceId: string
  sessionId: string
  remoteJid: string
  fromMe: boolean
}

function formatPhoneNumber (jid: string): string {
  const raw = jid.split('@')[0]
  if (raw.length >= 10) {
    return '+' + raw
  }
  return raw
}

async function getContactName (sessionId: string, workspaceId: string, remoteJid: string): Promise<string> {
  const phoneNumber = formatPhoneNumber(remoteJid)

  try {
    const [contact] = await db
      .select()
      .from(contactTable)
      .where(and(
        eq(contactTable.id, remoteJid),
        eq(contactTable.sessionId, sessionId),
        eq(contactTable.workspaceId, workspaceId)
      ))
      .limit(1)

    if (contact !== undefined) {
      const name = contact.notify ?? contact.verifiedName ?? contact.name
      if (name) return `${name} (${phoneNumber})`
      return phoneNumber
    }

    const [chat] = await db
      .select()
      .from(chatTable)
      .where(and(
        eq(chatTable.id, remoteJid),
        eq(chatTable.sessionId, sessionId),
        eq(chatTable.workspaceId, workspaceId)
      ))
      .limit(1)

    if (chat !== undefined) {
      const name = chat.displayName ?? chat.name
      if (name) return `${name} (${phoneNumber})`
      return phoneNumber
    }
  } catch (e) {
    console.error('[MondayNotifications] Error getting contact name:', e)
  }

  return phoneNumber
}

async function sendMondayNotification (accessToken: string, userId: string, targetId: string, message: string): Promise<void> {
  try {
    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken
      },
      body: JSON.stringify({
        query: CREATE_NOTIFICATION_MUTATION,
        variables: {
          userId,
          targetId,
          message
        }
      })
    })

    const result = await response.json() as { errors?: Array<{ message: string }> }

    if (result.errors !== undefined && result.errors.length > 0) {
      console.error('[MondayNotifications] API error:', result.errors)
    }
  } catch (e) {
    console.error('[MondayNotifications] Failed to send notification:', e)
  }
}

export async function dispatchMondayNotifications (params: MondayNotificationParams): Promise<void> {
  const { workspaceId, sessionId, remoteJid, fromMe } = params

  if (fromMe) return

  try {
    const [credentials] = await db
      .select()
      .from(mondayCredentialsTable)
      .where(eq(mondayCredentialsTable.workspaceId, workspaceId))
      .limit(1)

    if (credentials === undefined) {
      return
    }

    const usersWithTargets = await db
      .select({
        userId: authorizationTable.userId,
        targetId: mondayUserTargetsTable.targetId
      })
      .from(authorizationTable)
      .innerJoin(
        mondayUserTargetsTable,
        and(
          eq(authorizationTable.workspaceId, mondayUserTargetsTable.workspaceId),
          eq(authorizationTable.userId, mondayUserTargetsTable.userId)
        )
      )
      .where(eq(authorizationTable.workspaceId, workspaceId))

    if (usersWithTargets.length === 0) {
      return
    }

    const contactName = await getContactName(sessionId, workspaceId, remoteJid)
    const message = `Nuevo mensaje de WhatsApp de: ${contactName}`

    const notifications = usersWithTargets.map(
      ({ userId, targetId }) => sendMondayNotification(credentials.accessToken, userId, targetId, message)
    )

    await Promise.allSettled(notifications)
  } catch (e) {
    console.error('[MondayNotifications] Dispatch error:', e)
  }
}

export async function registerMondayCredentials (workspaceId: string, accessToken: string): Promise<void> {
  await db
    .insert(mondayCredentialsTable)
    .values({ workspaceId, accessToken })
    .onConflictDoUpdate({
      target: [mondayCredentialsTable.workspaceId],
      set: { accessToken, updatedAt: new Date() }
    })
}

export async function registerMondayUserTarget (workspaceId: string, userId: string, targetId: string, targetType: string = 'Project'): Promise<void> {
  await db
    .insert(mondayUserTargetsTable)
    .values({ workspaceId, userId, targetId, targetType })
    .onConflictDoUpdate({
      target: [mondayUserTargetsTable.workspaceId, mondayUserTargetsTable.userId],
      set: { targetId, targetType, updatedAt: new Date() }
    })
}
