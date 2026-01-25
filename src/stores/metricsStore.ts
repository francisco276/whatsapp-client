import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DailyMetric {
  date: string
  sent: number
  received: number
  responseTimeSum: number
  responseCount: number
}

interface MetricsState {
  dailyMetrics: DailyMetric[]
  totalSent: number
  totalReceived: number
  avgResponseTime: number
  recordMessageSent: () => void
  recordMessageReceived: (responseTimeMs?: number) => void
  getMetricsForPeriod: (days: number) => DailyMetric[]
  getTodayMetrics: () => DailyMetric | undefined
  getWeeklyStats: () => { sent: number; received: number; avgResponseTime: number }
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set, get) => ({
      dailyMetrics: [],
      totalSent: 0,
      totalReceived: 0,
      avgResponseTime: 0,

      recordMessageSent: () => {
        const today = getTodayDate()
        set((state) => {
          const existingIndex = state.dailyMetrics.findIndex(m => m.date === today)
          let newMetrics = [...state.dailyMetrics]
          
          if (existingIndex >= 0) {
            newMetrics[existingIndex] = {
              ...newMetrics[existingIndex],
              sent: newMetrics[existingIndex].sent + 1
            }
          } else {
            newMetrics.push({
              date: today,
              sent: 1,
              received: 0,
              responseTimeSum: 0,
              responseCount: 0
            })
          }
          
          newMetrics = newMetrics.slice(-30)
          
          return {
            dailyMetrics: newMetrics,
            totalSent: state.totalSent + 1
          }
        })
      },

      recordMessageReceived: (responseTimeMs) => {
        const today = getTodayDate()
        set((state) => {
          const existingIndex = state.dailyMetrics.findIndex(m => m.date === today)
          let newMetrics = [...state.dailyMetrics]
          
          if (existingIndex >= 0) {
            const metric = newMetrics[existingIndex]
            newMetrics[existingIndex] = {
              ...metric,
              received: metric.received + 1,
              responseTimeSum: responseTimeMs ? metric.responseTimeSum + responseTimeMs : metric.responseTimeSum,
              responseCount: responseTimeMs ? metric.responseCount + 1 : metric.responseCount
            }
          } else {
            newMetrics.push({
              date: today,
              sent: 0,
              received: 1,
              responseTimeSum: responseTimeMs || 0,
              responseCount: responseTimeMs ? 1 : 0
            })
          }
          
          newMetrics = newMetrics.slice(-30)
          
          const totalResponseTime = newMetrics.reduce((sum, m) => sum + m.responseTimeSum, 0)
          const totalResponseCount = newMetrics.reduce((sum, m) => sum + m.responseCount, 0)
          
          return {
            dailyMetrics: newMetrics,
            totalReceived: state.totalReceived + 1,
            avgResponseTime: totalResponseCount > 0 ? totalResponseTime / totalResponseCount : 0
          }
        })
      },

      getMetricsForPeriod: (days) => {
        const metrics = get().dailyMetrics
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - days)
        return metrics.filter(m => new Date(m.date) >= cutoffDate)
      },

      getTodayMetrics: () => {
        const today = getTodayDate()
        return get().dailyMetrics.find(m => m.date === today)
      },

      getWeeklyStats: () => {
        const weekMetrics = get().getMetricsForPeriod(7)
        const sent = weekMetrics.reduce((sum, m) => sum + m.sent, 0)
        const received = weekMetrics.reduce((sum, m) => sum + m.received, 0)
        const totalResponseTime = weekMetrics.reduce((sum, m) => sum + m.responseTimeSum, 0)
        const totalResponseCount = weekMetrics.reduce((sum, m) => sum + m.responseCount, 0)
        
        return {
          sent,
          received,
          avgResponseTime: totalResponseCount > 0 ? Math.round(totalResponseTime / totalResponseCount / 1000) : 0
        }
      }
    }),
    {
      name: 'metrics-storage',
    }
  )
)
