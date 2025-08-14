import { UserContext } from './user-context'

type UserProviderProps = {
  children: React.ReactNode
  userId: string
}

export const UserProvider = ({ children, userId }: UserProviderProps) => {
  return (
    <UserContext.Provider value={userId}>
      {children}
    </UserContext.Provider>
  )
}
