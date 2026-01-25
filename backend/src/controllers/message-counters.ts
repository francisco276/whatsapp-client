import { type FastifyReply, type FastifyRequest } from 'fastify'
import { db } from '@/db'
import { messageCountersTable } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'

type CounterParams = {
  workspaceId: string
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
