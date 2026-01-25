import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MessageQueueProvider } from './providers/message-queue-provider'

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MessageQueueProvider>
        {children}
      </MessageQueueProvider>
    </QueryClientProvider>
  )
}