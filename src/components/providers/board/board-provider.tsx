import { BoardContext } from './board-context'

type BoardProviderProps = {
  children: React.ReactNode
  boardId: string
}

export const BoardProvider = ({ children, boardId }: BoardProviderProps) => {
  return (
    <BoardContext.Provider value={boardId}>
      {children}
    </BoardContext.Provider>
  )
}
