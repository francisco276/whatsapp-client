import { useContext } from 'react'
import { BoardContext } from '@/components/providers/board/board-context'

export const useBoardId = () => {
  return useContext(BoardContext)
}
