import type { Authorization } from '@/services/authorizations'

interface RoleInformation {
  sendMessage: boolean
  editRole: boolean
  deleteUser: boolean
  addSession: boolean
  removeSession: boolean
}

export const getRoleInformation = (authorization: Authorization): RoleInformation => {
  if (authorization.role === 'admin') {
    return {
      sendMessage: true,
      editRole: true,
      deleteUser: true,
      addSession: true,
      removeSession: true
    }
  }

  if (authorization.role === 'user') {
    return {
      sendMessage: true,
      editRole: false,
      deleteUser: false,
      addSession: true,
      removeSession: true
    }
  }

  return {
    sendMessage: false,
    editRole: false,
    deleteUser: false,
    addSession: false,
    removeSession: false
  }
}
