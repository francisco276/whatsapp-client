import { type FastifyReply, type FastifyRequest } from 'fastify'
import { db } from '@/db'
import { messageCountersTable, workspacesTable } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

const SUPER_ADMIN_PASSWORD = 'Simpl1662!'

type CounterParams = {
  workspaceId: string
}

type SetLimitBody = {
  password: string
  messageLimit: number
}

function getCurrentMonthYear() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  }
}

export async function get(request: FastifyRequest<{ Params: CounterParams }>, reply: FastifyReply) {
  const { workspaceId } = request.params
  const { year, month } = getCurrentMonthYear()

  try {
    await db
      .insert(workspacesTable)
      .values({ id: workspaceId, name: workspaceId })
      .onConflictDoNothing()

    const [workspace] = await db
      .select({ messageLimit: workspacesTable.messageLimit })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1)

    const [counter] = await db
      .select()
      .from(messageCountersTable)
      .where(
        and(
          eq(messageCountersTable.workspaceId, workspaceId),
          eq(messageCountersTable.year, year),
          eq(messageCountersTable.month, month)
        )
      )
      .limit(1)

    return reply.send({
      success: true,
      data: {
        sentCount: counter?.sentCount ?? 0,
        messageLimit: workspace?.messageLimit ?? 1000,
        year,
        month
      }
    })
  } catch (error) {
    console.error('Error getting message counter:', error)
    return reply.status(500).send({
      success: false,
      message: 'Error getting message counter'
    })
  }
}

export async function increment(request: FastifyRequest<{ Params: CounterParams }>, reply: FastifyReply) {
  const { workspaceId } = request.params
  const { year, month } = getCurrentMonthYear()

  try {
    await db
      .insert(workspacesTable)
      .values({ id: workspaceId, name: workspaceId })
      .onConflictDoNothing()

    const [workspace] = await db
      .select({ messageLimit: workspacesTable.messageLimit })
      .from(workspacesTable)
      .where(eq(workspacesTable.id, workspaceId))
      .limit(1)

    const messageLimit = workspace?.messageLimit ?? 1000

    const [currentCounter] = await db
      .select()
      .from(messageCountersTable)
      .where(
        and(
          eq(messageCountersTable.workspaceId, workspaceId),
          eq(messageCountersTable.year, year),
          eq(messageCountersTable.month, month)
        )
      )
      .limit(1)

    if (currentCounter && currentCounter.sentCount >= messageLimit) {
      return reply.status(429).send({
        success: false,
        message: 'Límite de mensajes alcanzado para este mes',
        data: {
          sentCount: currentCounter.sentCount,
          messageLimit,
          year,
          month
        }
      })
    }

    const [counter] = await db
      .insert(messageCountersTable)
      .values({
        workspaceId,
        year,
        month,
        sentCount: 1
      })
      .onConflictDoUpdate({
        target: [messageCountersTable.workspaceId, messageCountersTable.year, messageCountersTable.month],
        set: {
          sentCount: sql`${messageCountersTable.sentCount} + 1`,
          updatedAt: new Date()
        }
      })
      .returning()

    return reply.send({
      success: true,
      data: {
        sentCount: counter?.sentCount ?? 1,
        messageLimit,
        year,
        month
      }
    })
  } catch (error) {
    console.error('Error incrementing message counter:', error)
    return reply.status(500).send({
      success: false,
      message: 'Error incrementing message counter'
    })
  }
}

export async function setLimit(request: FastifyRequest<{ Params: CounterParams, Body: SetLimitBody }>, reply: FastifyReply) {
  const { workspaceId } = request.params
  const { password, messageLimit } = request.body

  if (password !== SUPER_ADMIN_PASSWORD) {
    return reply.status(403).send({
      success: false,
      message: 'Contraseña incorrecta'
    })
  }

  if (!messageLimit || messageLimit < 0) {
    return reply.status(400).send({
      success: false,
      message: 'Límite de mensajes inválido'
    })
  }

  try {
    await db
      .insert(workspacesTable)
      .values({ id: workspaceId, name: workspaceId, messageLimit })
      .onConflictDoUpdate({
        target: workspacesTable.id,
        set: { messageLimit, updatedAt: new Date() }
      })

    return reply.send({
      success: true,
      data: { messageLimit }
    })
  } catch (error) {
    console.error('Error setting message limit:', error)
    return reply.status(500).send({
      success: false,
      message: 'Error al configurar el límite'
    })
  }
}
