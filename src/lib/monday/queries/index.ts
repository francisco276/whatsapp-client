export const getPhoneColumnsByItemId = `
  query getColumnById ($itemId: ID!, $columnId: String!) {
    items (ids: [$itemId]) {
      column_values (ids: [$columnId]) {
        id
        value
        ... on MirrorValue {
          value
          display_value
          text
          __typename
        }
        ... on PhoneValue {
          country_short_name
          phone
          __typename
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
