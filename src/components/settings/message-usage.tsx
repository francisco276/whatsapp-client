import { useEffect } from 'react'
import { Loader } from '@vibe/core'
import { SettingBox } from './setting-box'
import { useMessageCounterStore } from '@/stores/messageCounterStore'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useBoardId } from '@/hooks/useBoardId'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export const MessageUsage = () => {
  const workspaceId = useWorkspaceId()
  const boardId = useBoardId()
  const { sentCount, messageLimit, year, month, isLoading, setWorkspaceId, fetchCount } = useMessageCounterStore()

  useEffect(() => {
    const counterId = boardId || workspaceId
    if (counterId) {
      setWorkspaceId(counterId)
      fetchCount()
    }
  }, [boardId, workspaceId, setWorkspaceId, fetchCount])

  const limit = messageLimit || 1000
  const percentage = Math.min((sentCount / limit) * 100, 100)
  const monthName = MONTH_NAMES[(month || 1) - 1]
  const periodStart = `${monthName.toLowerCase().slice(0, 3)} 1, ${year}`
  const nextMonth = month === 12 ? 1 : (month || 1) + 1
  const nextYear = month === 12 ? (year || 2026) + 1 : year
  const nextMonthName = MONTH_NAMES[nextMonth - 1]
  const periodEnd = `${nextMonthName.toLowerCase().slice(0, 3)} 1, ${nextYear}`

  const getBarColor = () => {
    if (percentage >= 90) return '#d83a52'
    if (percentage >= 70) return '#fdab3d'
    return '#00ca72'
  }

  return (
    <SettingBox title="Uso de mensajes">
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <Loader size={24} />
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <p style={{ margin: 0, color: '#676879', fontSize: 13 }}>
              {periodStart} - {periodEnd}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#323338' }}>
              {sentCount.toLocaleString()}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: '#676879' }}>
              / {limit.toLocaleString()} mensajes enviados
            </p>
          </div>

          <div style={{
            width: '100%',
            height: 8,
            backgroundColor: '#e6e9ef',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: getBarColor(),
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>

          <p style={{ margin: 0, fontSize: 12, color: '#676879' }}>
            {limit.toLocaleString()} mensajes por mes. El contador se reinicia el 1 de {nextMonthName.toLowerCase()}.
          </p>
        </div>
      )}
    </SettingBox>
  )
}
