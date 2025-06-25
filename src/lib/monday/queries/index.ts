export const getPhoneColumnsByItemId = `
  query ($id: ID!) {
    items (ids: [$id]) {
      column_values (types: [phone]) {
        id
        value
        ... on PhoneValue {
          country_short_name
          phone
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
