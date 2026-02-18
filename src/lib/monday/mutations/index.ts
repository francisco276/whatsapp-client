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

export const changeColumnValue = `
  mutation ($boardId: ID!, $itemId: ID!, $columnId: String!, $value: JSON!) {
    change_column_value (
      board_id: $boardId,
      item_id: $itemId,
      column_id: $columnId,
      value: $value
    ) {
      id
    }
  }
`

export const createUpdate = `
  mutation ($itemId: ID!, $body: String!) {
    create_update (
      item_id: $itemId,
      body: $body
    ) {
      id
    }
  }
`
