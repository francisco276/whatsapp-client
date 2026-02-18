export const getPhoneColumnsByItemId = `
  query getColumnById ($itemId: ID!, $columnId: String!) {
    items (ids: [$itemId]) {
      column_values (ids: [$columnId]) {
        id
        text
        value
        ... on PhoneValue {
          country_short_name
          phone
        }
        ... on MirrorValue {
          display_value
        }
      }
    }
  }
`

export const getAllColumnValuesFromItem = `
  query getAllColumnValues ($itemId: ID!) {
    items (ids: [$itemId]) {
      column_values {
        id
        text
        value
        ... on PhoneValue {
          country_short_name
          phone
        }
        ... on MirrorValue {
          display_value
        }
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

export const getBoardColumns = `
  query ($boardId: ID!) {
    boards (ids: [$boardId]) {
      columns {
        id
        title
        type
      }
    }
  }
`
