export const getPhoneColumnsByItemId = `
  query getColumnById ($itemId: ID!, $columnId: String!) {
    items (ids: [$itemId]) {
      column_values (ids: [$columnId]) {
        id
        value
        text
      }
    }
  }
`

export const getAllColumnValuesFromItem = `
  query getAllColumnValues ($itemId: ID!) {
    items (ids: [$itemId]) {
      column_values {
        id
        value
        text
      }
    }
  }
`

export const getUsers = `
  query {
    users(limit: 500, page: 1) {
      id
      email
      name
      photo_thumb
    }
  }
`

export const getUsersWithName = `
  query ($name: String!) {
    users(limit: 500, page: 1, name: $name) {
      id
      email
      name
      photo_thumb
    }
  }
`
