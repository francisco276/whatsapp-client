export const notification = `
  mutation ($userId: ID!, $targetId: ID!, $message: String! ) {
    create_notification (
      user_id: $userId, 
      target_id: $targetId, 
      text: $message, 
      target_type: Project) {
      text
    }
  }
`
